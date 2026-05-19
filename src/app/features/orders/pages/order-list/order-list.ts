import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Customer } from '../../../../core/services/customer';
import { Order } from '../../../../core/services/order';
import { CustomerDTO } from '../../../../core/types/customer';
import { OrderDTO, OrderStatus } from '../../../../core/types/order';
import { AlertService } from '../../../../shared/alert.service';

@Component({
  selector: 'app-order-list',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  private readonly orderApi = inject(Order);
  private readonly customerApi = inject(Customer);
  private readonly snackBar = inject(MatSnackBar);
  private readonly alert = inject(AlertService);

  readonly isLoading = signal(false);
  readonly orders = signal<OrderDTO[]>([]);
  readonly customers = signal<CustomerDTO[]>([]);

  readonly filterCustomerId = signal<number | null>(null);
  readonly filterEstado = signal<string>('');
  readonly filterInicio = signal<Date | null>(null);
  readonly filterFin = signal<Date | null>(null);

  readonly estados: OrderStatus[] = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];

  readonly displayedColumns = computed(() => [
    'descripcion',
    'customer',
    'total',
    'estado',
    'fecha',
    'actions',
  ]);

  constructor() {
    this.loadCustomers();
    this.load();
  }

  loadCustomers(): void {
    this.customerApi.list(undefined).subscribe({
      next: (res) => this.customers.set(res ?? []),
      error: () => this.customers.set([]),
    });
  }

  load(): void {
    this.isLoading.set(true);
    this.orderApi
      .list({
        clienteId: this.filterCustomerId() ?? undefined,
        estado: this.filterEstado() || undefined,
        fechaInicio: this.filterInicio() ?? undefined,
        fechaFin: this.filterFin() ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.orders.set(res ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snackBar.open('No fue posible cargar pedidos.', 'Cerrar', { duration: 4000 });
        },
      });
  }

  clearFilters(): void {
    this.filterCustomerId.set(null);
    this.filterEstado.set('');
    this.filterInicio.set(null);
    this.filterFin.set(null);
    this.load();
  }

  async delete(order: OrderDTO): Promise<void> {
    if (!order.id) return;
    const ok = await this.alert.confirm({
      title: 'Eliminar pedido',
      text: `Se eliminará el pedido #${order.id}.`,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!ok) return;

    this.orderApi.delete(order.id).subscribe({
      next: () => this.load(),
      error: () => this.snackBar.open('No fue posible eliminar el pedido.', 'Cerrar', { duration: 4000 }),
    });
  }

  setStatus(order: OrderDTO, estado: OrderStatus): void {
    if (!order.id) return;
    this.orderApi.updateStatus(order.id, estado).subscribe({
      next: () => this.load(),
      error: () =>
        this.snackBar.open('No fue posible actualizar el estado.', 'Cerrar', { duration: 4000 }),
    });
  }
}
