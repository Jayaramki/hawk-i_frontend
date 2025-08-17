import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent
  ],
  template: `
    <app-layout
      [user]="user"
      [navbarItems]="navbarItems"
      [sidebarItems]="sidebarItems"
    >
      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-heading text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p class="text-body text-gray-600 dark:text-gray-300">Welcome to your Hawkeye project management dashboard</p>
      </div>

            <!-- Top metric cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-success-500 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white text-sm font-medium">90%</p>
                    <p class="text-white text-xs opacity-90">Projects On Track</p>
                  </div>
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                    </div>

              <div class="bg-warning-500 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white text-sm font-medium">80%</p>
                    <p class="text-white text-xs opacity-90">Team Productivity</p>
                  </div>
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                </div>
                    </div>

              <div class="bg-info-500 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white text-sm font-medium">70%</p>
                    <p class="text-white text-xs opacity-90">Budget Utilization</p>
                  </div>
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                </div>
                    </div>

              <div class="bg-danger-500 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-white text-sm font-medium">47%</p>
                    <p class="text-white text-xs opacity-90">Risk Level</p>
                  </div>
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                  </div>
                  </div>
                </div>
            </div>

                        <!-- Main content cards -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <!-- Overview Section -->
              <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
                <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Project Overview</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Donut Chart 1 -->
                  <div class="flex flex-col items-center">
                    <div class="relative w-20 h-20 mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14b8a6" stroke-width="3" stroke-dasharray="75, 100"/>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                </div>
                    </div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Completed</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">75%</p>
                  </div>
                  
                  <!-- Donut Chart 2 -->
                  <div class="flex flex-col items-center">
                    <div class="relative w-20 h-20 mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" stroke-width="3" stroke-dasharray="60, 100"/>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">In Progress</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">60%</p>
                  </div>

                  <!-- Donut Chart 3 -->
                  <div class="flex flex-col items-center">
                    <div class="relative w-20 h-20 mb-3">
                      <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="45, 100"/>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
                        </svg>
                      </div>
                    </div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Planning</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">45%</p>
                  </div>
                </div>
              </div>

              <!-- Project Status -->
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
                <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Project Status</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Project</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">E-Commerce App</span>
              </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Manager</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Deadline</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">Dec 15, 2024</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                        </svg>
                      </div>
                      <span class="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">$45,000</span>
                    </div>
                    </div>
                  </div>
                </div>

            <!-- Bottom row cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <!-- Active Projects -->
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
                  </div>
                  <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Team Members -->
              <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Team Members</p>
                  </div>
                  <div class="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Create Project Button -->
              <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 shadow-card cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <div class="flex items-center justify-center">
                  <div class="w-12 h-12 bg-info-500 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">New Project</span>
                </div>
              </div>

              <!-- Reports Button -->
              <div class="bg-danger-500 rounded-lg p-6 shadow-card cursor-pointer hover:bg-danger-600 transition-colors">
                <div class="flex items-center justify-center">
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-white">Reports</span>
                </div>
              </div>

              <!-- Tasks Button -->
              <div class="bg-warning-500 rounded-lg p-6 shadow-card cursor-pointer hover:bg-warning-600 transition-colors">
                <div class="flex items-center justify-center">
                  <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-white">Tasks</span>
                </div>
              </div>
            </div>
    </app-layout>
  `,
  styles: []
})
export class DashboardComponent {
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  };



  navbarItems = [
    { label: 'Dashboard', route: '/' },
    { label: 'Users', route: '/users' },
    { label: 'Reports', route: '/reports' },
    { label: 'Settings', route: '/settings' }
  ];

  sidebarItems = [
    {
      label: 'Dashboard',
      route: '/',
      icon: 'fas fa-tachometer-alt'
    },
    {
      label: 'User Management',
      icon: 'fas fa-users',
      children: [
        { label: 'All Users', route: '/users', badge: '2.8k' },
        { label: 'Add User', route: '/users/add' },
        { label: 'User Groups', route: '/users/groups' }
      ]
    },
    {
      label: 'Analytics',
      icon: 'fas fa-chart-bar',
      children: [
        { label: 'Overview', route: '/analytics' },
        { label: 'Reports', route: '/analytics/reports' },
        { label: 'Export', route: '/analytics/export' }
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
  ];
}
