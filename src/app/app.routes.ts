import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'control-tower',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'SALES_MANAGER', 'ADMIN'] },
    loadChildren: () => import('./control-tower/control-tower.routes').then(m => m.CONTROL_TOWER_ROUTES)
  },
  {
    path: 'buyers',
    canActivate: [authGuard],
    loadChildren: () => import('./buyers/buyer.routes').then(m => m.BUYER_ROUTES)
  },
  {
    path: 'visits',
    canActivate: [authGuard],
    loadChildren: () => import('./visits/visit.routes').then(m => m.VISIT_ROUTES)
  },
  {
    path: 'my-trips',
    canActivate: [authGuard],
    loadChildren: () => import('./driver-portal/driver-trip.routes').then(m => m.DRIVER_TRIP_ROUTES)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./tasks/task.routes').then(m => m.TASK_ROUTES)
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN'] },
    loadChildren: () => import('./users/user.routes').then(m => m.USER_ROUTES)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN'] },
    loadChildren: () => import('./settings/settings.routes').then(m => m.SETTING_ROUTES)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
