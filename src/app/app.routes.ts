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
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/analytics/revenue-analytics.component').then(m => m.RevenueAnalyticsComponent)
  },

  {
    path: 'high-intent',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/high-intent/high-intent-radar.component').then(m => m.HighIntentRadarComponent)
  },
  {
    path: 'control-tower',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'SALES_MANAGER', 'ADMIN'] },
    loadChildren: () => import('./dashboard/control-tower/control-tower.routes').then(m => m.CONTROL_TOWER_ROUTES)
  },
  {
    path: 'buyers',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/buyers/buyer.routes').then(m => m.BUYER_ROUTES)
  },
  {
    path: 'visits',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/visits/visit.routes').then(m => m.VISIT_ROUTES)
  },
  {
    path: 'my-trips',
    canActivate: [authGuard],
    loadChildren: () => import('./users/driver-portal/driver-trip.routes').then(m => m.DRIVER_TRIP_ROUTES)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/tasks/task.routes').then(m => m.TASK_ROUTES)
  },
  {
    path: 'alerts',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/alerts/alerts.component').then(m => m.AlertsComponent)
  },
  {
    path: 'projects',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'SALES_HEAD', 'SALES_MANAGER'] },
    loadComponent: () => import('./settings/projects/projects.component').then(m => m.ProjectsComponent)
  },
  {
    path: 'team',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'SALES_HEAD', 'SALES_MANAGER'] },
    loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'SALES_HEAD', 'SALES_MANAGER'] },
    loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'access-control',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'SALES_HEAD'] },
    loadChildren: () => import('./access-control/access-control.routes').then(m => m.ACCESS_CONTROL_ROUTES)
  },
  {
    path: 'settings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN', 'SALES_HEAD', 'SALES_MANAGER'] },
    loadComponent: () => import('./settings/settings-view/settings-view.component').then(m => m.SettingsViewComponent)
  },
  {
    path: 'audit-logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR', 'ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN'] },
    loadComponent: () => import('./settings/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
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
