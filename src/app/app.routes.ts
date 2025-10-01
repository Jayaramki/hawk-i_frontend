import { Routes } from '@angular/router';

// Static imports for better AOT compilation
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignoutComponent } from './pages/auth/signout/signout.component';
import { SprintMetricsComponent } from './pages/analytics/sprint-metrics/sprint-metrics.component';
import { AzureDevOpsComponent } from './pages/integrations/azure-devops/azure-devops.component';
import { AzureDevOpsAdminComponent } from './pages/integrations/azure-devops-admin/azure-devops-admin.component';
import { BambooHRComponent } from './pages/integrations/bamboohr/bamboohr.component';
import { EmployeesUnifiedComponent } from './pages/employees-unified/employees-unified.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { TimeoffRequestsComponent } from './pages/administration/timeoff-requests/timeoff-requests.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'auth/logout',
    component: SignoutComponent
  },
  {
    path: 'analytics/sprint-metrics',
    component: SprintMetricsComponent
  },
  {
    path: 'integrations/azure-devops',
    component: AzureDevOpsComponent
  },
  {
    path: 'integrations/azure-devops-admin',
    component: AzureDevOpsAdminComponent
  },
  {
    path: 'integrations/bamboohr',
    component: BambooHRComponent
  },
  {
    path: 'employees',
    component: EmployeesUnifiedComponent
  },
  {
    path: 'attendance',
    component: AttendanceComponent
  },
  {
    path: 'administration/timeoff-requests',
    component: TimeoffRequestsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
