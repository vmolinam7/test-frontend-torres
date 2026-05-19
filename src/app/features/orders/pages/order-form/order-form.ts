import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Customer } from '../../../../core/services/customer';
import { Order } from '../../../../core/services/order';
import { CustomerDTO } from '../../../../core/types/customer';
import { OrderDTO, OrderStatus } from '../../../../core/types/order';
import { finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-order-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
})
export class OrderForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderApi = inject(Order);
  private readonly customerApi = inject(Customer);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly orderId = signal<number | null>(null);
  readonly originalEstado = signal<OrderStatus>('PENDIENTE');
  readonly customers = signal<CustomerDTO[]>([]);
  readonly estados: OrderStatus[] = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];

  readonly form = this.fb.nonNullable.group({
    customerId: [0, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    estado: ['PENDIENTE'],
  });

  constructor() {
    this.loadCustomers();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (Number.isFinite(id)) {
      this.orderId.set(id);
      this.load(id);
    }
  }

  loadCustomers(): void {
    this.customerApi.list(true).subscribe({
      next: (res) => this.customers.set(res ?? []),
      error: () => this.customers.set([]),
    });
  }

  load(id: number): void {
    this.isLoading.set(true);
    this.orderApi.getById(id).subscribe({
      next: (order) => {
        this.isLoading.set(false);
        const patch: OrderDTO = order ?? ({} as OrderDTO);
        this.originalEstado.set(patch.estado ?? 'PENDIENTE');
        this.form.patchValue({
          customerId: patch.customerId ?? 0,
          descripcion: patch.descripcion ?? '',
          cantidad: patch.cantidad ?? 1,
          precioUnitario: patch.precioUnitario ?? 0,
          estado: patch.estado ?? 'PENDIENTE',
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('No fue posible cargar el pedido.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const id = this.orderId();
    const payload = this.form.getRawValue();

    if (!id) {
      this.orderApi
        .create(payload)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: async () => {
            await this.router.navigate(['/app/orders']);
          },
          error: (err) => {
            const message =
              err?.error?.mensaje || err?.error?.message || 'No fue posible guardar el pedido.';
            this.snackBar.open(message, 'Cerrar', { duration: 4000 });
          },
        });
      return;
    }

    const desiredEstado: OrderStatus = payload.estado ?? 'PENDIENTE';
    const updatePayload: OrderDTO = {
      customerId: payload.customerId,
      descripcion: payload.descripcion,
      cantidad: payload.cantidad,
      precioUnitario: payload.precioUnitario,
    };

    this.orderApi
      .update(id, updatePayload)
      .pipe(
        switchMap(() => {
          if (desiredEstado === this.originalEstado()) return of(null);
          return this.orderApi.updateStatus(id, desiredEstado);
        }),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: async () => {
          await this.router.navigate(['/app/orders']);
        },
        error: (err) => {
          const message =
            err?.error?.mensaje || err?.error?.message || 'No fue posible guardar el pedido.';
          this.snackBar.open(message, 'Cerrar', { duration: 4000 });
        },
      });
  }
}
