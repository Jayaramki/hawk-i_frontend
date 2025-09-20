import { Injectable, signal } from '@angular/core';

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface NavbarItem {
  label: string;
  route: string;
}

export interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'danger' | 'info';
  children?: SidebarItem[];
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Signals for reactive state management
  private readonly userSignal = signal<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  });

  private readonly navbarItemsSignal = signal<NavbarItem[]>([
    { label: 'Dashboard', route: '/' },
    { label: 'Users', route: '/users' },
    { label: 'Reports', route: '/reports' },
    { label: 'Settings', route: '/settings' }
  ]);

  // Static sidebar items
  private readonly sidebarItemsSignal = signal([
      {
        label: 'Dashboard',
        route: '/',
        icon: 'fas fa-tachometer-alt'
      },
      {
        label: 'Adminstration',
        icon: 'fas fa-users',
        children: [
          { label: 'Employees', route: '/employees' },
          { label: 'Inatech Employees', route: '/inatech-employees' },
          { label: 'Attendance', route: '/attendance' },
        ]
      },
      {
        label: 'Analytics',
        icon: 'fas fa-chart-bar',
        children: [
          { label: 'Overview', route: '/analytics' },
          { label: 'Reports', route: '/analytics/reports' },
          { label: 'Sprint Metrics', route: '/analytics/sprint-metrics' },
          { label: 'Export', route: '/analytics/export' }
        ]
      },
      {
        label: 'Integrations',
        icon: 'fas fa-plug',
        children: [
          { label: 'Azure DevOps', route: '/integrations/azure-devops', icon: 'fab fa-microsoft' },
          { label: 'Azure DevOps Admin', route: '/integrations/azure-devops-admin', icon: 'fas fa-cogs' },
          { label: 'BambooHR', route: '/integrations/bamboohr', icon: 'fas fa-users-cog' }
        ]
      },
      {
        label: 'Settings',
        icon: 'fas fa-cog',
        children: [
          { label: 'General', route: '/settings' },
          { label: 'Security', route: '/settings/security' },
          { label: 'Notifications', route: '/settings/notifications' }
        ]
      },
      {
        label: 'Support',
        route: '/support',
        icon: 'fas fa-life-ring',
        badge: 'New',
        badgeColor: 'success' as const
      }
    ]);

  // Public signals for components to subscribe to
  user = this.userSignal.asReadonly();
  navbarItems = this.navbarItemsSignal.asReadonly();
  sidebarItems = this.sidebarItemsSignal.asReadonly();

  // Methods to update layout data using signals
  updateUser(user: User): void {
    this.userSignal.set(user);
  }

  updateNavbarItems(items: NavbarItem[]): void {
    this.navbarItemsSignal.set(items);
  }
}
