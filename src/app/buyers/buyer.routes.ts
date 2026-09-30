import { Routes } from '@angular/router';

export const BUYER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./buyer-list/buyer-list.component').then(m => m.BuyerListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./buyer-form/buyer-form.component').then(m => m.BuyerFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./buyer-details/buyer-details.component').then(m => m.BuyerDetailsComponent)
  }
];
