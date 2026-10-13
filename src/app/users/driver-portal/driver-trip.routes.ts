import { Routes } from '@angular/router';

export const DRIVER_TRIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./driver-trips/driver-trips.component').then(m => m.DriverTripsComponent)
  }
];
