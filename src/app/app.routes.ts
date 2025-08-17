import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/logout',
    loadComponent: () => import('./pages/auth/signout/signout.component').then(m => m.SignoutComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
