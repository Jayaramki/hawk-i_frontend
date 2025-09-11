import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ label }}
        </span>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ value }}%
        </span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          [style.width.%]="value"
          [class]="colorClass"
        ></div>
      </div>
      <div *ngIf="showText" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ text }}
      </div>
    </div>
  `,
  styles: []
})
export class ProgressComponent {
  @Input() value: number = 0;
  @Input() label: string = 'Progress';
  @Input() text: string = '';
  @Input() showText: boolean = false;
  @Input() color: 'blue' | 'green' | 'red' | 'yellow' = 'blue';

  get colorClass(): string {
    switch (this.color) {
      case 'green':
        return 'bg-green-600';
      case 'red':
        return 'bg-red-600';
      case 'yellow':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  }
}
