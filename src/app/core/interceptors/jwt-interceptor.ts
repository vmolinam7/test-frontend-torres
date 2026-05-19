import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.getToken();

  if (!token) return next(req);
  if (req.headers.has('Authorization')) return next(req);

  const isAuthCall =
    req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  if (isAuthCall) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
