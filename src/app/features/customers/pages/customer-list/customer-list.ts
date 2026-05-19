import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Customer } from '../../../../core/services/customer';
import { CustomerDTO } from '../../../../core/types/customer';
import { AlertService } from '../../../../shared/alert.service';

@Component({
  selector: 'app-customer-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList {
  private readonly customerApi = inject(Customer);
  private readonly snackBar = inject(MatSnackBar);
  private readonly alert = inject(AlertService);

  readonly onlyActive = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly customers = signal<CustomerDTO[]>([]);

  readonly displayedColumns = computed(() => [
    'nombre',
    'email',
    'activo',
    'totalPedidos',
    'actions',
  ]);

  constructor() {
    this.load();
  }

  toggleOnlyActive(checked: boolean): void {
    this.onlyActive.set(checked);
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.customerApi.list(this.onlyActive() ? true : undefined).subscribe({
      next: (res) => {
        this.customers.set(res ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('No fue posible cargar clientes.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  async delete(customer: CustomerDTO): Promise<void> {
    if (!customer.id) return;
    const ok = await this.alert.confirm({
      title: 'Eliminar cliente',
      text: `Se eliminará ${customer.nombre} ${customer.apellido} y sus pedidos asociados.`,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!ok) return;

    this.customerApi.delete(customer.id).subscribe({
      next: () => this.load(),
      error: () =>
        this.snackBar.open('No fue posible eliminar el cliente.', 'Cerrar', { duration: 4000 }),
    });
  }
}
