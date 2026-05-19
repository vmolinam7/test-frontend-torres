import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DATA_API_BASE_URL } from '../config/api';

import { Order } from './order';

describe('Order', () => {
  let service: Order;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DATA_API_BASE_URL, useValue: 'http://localhost:8082' },
      ],
    });
    service = TestBed.inject(Order);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('lists orders with filters', () => {
    service.list({ clienteId: 1, estado: 'PENDIENTE' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8082/api/orders');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('clienteId')).toBe('1');
    expect(req.request.params.get('estado')).toBe('PENDIENTE');
    req.flush([]);
  });

  afterEach(() => httpMock.verify());
});
