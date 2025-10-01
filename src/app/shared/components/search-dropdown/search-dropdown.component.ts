import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, computed } from '@angular/core';
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
  template: `
    <div class="relative">
      <!-- Search Input -->
      <div class="relative">
        <input
          type="text"
          class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          [placeholder]="placeholder"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          (input)="onSearchInput()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <i class="fas fa-search text-gray-400"></i>
        </div>
      </div>

      <!-- Dropdown Options -->
      <div 
        *ngIf="showDropdown()" 
        class="absolute z-[9999] w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
        style="top: 100%;"
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

      <!-- Selected Value Display (when not searching) -->
      <div 
        *ngIf="!showDropdown() && selectedOption()" 
        class="absolute inset-0 flex items-center px-3 py-2 pointer-events-none"
      >
        <span class="text-gray-900 dark:text-white">{{ selectedOption()?.label }}</span>
        <button
          *ngIf="clearable"
          type="button"
          class="ml-auto mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          (click)="clearSelection($event)"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .relative {
      position: relative;
    }
  `]
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  @Input() options: SearchDropdownOption[] = [];
  @Input() placeholder: string = 'Search...';
  @Input() noResultsText: string = 'No results found';
  @Input() clearable: boolean = true;
  @Input() debounceTime: number = 300;
  @Input() minSearchLength: number = 0;
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<SearchDropdownOption | null>();
  @Output() searchChange = new EventEmitter<string>();

  // Internal state
  searchTerm = signal('');
  showDropdownSignal = signal(false);
  selectedIndex = signal(-1);
  selectedOptionSignal = signal<SearchDropdownOption | null>(null);
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
  showDropdown = computed(() => {
    const shouldShow = this.showDropdownSignal() && 
           !this.disabled && 
           this.searchTerm().length >= this.minSearchLength;
    console.log('showDropdown computed:', {
      showDropdownSignal: this.showDropdownSignal(),
      disabled: this.disabled,
      searchTermLength: this.searchTerm().length,
      minSearchLength: this.minSearchLength,
      shouldShow
    });
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
      console.log(`Searching for "${searchLower}" in "${searchText}" - matches: ${matches}`);
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
  }


  onFocus(): void {
    if (!this.disabled) {
      this.showDropdownSignal.set(true);
    }
  }

  onBlur(): void {
    // Delay hiding to allow click events to fire
    setTimeout(() => {
      this.showDropdownSignal.set(false);
    }, 150);
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
    this.selectionChange.emit(option);
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedOptionSignal.set(null);
    this.searchTerm.set('');
    this.showDropdownSignal.set(false);
    this.selectedIndex.set(-1);
    this.selectionChange.emit(null);
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
