import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { CustomerForm } from './features/customers/pages/customer-form/customer-form';
import { CustomerList } from './features/customers/pages/customer-list/customer-list';
import { DashboardHome } from './features/dashboard/pages/dashboard-home/dashboard-home';
import { OrderForm } from './features/orders/pages/order-form/order-form';
import { OrderList } from './features/orders/pages/order-list/order-list';
import { Layout } from './layout/layout/layout';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'app/dashboard' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: 'app',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardHome },
      { path: 'customers', component: CustomerList },
      { path: 'customers/new', component: CustomerForm },
      { path: 'customers/:id/edit', component: CustomerForm },
      { path: 'orders', component: OrderList },
      { path: 'orders/new', component: OrderForm },
      { path: 'orders/:id/edit', component: OrderForm },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'app/dashboard' },
];
