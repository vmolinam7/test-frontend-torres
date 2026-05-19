import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_API_BASE_URL } from '../config/api';
import { CustomerDTO } from '../types/customer';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DATA_API_BASE_URL);

  list(activo?: boolean): Observable<CustomerDTO[]> {
    let params = new HttpParams();
    if (activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<CustomerDTO[]>(`${this.baseUrl}/api/customers`, { params });
  }

  getById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.baseUrl}/api/customers/${id}`);
  }

  create(payload: CustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(`${this.baseUrl}/api/customers`, payload);
  }

  update(id: number, payload: CustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(`${this.baseUrl}/api/customers/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/customers/${id}`);
  }
}
