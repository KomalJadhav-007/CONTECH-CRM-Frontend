import { Routes } from '@angular/router';

export const CONTROL_TOWER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./control-tower-view/control-tower-view.component').then(m => m.ControlTowerViewComponent)
  }
];
