import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  label: string;
  route?: string;
  icon?: string;
  children?: SidebarItem[];
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-full">
      <!-- Sidebar -->
      <div
        [class]="sidebarClasses"
        class="shadow-soft flex flex-col transition-all duration-300 ease-in-out"
      >
                <!-- Logo/Brand -->
        <div class="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-100">
          <div class="flex items-center">
            <img src="assets/logo-icon.png" [alt]="brandName" [class]="isOpen ? 'h-12 w-auto' : 'h-8 w-8'">
            <img *ngIf="isOpen" src="assets/logo-name.png" [alt]="brandName" class="h-8 w-auto ml-2">
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <ng-container *ngFor="let item of navigationItems">
            <!-- Item with children -->
            <div *ngIf="item.children && item.children.length > 0">
              <button
                (click)="toggleSection(item.label)"
                [class]="getSectionClasses(item)"
                class="group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                [title]="!isOpen ? item.label : ''"
              >
                <i *ngIf="item.icon" [class]="item.icon" class="h-5 w-5 flex-shrink-0 flex items-center justify-center"></i>
                <span *ngIf="isOpen" class="flex-1 text-left ml-3">{{ item.label }}</span>
                <svg
                  *ngIf="isOpen"
                  [class]="isSectionOpen(item.label) ? 'rotate-180' : ''"
                  class="ml-3 h-4 w-4 transition-transform duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <!-- Children -->
              <div
                *ngIf="isSectionOpen(item.label) && isOpen"
                class="ml-4 mt-1 space-y-1"
              >
                                 <a
                   *ngFor="let child of item.children"
                   [routerLink]="child.route"
                   routerLinkActive="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                   class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                 >
                  <i *ngIf="child.icon" [class]="child.icon" class="mr-3 h-4 w-4 flex items-center justify-center"></i>
                  <span class="flex-1">{{ child.label }}</span>
                  <span
                    *ngIf="child.badge"
                    [class]="getBadgeClasses(child.badgeColor)"
                    class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ child.badge }}
                  </span>
                </a>
              </div>
            </div>

            <!-- Single item -->
            <a
              *ngIf="!item.children || item.children.length === 0"
              [routerLink]="item.route"
              routerLinkActive="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
              class="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              [title]="!isOpen ? item.label : ''"
            >
              <i *ngIf="item.icon" [class]="item.icon" class="h-5 w-5 flex-shrink-0 flex items-center justify-center"></i>
              <span *ngIf="isOpen" class="flex-1 ml-3">{{ item.label }}</span>
              <span
                *ngIf="item.badge && isOpen"
                [class]="getBadgeClasses(item.badgeColor)"
                class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              >
                {{ item.badge }}
              </span>
            </a>
          </ng-container>
        </nav>

        <!-- User section -->
        <div *ngIf="user" class="border-t border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <img
                *ngIf="user.avatar"
                [src]="user.avatar"
                [alt]="user.name"
                class="h-8 w-8 rounded-full"
              >
              <div
                *ngIf="!user.avatar"
                class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium"
              >
                {{ user.name.charAt(0) }}
              </div>
            </div>
            <div *ngIf="isOpen" class="ml-3">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ user.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay for mobile -->
      <div
        *ngIf="isOpen && showToggle"
        (click)="closeSidebar()"
        class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
      ></div>
    </div>
  `,
  styles: []
})
export class SidebarComponent {
  @Input() brandName = 'Hawkeye';
  @Input() logo?: string;
  @Input() navigationItems: SidebarItem[] = [];
  @Input() user?: {name: string, email: string, avatar?: string};
  @Input() showToggle = true;
  @Input() isOpen = true;
  @Input() width = 'w-64';

  openSections: Set<string> = new Set();

  get sidebarClasses(): string {
    const baseClasses = 'bg-white dark:bg-gray-800 shadow-soft flex flex-col transition-all duration-300 ease-in-out';
    const widthClass = this.isOpen ? this.width : 'w-16';
    const mobileClasses = this.showToggle ? 'fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0' : '';
    const transformClass = !this.isOpen && this.showToggle ? '-translate-x-full lg:translate-x-0' : '';
    
    return `${baseClasses} ${widthClass} ${mobileClasses} ${transformClass}`;
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  toggleSection(sectionLabel: string): void {
    if (this.openSections.has(sectionLabel)) {
      this.openSections.delete(sectionLabel);
    } else {
      this.openSections.add(sectionLabel);
    }
  }

  isSectionOpen(sectionLabel: string): boolean {
    return this.openSections.has(sectionLabel);
  }

  getSectionClasses(item: SidebarItem): string {
    const isOpen = this.isSectionOpen(item.label);
    return isOpen 
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' 
      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700';
  }

  getBadgeClasses(color: string = 'danger'): string {
    const colorClasses = {
      primary: 'bg-primary-100 text-primary-900',
      secondary: 'bg-secondary-100 text-secondary-900',
      success: 'bg-success-100 text-success-900',
      danger: 'bg-danger-100 text-danger-900',
      warning: 'bg-warning-100 text-warning-900',
      info: 'bg-info-100 text-info-900'
    };
    
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.danger;
  }
}
