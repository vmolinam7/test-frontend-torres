import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';

import { DashboardHome } from './dashboard-home';
import { Dashboard } from '../../../../core/services/dashboard';

describe('DashboardHome', () => {
  let component: DashboardHome;
  let fixture: ComponentFixture<DashboardHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHome],
      providers: [
        {
          provide: Dashboard,
          useValue: {
            getStats: () => NEVER,
            getActivity: () => NEVER,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
