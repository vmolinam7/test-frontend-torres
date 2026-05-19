import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  async confirm(options: {
    title: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title,
      text: options.text,
      icon: options.icon ?? 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Sí, continuar',
      cancelButtonText: options.cancelButtonText ?? 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });
    return result.isConfirmed;
  }
}

