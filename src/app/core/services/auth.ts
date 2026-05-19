import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { AUTH_API_BASE_URL } from '../config/api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = inject(AUTH_API_BASE_URL);

  private readonly tokenSubject = new BehaviorSubject<string | null>(this.readToken());
  readonly token$ = this.tokenSubject.asObservable();

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const exp = this.getJwtExp(token);
    if (!exp) return true;
    return Date.now() < exp * 1000;
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, payload).pipe(
      tap((res) => this.persistAuth(res)),
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/register`, payload).pipe(
      tap((res) => this.persistAuth(res)),
    );
  }

  validateToken(token = this.getToken()): Observable<boolean> {
    if (!token) return of(false);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get(`${this.baseUrl}/api/auth/validate`, { headers }).pipe(map(() => true));
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
    void this.router.navigate(['/auth/login']);
  }

  private persistAuth(res: AuthResponse): void {
    if (res?.token) {
      localStorage.setItem('auth_token', res.token);
      this.tokenSubject.next(res.token);
    }
  }

  private readToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getJwtExp(token: string): number | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      return typeof payload?.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return atob(padded);
  }
}
