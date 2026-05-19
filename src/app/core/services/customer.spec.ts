import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DATA_API_BASE_URL } from '../config/api';

import { Customer } from './customer';

describe('Customer', () => {
  let service: Customer;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DATA_API_BASE_URL, useValue: 'http://localhost:8082' },
      ],
    });
    service = TestBed.inject(Customer);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists customers with optional activo filter', () => {
    service.list(true).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8082/api/customers');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('activo')).toBe('true');
    req.flush([]);
  });

  afterEach(() => httpMock.verify());
});
