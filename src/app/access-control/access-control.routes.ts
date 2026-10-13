import { Routes } from '@angular/router';

export const ACCESS_CONTROL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./access-control-view/access-control-view.component').then(
        m => m.AccessControlViewComponent
      )
  }
];
