import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ label }}
        <span *ngIf="required" class="text-danger-500">*</span>
      </label>
      
      <div class="relative">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
        
        <div *ngIf="icon" class="absolute inset-y-0 right-0 flex items-center pr-3">
          <i [class]="icon" class="text-gray-400 dark:text-gray-500"></i>
        </div>
      </div>
      
      <p *ngIf="error" class="mt-1 text-sm text-danger-600">{{ error }}</p>
      <p *ngIf="hint && !error" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ hint }}</p>
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() id?: string;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() icon?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  value = '';
  touched = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputClasses(): string {
    const baseClasses = 'w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const errorClass = this.error ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : '';
    const iconClass = this.icon ? 'pr-10' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${errorClass} ${iconClass}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Handle focus if needed
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
