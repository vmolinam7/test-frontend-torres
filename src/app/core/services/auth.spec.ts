import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AUTH_API_BASE_URL } from '../config/api';

import { Auth } from './auth';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_API_BASE_URL, useValue: 'http://localhost:8081' },
      ],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('persists token on login', () => {
    service.login({ email: 'a@b.com', password: '123456' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8081/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'jwt.token.value', email: 'a@b.com', nombre: 'A' });

    expect(localStorage.getItem('auth_token')).toBe('jwt.token.value');
    expect(service.getToken()).toBe('jwt.token.value');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
