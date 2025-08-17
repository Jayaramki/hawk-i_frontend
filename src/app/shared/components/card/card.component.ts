import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <div *ngIf="header" class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 class="text-lg font-semibold text-gray-900">{{ header }}</h3>
        <p *ngIf="subtitle" class="mt-1 text-sm text-gray-600">{{ subtitle }}</p>
      </div>
      
      <div class="p-6">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() header?: string;
  @Input() subtitle?: string;
  @Input() footer?: boolean;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-soft',
      lg: 'shadow-soft-lg',
      xl: 'shadow-soft-xl'
    };

    return `${baseClasses} ${shadowClasses[this.shadow]}`;
  }
}
