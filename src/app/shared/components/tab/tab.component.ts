import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string;
  badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-container">
      <!-- Tab Headers -->
      <div class="tab-headers" [class]="headerClasses">
        <button
          *ngFor="let tab of tabs"
          [class]="getTabHeaderClasses(tab)"
          [disabled]="tab.disabled"
          (click)="selectTab(tab.id)">
          <i *ngIf="tab.icon" [class]="tab.icon" class="mr-2"></i>
          {{ tab.label }}
          <span *ngIf="tab.badge" [class]="getBadgeClasses(tab.badgeColor)" class="ml-2">
            {{ tab.badge }}
          </span>
        </button>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content" [class]="contentClasses">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tab-container {
      @apply w-full;
    }
    
    .tab-headers {
      @apply flex border-b border-gray-200 dark:border-gray-700;
    }
    
    .tab-headers.vertical {
      @apply flex-col border-b-0 border-r border-gray-200 dark:border-gray-700;
    }
    
    .tab-header {
      @apply px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 
             hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
             transition-colors duration-200;
    }
    
    .tab-header.active {
      @apply text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400
             bg-blue-50 dark:bg-blue-900/20;
    }
    
    .tab-header.vertical.active {
      @apply border-b-0 border-r-2 border-blue-600 dark:border-blue-400;
    }
    
    .tab-header.disabled {
      @apply opacity-50 cursor-not-allowed;
    }
    
    .tab-content {
      @apply p-4;
    }
    
    .tab-content.vertical {
      @apply flex-1;
    }
    
    .badge {
      @apply px-2 py-1 text-xs font-medium rounded-full;
    }
    
    .badge-primary {
      @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
    }
    
    .badge-secondary {
      @apply bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200;
    }
    
    .badge-success {
      @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }
    
    .badge-warning {
      @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }
    
    .badge-danger {
      @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
    }
    
    .badge-info {
      @apply bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200;
    }
  `]
})
export class TabComponent implements AfterContentInit {
  @Input() tabs: TabItem[] = [];
  @Input() activeTab: string = '';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() variant: 'default' | 'pills' | 'underline' = 'default';
  
  @Output() tabChange = new EventEmitter<string>();

  get headerClasses(): string {
    const baseClasses = 'tab-headers';
    const orientationClass = this.orientation === 'vertical' ? 'vertical' : '';
    const variantClass = this.variant === 'pills' ? 'pills' : this.variant === 'underline' ? 'underline' : '';
    return `${baseClasses} ${orientationClass} ${variantClass}`;
  }

  get contentClasses(): string {
    const baseClasses = 'tab-content';
    const orientationClass = this.orientation === 'vertical' ? 'vertical' : '';
    return `${baseClasses} ${orientationClass}`;
  }

  getTabHeaderClasses(tab: TabItem): string {
    const baseClasses = 'tab-header';
    const activeClass = this.activeTab === tab.id ? 'active' : '';
    const disabledClass = tab.disabled ? 'disabled' : '';
    const sizeClass = `size-${this.size}`;
    return `${baseClasses} ${activeClass} ${disabledClass} ${sizeClass}`;
  }

  getBadgeClasses(badgeColor?: string): string {
    const baseClasses = 'badge';
    const colorClass = badgeColor ? `badge-${badgeColor}` : 'badge-secondary';
    return `${baseClasses} ${colorClass}`;
  }

  selectTab(tabId: string): void {
    if (this.activeTab !== tabId) {
      this.activeTab = tabId;
      this.tabChange.emit(tabId);
    }
  }

  ngAfterContentInit(): void {
    if (this.tabs.length > 0 && !this.activeTab) {
      this.activeTab = this.tabs[0].id;
    }
  }
}
