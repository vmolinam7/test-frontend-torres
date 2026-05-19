import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CustomerList } from './customer-list';
import { Customer } from '../../../../core/services/customer';

describe('CustomerList', () => {
  let component: CustomerList;
  let fixture: ComponentFixture<CustomerList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerList],
      providers: [
        provideRouter([]),
        {
          provide: Customer,
          useValue: {
            list: () => of([]),
            delete: () => of(void 0),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
