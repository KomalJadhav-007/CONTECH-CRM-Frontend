import { Routes } from '@angular/router';

export const SETTING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-view/settings-view.component').then(m => m.SettingsViewComponent)
  }
];
