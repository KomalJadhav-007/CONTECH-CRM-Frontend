import { Routes } from '@angular/router';

export const VISIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./visit-list/visit-list.component').then(m => m.VisitListComponent)
  },
  {
    path: 'book',
    loadComponent: () =>
      import('./visit-booking/visit-booking.component').then(m => m.VisitBookingComponent)
  },
  {
    path: 'discovery/:id',
    loadComponent: () =>
      import('./visit-discovery/visit-discovery.component').then(m => m.VisitDiscoveryComponent)
  }
];
