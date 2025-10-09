import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Auto-dismiss after this many milliseconds (0 = no auto-dismiss)
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 1;

  // Public readonly signal for components to subscribe to
  public readonly notifications$ = this.notifications.asReadonly();

  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      title,
      message,
      type: 'success',
      duration,
      timestamp: new Date()
    });
  }

  showError(title: string, message: string, duration: number = 0): void {
    this.addNotification({
      id: this.generateId(),
      title,
      message,
      type: 'error',
      duration,
      timestamp: new Date()
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      title,
      message,
      type: 'info',
      duration,
      timestamp: new Date()
    });
  }

  showWarning(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      title,
      message,
      type: 'warning',
      duration,
      timestamp: new Date()
    });
  }

  removeNotification(id: string): void {
    this.notifications.update(notifications => 
      notifications.filter(notification => notification.id !== id)
    );
  }

  clearAll(): void {
    this.notifications.set([]);
  }

  private addNotification(notification: Notification): void {
    this.notifications.update(notifications => [...notifications, notification]);

    // Auto-dismiss if duration is specified and > 0
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return `notification-${this.nextId++}`;
  }
}
