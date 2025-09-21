import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onOverlayClick($event)">
      <div [class]="modalClasses" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div *ngIf="title || showClose" class="modal-header">
          <h3 *ngIf="title" class="modal-title">{{ title }}</h3>
          <button 
            *ngIf="showClose"
            (click)="closeModal()"
            class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
        
        <!-- Modal Footer -->
        <div *ngIf="showFooter" class="modal-footer">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      @apply fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50;
    }
    
    .modal {
      @apply relative mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg;
    }
    
    .modal-sm {
      @apply w-96;
    }
    
    .modal-md {
      @apply w-1/2 max-w-2xl;
    }
    
    .modal-lg {
      @apply w-3/4 max-w-4xl;
    }
    
    .modal-xl {
      @apply w-5/6 max-w-6xl;
    }
    
    .modal-full {
      @apply w-full h-full max-w-none max-h-none rounded-none;
    }
    
    .modal-header {
      @apply flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700;
    }
    
    .modal-title {
      @apply text-lg font-semibold text-gray-900 dark:text-white;
    }
    
    .modal-close {
      @apply text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
             focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1;
    }
    
    .modal-body {
      @apply p-6;
    }
    
    .modal-footer {
      @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700;
    }
    
    .modal-top {
      @apply mt-20;
    }
    
    .modal-center {
      @apply mt-20;
    }
    
    .modal-bottom {
      @apply mt-auto mb-20;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() position: 'top' | 'center' | 'bottom' = 'center';
  @Input() showClose: boolean = true;
  @Input() showFooter: boolean = false;
  @Input() closeOnOverlay: boolean = true;
  @Input() closeOnEscape: boolean = true;
  
  @Output() closeEvent = new EventEmitter<void>();

  get modalClasses(): string {
    const baseClasses = 'modal';
    const sizeClass = `modal-${this.size}`;
    const positionClass = `modal-${this.position}`;
    return `${baseClasses} ${sizeClass} ${positionClass}`;
  }

  onOverlayClick(event: Event): void {
    if (this.closeOnOverlay) {
      this.closeModal();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.closeOnEscape && this.isOpen) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.closeEvent.emit();
  }
}