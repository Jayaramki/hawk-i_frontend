import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <div 
        *ngFor="let notification of notifications()" 
        [class]="getNotificationClasses(notification.type)"
        class="p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out"
        [style.transform]="'translateX(0)'"
        [style.opacity]="'1'">
        
        <div class="flex items-start space-x-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <i [class]="getIconClass(notification.type)"></i>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium">{{ notification.title }}</h4>
            <p class="text-sm mt-1">{{ notification.message }}</p>
          </div>
          
          <!-- Close button -->
          <button 
            (click)="removeNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications = this.notificationService.notifications$;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Component is ready to display notifications
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  getNotificationClasses(type: Notification['type']): string {
    const baseClasses = 'bg-white dark:bg-gray-800 border shadow-lg';
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-l-green-500 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseClasses} border-l-red-500 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseClasses} border-l-yellow-500 text-yellow-800 dark:text-yellow-200`;
      case 'info':
      default:
        return `${baseClasses} border-l-blue-500 text-blue-800 dark:text-blue-200`;
    }
  }

  getIconClass(type: Notification['type']): string {
    const baseClasses = 'w-5 h-5';
    
    switch (type) {
      case 'success':
        return `${baseClasses} fas fa-check-circle text-green-500`;
      case 'error':
        return `${baseClasses} fas fa-exclamation-circle text-red-500`;
      case 'warning':
        return `${baseClasses} fas fa-exclamation-triangle text-yellow-500`;
      case 'info':
      default:
        return `${baseClasses} fas fa-info-circle text-blue-500`;
    }
  }
}
