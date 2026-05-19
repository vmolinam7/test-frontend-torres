import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { provideRouter, Router } from '@angular/router';

import { authGuard } from './auth-guard';
import { Auth } from '../services/auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('redirects to login when not authenticated', () => {
    TestBed.overrideProvider(Auth, { useValue: { isAuthenticated: () => false } });
    const router = TestBed.inject(Router);

    const result = executeGuard({} as any, { url: '/app/dashboard' } as any);
    expect((result as any).toString()).toBe(router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: '/app/dashboard' } }).toString());
  });

  it('allows navigation when authenticated', () => {
    TestBed.overrideProvider(Auth, { useValue: { isAuthenticated: () => true } });
    const result = executeGuard({} as any, { url: '/app/dashboard' } as any);
    expect(result).toBe(true);
  });
});
