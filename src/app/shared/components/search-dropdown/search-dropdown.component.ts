import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

export interface SearchDropdownOption {
  label: string;
  value: any;
  searchText?: string; // Optional custom search text
}

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .search-dropdown-wrapper {
      position: relative;
      z-index: 1;
    }

    .search-dropdown-options {
      z-index: 9999 !important;
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
    }

    /* Ensure the dropdown breaks out of any overflow constraints */
    .search-dropdown-wrapper {
      overflow: visible !important;
    }

    /* Fix for parent containers that might clip the dropdown */
    :host {
      position: relative;
      z-index: 1;
    }

    /* Ensure dropdown appears above all other elements */
    .search-dropdown-options {
      z-index: 99999 !important;
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-height: 240px !important;
      overflow-y: auto !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    }

    /* Alternative approach - use transform to break out of container */
    .search-dropdown-options {
      transform: translateZ(0) !important;
      will-change: transform !important;
    }

    /* More targeted approach - only affect specific containers */
    :host ::ng-deep app-card {
      overflow: visible !important;
    }

    /* Specific targeting for common container classes */
    :host ::ng-deep app-card,
    :host ::ng-deep app-card > div,
    :host ::ng-deep .grid,
    :host ::ng-deep .space-y-6,
    :host ::ng-deep .space-y-6 > div,
    :host ::ng-deep .space-y-8,
    :host ::ng-deep .space-y-8 > div,
    :host ::ng-deep .p-6,
    :host ::ng-deep .p-6 > div {
      overflow: visible !important;
      position: relative !important;
    }

    /* Force all parent containers to allow overflow */
    :host ::ng-deep * {
      overflow: visible !important;
    }

    /* But restore normal overflow for specific elements that need it */
    :host ::ng-deep app-card > div:not(.search-dropdown-wrapper),
    :host ::ng-deep .grid > div:not(.search-dropdown-wrapper) {
      overflow: auto !important;
    }
  `],
  template: `
    <div class="relative search-dropdown-wrapper">
      <!-- Search Input -->
      <div class="relative">
        <input
          #searchInput
          type="text"
          class="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          [placeholder]="placeholder"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          (input)="onSearchInput()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        <!-- Icons container with proper spacing -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          <!-- Clear button (only show when there's a selection) -->
          <button
            *ngIf="clearable && selectedOption()"
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
            (click)="clearSelection($event)"
            (mousedown)="$event.preventDefault()"
          >
            <i class="fas fa-times"></i>
          </button>
          <!-- Search icon (only show when no selection or when searching) -->
          <i *ngIf="!selectedOption() || showDropdown()" class="fas fa-search text-gray-400"></i>
        </div>
      </div>

      <!-- Dropdown Options (hidden when using portal) -->
      <div 
        *ngIf="false" 
        class="search-dropdown-options w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
      >
        <div *ngIf="filteredOptions().length === 0" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          {{ noResultsText }}
        </div>
        <button
          *ngFor="let option of filteredOptions(); trackBy: trackByValue; let i = index"
          type="button"
          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          [class.bg-blue-100]="i === selectedIndex()"
          [class.text-blue-900]="i === selectedIndex()"
          (click)="selectOption(option)"
          (mouseenter)="selectedIndex.set(i)"
        >
          {{ option.label }}
        </button>
      </div>

    </div>
  `
})
export class SearchDropdownComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() options: SearchDropdownOption[] = [];
  @Input() placeholder: string = 'Search...';
  @Input() noResultsText: string = 'No results found';
  @Input() clearable: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() minSearchLength: number = 0;
  @Input() disabled: boolean = false;

  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

  @Output() selectionChange = new EventEmitter<SearchDropdownOption | null>();
  @Output() searchChange = new EventEmitter<string>();

  // Internal state
  searchTerm = signal('');
  showDropdownSignal = signal(false);
  selectedIndex = signal(-1);
  selectedOptionSignal = signal<SearchDropdownOption | null>(null);
  
  // Portal properties
  private portalElement: HTMLElement | null = null;
  private inputRect: DOMRect | null = null;
  
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Debounce search input
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchChange.emit(searchTerm);
      });
  }

  ngAfterViewInit(): void {
    // Initialize portal element
    this.createPortalElement();
    // Add scroll and resize listeners
    this.addEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.removeEventListeners();
    this.removePortalElement();
  }

  private createPortalElement(): void {
    this.portalElement = document.createElement('div');
    this.portalElement.className = 'search-dropdown-portal';
    this.portalElement.style.cssText = `
      position: fixed;
      z-index: 99999;
      pointer-events: none;
    `;
    document.body.appendChild(this.portalElement);
  }

  private removePortalElement(): void {
    if (this.portalElement) {
      document.body.removeChild(this.portalElement);
      this.portalElement = null;
    }
  }

  private updatePortalPosition(): void {
    if (this.searchInput && this.portalElement) {
      this.inputRect = this.searchInput.nativeElement.getBoundingClientRect();
      this.portalElement.style.cssText = `
        position: fixed;
        top: ${this.inputRect.bottom}px;
        left: ${this.inputRect.left}px;
        width: ${this.inputRect.width}px;
        z-index: 99999;
        pointer-events: auto;
      `;
    }
  }

  private addEventListeners(): void {
    // Listen for scroll events on window and all scrollable parents
    window.addEventListener('scroll', this.handleScroll.bind(this), true);
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Also listen for scroll events on the document
    document.addEventListener('scroll', this.handleScroll.bind(this), true);
  }

  private removeEventListeners(): void {
    window.removeEventListener('scroll', this.handleScroll.bind(this), true);
    window.removeEventListener('resize', this.handleResize.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this), true);
  }

  private handleScroll(): void {
    if (this.showDropdown() && this.portalElement) {
      this.updatePortalPosition();
    }
  }

  private handleResize(): void {
    if (this.showDropdown() && this.portalElement) {
      this.updatePortalPosition();
    }
  }

  // Computed properties
  showDropdown = computed(() => {
    const shouldShow = this.showDropdownSignal() && 
           !this.disabled && 
           this.searchTerm().length >= this.minSearchLength;
    return shouldShow;
  });

  selectedOption = computed(() => this.selectedOptionSignal());

  filteredOptions = computed(() => {
    if (!this.searchTerm() || this.searchTerm().length < this.minSearchLength) {
      return this.options;
    }

    const searchLower = this.searchTerm().toLowerCase();
    const filtered = this.options.filter(option => {
      const searchText = option.searchText || option.label;
      const matches = searchText.toLowerCase().includes(searchLower);
      return matches;
    });
    
    console.log(`Filtered ${filtered.length} options from ${this.options.length} total options`);
    return filtered;
  });

  // Event handlers
  onSearchInput(): void {
    console.log('Search input changed:', this.searchTerm());
    this.searchSubject.next(this.searchTerm());
    this.showDropdownSignal.set(true);
    this.selectedIndex.set(-1);
    if (this.showDropdown()) {
      this.renderPortalDropdown();
    }
  }


  onFocus(): void {
    if (!this.disabled) {
      this.showDropdownSignal.set(true);
      this.updatePortalPosition();
      this.renderPortalDropdown();
    }
  }

  onBlur(): void {
    // Delay hiding to allow click events to fire
    setTimeout(() => {
      this.showDropdownSignal.set(false);
      this.clearPortalDropdown();
    }, 150);
  }

  private renderPortalDropdown(): void {
    if (!this.portalElement) return;

    const filteredOptions = this.filteredOptions();
    const dropdownHTML = `
      <div class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
        ${filteredOptions.length === 0 
          ? `<div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">${this.noResultsText}</div>`
          : filteredOptions.map((option, index) => `
              <button
                type="button"
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${index === this.selectedIndex() ? 'bg-blue-100 text-blue-900' : ''}"
                data-index="${index}"
                data-value="${option.value}"
              >
                ${option.label}
              </button>
            `).join('')
        }
      </div>
    `;

    this.portalElement.innerHTML = dropdownHTML;
    this.portalElement.style.pointerEvents = 'auto';

    // Add click listeners
    this.portalElement.addEventListener('click', this.handlePortalClick.bind(this));
  }

  private clearPortalDropdown(): void {
    if (this.portalElement) {
      this.portalElement.innerHTML = '';
      this.portalElement.style.pointerEvents = 'none';
    }
  }

  private handlePortalClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      const index = parseInt(target.getAttribute('data-index') || '0');
      const option = this.filteredOptions()[index];
      if (option) {
        this.selectOption(option);
      }
    }
  }


  onKeyDown(event: KeyboardEvent): void {
    const filtered = this.filteredOptions();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.set(
          this.selectedIndex() < filtered.length - 1 
            ? this.selectedIndex() + 1 
            : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.set(
          this.selectedIndex() > 0 
            ? this.selectedIndex() - 1 
            : filtered.length - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex() >= 0 && this.selectedIndex() < filtered.length) {
          this.selectOption(filtered[this.selectedIndex()]);
        }
        break;
        
      case 'Escape':
        this.showDropdownSignal.set(false);
        this.selectedIndex.set(-1);
        break;
    }
  }

  selectOption(option: SearchDropdownOption): void {
    this.selectedOptionSignal.set(option);
    this.searchTerm.set(option.label);
    this.showDropdownSignal.set(false);
    this.selectedIndex.set(-1);
    
    // Clear the portal dropdown
    this.clearPortalDropdown();
    
    // Emit the change
    this.selectionChange.emit(option);
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    
    // Clear all state
    this.selectedOptionSignal.set(null);
    this.searchTerm.set('');
    this.showDropdownSignal.set(false);
    this.selectedIndex.set(-1);
    
    // Clear the portal dropdown
    this.clearPortalDropdown();
    
    // Emit the change
    this.selectionChange.emit(null);
    
    // Focus back to input
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Track by function for performance
  trackByValue(index: number, option: SearchDropdownOption): any {
    return option.value;
  }

  // Public methods for external control
  setSelectedOption(option: SearchDropdownOption | null): void {
    this.selectedOptionSignal.set(option);
    this.searchTerm.set(option ? option.label : '');
  }

  clear(): void {
    this.clearSelection(new Event('clear'));
  }
}
