import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_API_BASE_URL } from '../config/api';
import { DashboardDTO } from '../types/dashboard';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(DATA_API_BASE_URL);

  getStats(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(`${this.baseUrl}/api/dashboard/stats`);
  }

  getActivity(): Observable<DashboardDTO> {
    return this.http.get<DashboardDTO>(`${this.baseUrl}/api/dashboard/activity`);
  }
}

