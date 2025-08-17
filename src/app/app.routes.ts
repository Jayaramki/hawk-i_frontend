import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  // Auth routes can be added later
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  // },
  {
    path: '**',
    redirectTo: ''
  }
];
