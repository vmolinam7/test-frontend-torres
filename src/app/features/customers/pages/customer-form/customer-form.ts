import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Customer } from '../../../../core/services/customer';
import { CustomerDTO } from '../../../../core/types/customer';

@Component({
  selector: 'app-customer-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css',
})
export class CustomerForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerApi = inject(Customer);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly customerId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    direccion: [''],
    activo: [true],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (Number.isFinite(id)) {
      this.customerId.set(id);
      this.load(id);
    }
  }

  load(id: number): void {
    this.isLoading.set(true);
    this.customerApi.getById(id).subscribe({
      next: (customer) => {
        this.isLoading.set(false);
        const patch: CustomerDTO = customer ?? ({} as CustomerDTO);
        this.form.patchValue({
          nombre: patch.nombre ?? '',
          apellido: patch.apellido ?? '',
          email: patch.email ?? '',
          telefono: patch.telefono ?? '',
          direccion: patch.direccion ?? '',
          activo: patch.activo ?? true,
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('No fue posible cargar el cliente.', 'Cerrar', { duration: 4000 });
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const payload = this.form.getRawValue();
    const id = this.customerId();

    const request$ = id ? this.customerApi.update(id, payload) : this.customerApi.create(payload);

    request$.subscribe({
      next: async () => {
        this.isSaving.set(false);
        await this.router.navigate(['/app/customers']);
      },
      error: (err) => {
        this.isSaving.set(false);
        const message =
          err?.error?.mensaje || err?.error?.message || 'No fue posible guardar el cliente.';
        this.snackBar.open(message, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
