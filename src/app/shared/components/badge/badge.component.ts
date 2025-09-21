import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <i *ngIf="icon" [class]="icon" class="mr-1"></i>
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    .badge {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
    }
    
    .badge-sm {
      @apply px-2 py-0.5 text-xs;
    }
    
    .badge-md {
      @apply px-2.5 py-0.5 text-xs;
    }
    
    .badge-lg {
      @apply px-3 py-1 text-sm;
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
    
    .badge-outline {
      @apply border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() icon?: string;

  get badgeClasses(): string {
    const baseClasses = 'badge';
    const sizeClass = `badge-${this.size}`;
    const variantClass = `badge-${this.variant}`;
    return `${baseClasses} ${sizeClass} ${variantClass}`;
  }
}
