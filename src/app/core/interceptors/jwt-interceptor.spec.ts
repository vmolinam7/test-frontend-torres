import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { jwtInterceptor } from './jwt-interceptor';
import { Auth } from '../services/auth';

describe('jwtInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        {
          provide: Auth,
          useValue: {
            getToken: () => 'test.jwt',
          },
        },
      ],
    });
  });

  it('adds Authorization header', () => {
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/customers').subscribe();

    const req = httpMock.expectOne('/api/customers');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test.jwt');
    req.flush([]);

    httpMock.verify();
  });

  it('does not add token to login/register calls', () => {
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.post('/api/auth/login', { email: 'a', password: 'b' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ token: 'x' });

    httpMock.verify();
  });
});
