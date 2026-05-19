import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { OrderList } from './order-list';
import { Order } from '../../../../core/services/order';
import { Customer } from '../../../../core/services/customer';

describe('OrderList', () => {
  let component: OrderList;
  let fixture: ComponentFixture<OrderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderList],
      providers: [
        provideRouter([]),
        {
          provide: Order,
          useValue: {
            list: () => of([]),
            delete: () => of(void 0),
            updateStatus: () => of({}),
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

    fixture = TestBed.createComponent(OrderList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
