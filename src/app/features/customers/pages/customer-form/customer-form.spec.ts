import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CustomerForm } from './customer-form';
import { Customer } from '../../../../core/services/customer';

describe('CustomerForm', () => {
  let component: CustomerForm;
  let fixture: ComponentFixture<CustomerForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerForm],
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
          provide: Customer,
          useValue: {
            getById: () => of({ id: 1, nombre: 'A', apellido: 'B', email: 'a@b.com', activo: true }),
            create: () => of({ id: 1, nombre: 'A', apellido: 'B', email: 'a@b.com', activo: true }),
            update: () => of({ id: 1, nombre: 'A', apellido: 'B', email: 'a@b.com', activo: true }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
