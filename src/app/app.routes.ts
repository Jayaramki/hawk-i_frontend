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
    path: 'analytics/sprint-metrics',
    loadComponent: () => import('./pages/analytics/sprint-metrics/sprint-metrics.component').then(m => m.SprintMetricsComponent)
  },
  {
    path: 'integrations/azure-devops',
    loadComponent: () => import('./pages/integrations/azure-devops/azure-devops.component').then(m => m.AzureDevOpsComponent)
  },
  {
    path: 'integrations/azure-devops-admin',
    loadComponent: () => import('./pages/integrations/azure-devops-admin/azure-devops-admin.component').then(m => m.AzureDevOpsAdminComponent)
  },
  {
    path: 'integrations/bamboohr',
    loadComponent: () => import('./pages/integrations/bamboohr/bamboohr.component').then(m => m.BambooHRComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'attendance',
    loadComponent: () => import('./pages/attendance/attendance.component').then(m => m.AttendanceComponent)
  },
  {
    path: 'inatech-employees',
    loadComponent: () => import('./pages/inatech-employees/inatech-employees.component').then(m => m.InatechEmployeesComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
