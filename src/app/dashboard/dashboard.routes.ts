import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-overview/dashboard-overview.component').then(m => m.DashboardOverviewComponent)
  }
];
