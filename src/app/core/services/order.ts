import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_API_BASE_URL } from '../config/api';
import { OrderDTO, OrderFilters, OrderStatus } from '../types/order';

@Injectable({
  providedIn: 'root',
})
export class Order {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DATA_API_BASE_URL);

  list(filters: OrderFilters = {}): Observable<OrderDTO[]> {
    let params = new HttpParams();
    if (filters.clienteId !== undefined) params = params.set('clienteId', String(filters.clienteId));
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.fechaInicio) params = params.set('fechaInicio', this.toIso(filters.fechaInicio));
    if (filters.fechaFin) params = params.set('fechaFin', this.toIso(filters.fechaFin));
    return this.http.get<OrderDTO[]>(`${this.baseUrl}/api/orders`, { params });
  }

  getById(id: number): Observable<OrderDTO> {
    return this.http.get<OrderDTO>(`${this.baseUrl}/api/orders/${id}`);
  }

  create(payload: OrderDTO): Observable<OrderDTO> {
    return this.http.post<OrderDTO>(`${this.baseUrl}/api/orders`, payload);
  }

  update(id: number, payload: OrderDTO): Observable<OrderDTO> {
    return this.http.put<OrderDTO>(`${this.baseUrl}/api/orders/${id}`, payload);
  }

  updateStatus(id: number, estado: OrderStatus): Observable<OrderDTO> {
    return this.http.patch<OrderDTO>(`${this.baseUrl}/api/orders/${id}/status`, { estado });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/orders/${id}`);
  }

  private toIso(value: Date | string): string {
    if (value instanceof Date) return value.toISOString();
    return new Date(value).toISOString();
  }
}
