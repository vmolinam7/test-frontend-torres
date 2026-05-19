import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { forkJoin } from 'rxjs';
import { Dashboard } from '../../../../core/services/dashboard';
import { DashboardDTO } from '../../../../core/types/dashboard';
import { NgApexchartsModule } from 'ng-apexcharts';
import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

type ActivityFilter = 'dia' | 'semana' | 'mes';

@Component({
  selector: 'app-dashboard-home',
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    NgApexchartsModule,
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome {
  private readonly dashboardApi = inject(Dashboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal(true);
  readonly stats = signal<DashboardDTO | null>(null);
  readonly activity = signal<DashboardDTO | null>(null);

  /** Current filter for the activity chart */
  readonly activityFilter = signal<ActivityFilter>('semana');

  private readonly MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  readonly donutSeries = computed<number[]>(() => {
    const s = this.stats();
    return [s?.pedidosCompletados ?? 0, s?.pedidosPendientes ?? 0, s?.pedidosCancelados ?? 0];
  });

  readonly donutLabels = ['Completados', 'Pendientes', 'Cancelados'];

  readonly donutChart = computed<{
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    tooltip: ApexTooltip;
    plotOptions: ApexPlotOptions;
  }>(() => ({
    chart: { type: 'donut', height: 340 },
    labels: this.donutLabels,
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (v: number) => `${v}` } },
    plotOptions: {
      pie: { donut: { size: '70%' } },
    },
  }));

  /** Unified activity chart that switches between day / week / month */
  readonly activityChart = computed<{
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
    fill: ApexFill;
    plotOptions: ApexPlotOptions;
  }>(() => {
    const filter = this.activityFilter();
    const act = this.activity();
    const dailyRaw = act?.actividadPorDia ?? [];

    // Parse backend data: [{ fecha: "2026-05-19", total: 4 }, ...]
    const allDays = this.parseDailyData(dailyRaw);

    let points: { labels: string[]; values: number[] };
    let chartType: 'area' | 'bar' = 'area';

    if (filter === 'dia') {
      // Show today only — use the most recent date from backend data
      if (allDays.length > 0) {
        const latest = allDays[allDays.length - 1];
        points = {
          labels: [this.formatLabel(latest.date)],
          values: [latest.count],
        };
      } else {
        points = { labels: ['Hoy'], values: [0] };
      }
      chartType = 'bar';
    } else if (filter === 'semana') {
      // Last 7 days — build range from backend's latest date
      const refDate = this.getRefDate(allDays);
      const last7 = this.buildDateRange(refDate, 7);
      points = this.fillDays(last7, allDays);
      chartType = 'area';
    } else {
      // Last 30 days — build range from backend's latest date
      const refDate = this.getRefDate(allDays);
      const last30 = this.buildDateRange(refDate, 30);
      points = this.fillDays(last30, allDays);
      chartType = 'area';
    }

    return {
      series: [{ name: 'Pedidos', data: points.values }],
      chart: { type: chartType, height: 340, toolbar: { show: false } },
      xaxis: { categories: points.labels },
      yaxis: { decimalsInFloat: 0, min: 0 },
      stroke: { curve: 'smooth', width: 2 },
      dataLabels: { enabled: false },
      tooltip: { x: { show: true } },
      fill: chartType === 'area'
        ? { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [50, 100] } }
        : { opacity: 1 },
      plotOptions: chartType === 'bar'
        ? { bar: { borderRadius: 4, columnWidth: '40%' } }
        : {},
    };
  });

  constructor() {
    forkJoin({
      stats: this.dashboardApi.getStats(),
      activity: this.dashboardApi.getActivity(),
    }).subscribe({
      next: (res) => {
        this.stats.set(res.stats ?? null);
        this.activity.set(res.activity ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('No fue posible cargar el dashboard.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  onFilterChange(value: ActivityFilter): void {
    this.activityFilter.set(value);
  }

  /**
   * Parse backend daily data: each item is { fecha: "2026-05-19", total: 4 }
   */
  private parseDailyData(list: Record<string, unknown>[]): { date: string; count: number }[] {
    const result: { date: string; count: number }[] = [];
    for (const item of list ?? []) {
      const fecha = item['fecha'] as string;
      const total = typeof item['total'] === 'number' ? item['total'] : Number(item['total']);
      if (fecha) {
        result.push({ date: fecha, count: Number.isFinite(total) ? total : 0 });
      }
    }
    return result;
  }

  /**
   * Get the reference date (most recent) from backend data,
   * so we build the date range using the server's timezone, not the browser's.
   */
  private getRefDate(data: { date: string; count: number }[]): Date {
    if (data.length > 0) {
      // Use the latest date from the backend
      const latest = data[data.length - 1].date; // "2026-05-19"
      const parts = latest.split('-');
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }
    // Fallback to local date
    return new Date();
  }

  /**
   * Build an array of date strings (YYYY-MM-DD) going back N days from refDate
   */
  private buildDateRange(refDate: Date, n: number): string[] {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - i);
      dates.push(this.formatDateISO(d));
    }
    return dates;
  }

  /**
   * Format a Date to YYYY-MM-DD
   */
  private formatDateISO(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format "2026-05-18" → "18 May"
   */
  private formatLabel(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${day} ${this.MONTHS[monthIdx] ?? ''}`;
  }

  /**
   * Fill requested date range with counts, showing 0 for days without data.
   */
  private fillDays(
    dates: string[],
    data: { date: string; count: number }[],
  ): { labels: string[]; values: number[] } {
    const map = new Map<string, number>();
    for (const d of data) {
      map.set(d.date, d.count);
    }

    const labels: string[] = [];
    const values: number[] = [];

    for (const date of dates) {
      labels.push(this.formatLabel(date));
      values.push(map.get(date) ?? 0);
    }

    return { labels, values };
  }
}
