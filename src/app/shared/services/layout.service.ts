import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  private userSubject = new BehaviorSubject<User>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  });

  private navbarItemsSubject = new BehaviorSubject<NavbarItem[]>([
    { label: 'Dashboard', route: '/' },
    { label: 'Users', route: '/users' },
    { label: 'Reports', route: '/reports' },
    { label: 'Settings', route: '/settings' }
  ]);

  private sidebarItemsSubject = new BehaviorSubject<SidebarItem[]>([
    {
      label: 'Dashboard',
      route: '/',
      icon: 'fas fa-tachometer-alt'
    },
    {
      label: 'Adminstration',
      icon: 'fas fa-users',
      children: [
        { label: 'Employees', route: '/employees', badge: '2.8k' },
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
      badgeColor: 'success'
    }
  ]);

  // Observables
  user$ = this.userSubject.asObservable();
  navbarItems$ = this.navbarItemsSubject.asObservable();
  sidebarItems$ = this.sidebarItemsSubject.asObservable();

  // Getters for current values
  get user(): User {
    return this.userSubject.value;
  }

  get navbarItems(): NavbarItem[] {
    return this.navbarItemsSubject.value;
  }

  get sidebarItems(): SidebarItem[] {
    return this.sidebarItemsSubject.value;
  }

  // Methods to update layout data
  updateUser(user: User): void {
    this.userSubject.next(user);
  }

  updateNavbarItems(items: NavbarItem[]): void {
    this.navbarItemsSubject.next(items);
  }

  updateSidebarItems(items: SidebarItem[]): void {
    this.sidebarItemsSubject.next(items);
  }
}
