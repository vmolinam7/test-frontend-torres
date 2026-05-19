import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderForm } from './order-form';
import { Order } from '../../../../core/services/order';
import { Customer } from '../../../../core/services/customer';

describe('OrderForm', () => {
  let component: OrderForm;
  let fixture: ComponentFixture<OrderForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderForm],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: Order,
          useValue: {
            getById: () => of({ id: 1, descripcion: 'X', cantidad: 1, precioUnitario: 10, customerId: 1 }),
            create: () => of({ id: 1, descripcion: 'X', cantidad: 1, precioUnitario: 10, customerId: 1 }),
            update: () => of({ id: 1, descripcion: 'X', cantidad: 1, precioUnitario: 10, customerId: 1 }),
          },
        },
        {
          provide: Customer,
          useValue: {
            list: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
