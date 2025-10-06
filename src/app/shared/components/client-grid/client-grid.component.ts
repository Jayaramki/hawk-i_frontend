import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export interface GridColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  template?: TemplateRef<any>;
}

export interface GridAction {
  label: string;
  icon?: string;
  class?: string;
  action: (item: any) => void;
  condition?: (item: any) => boolean; // Optional condition function
}

@Component({
  selector: 'app-client-grid',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th 
              *ngFor="let column of columns" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              [style.width]="column.width">
              <div class="flex items-center space-x-1">
                <span>{{ column.title }}</span>
                <button 
                  *ngIf="column.sortable" 
                  (click)="sort(column.key)"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <i class="fas fa-sort" 
                     [class.fa-sort-up]="sortColumn === column.key && sortDirection === 'asc'"
                     [class.fa-sort-down]="sortColumn === column.key && sortDirection === 'desc'"></i>
                </button>
              </div>
            </th>
            <th *ngIf="actions && actions.length > 0" 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Loading State -->
          <tr *ngIf="loading" class="animate-pulse">
            <td [attr.colspan]="getColspan()" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              {{ loadingMessage || 'Loading...' }}
            </td>
          </tr>
          
          <!-- Empty State -->
          <tr *ngIf="!loading && paginatedData.length === 0">
            <td [attr.colspan]="getColspan()" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              <i class="fas fa-inbox mr-2"></i>
              {{ emptyMessage || 'No data found' }}
            </td>
          </tr>
          
          <!-- Data Rows -->
          <tr *ngFor="let item of paginatedData" 
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
              [class]="rowClass ? rowClass(item) : ''">
            <td *ngFor="let column of columns" class="px-6 py-4 whitespace-nowrap">
              <ng-container *ngIf="column.template; else defaultCell">
                <ng-container *ngTemplateOutlet="column.template; context: { $implicit: item, column: column }"></ng-container>
              </ng-container>
              <ng-template #defaultCell>
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ getNestedProperty(item, column.key) }}
                </div>
              </ng-template>
            </td>
            <td *ngIf="actions && actions.length > 0" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button
                  *ngFor="let action of actions"
                  (click)="action.action(item)"
                  [class]="action.class || 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'"
                  [title]="action.label">
                  <i *ngIf="action.icon" [class]="action.icon"></i>
                  <span *ngIf="!action.icon">{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div *ngIf="totalPages > 1 || showRecordsPerPage" class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ getEndIndex() }} of {{ filteredData.length }} results
          </div>
          
          <!-- Records per page selector -->
          <div *ngIf="showRecordsPerPage" class="flex items-center space-x-2">
            <label class="text-sm text-gray-700 dark:text-gray-300">Show:</label>
            <select 
              class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              [value]="itemsPerPage"
              (change)="onRecordsPerPageChange($event)">
              <option *ngFor="let option of recordsPerPageOptions" [value]="option.value">{{ option.label }}</option>
            </select>
            <span class="text-sm text-gray-700 dark:text-gray-300">per page</span>
          </div>
        </div>
        
        <div *ngIf="totalPages > 1" class="flex items-center space-x-2">
          <app-button
            *ngIf="currentPage > 1"
            (click)="goToPage(currentPage - 1)"
            variant="secondary"
            size="sm">
            Previous
          </app-button>
          
          <!-- Page numbers -->
          <div class="flex space-x-1">
            <button
              *ngFor="let page of getPageNumbers()"
              (click)="goToPage(page)"
              class="px-3 py-1 text-sm rounded"
              [class]="page === currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'">
              {{ page }}
            </button>
          </div>
          
          <app-button
            *ngIf="currentPage < totalPages"
            (click)="goToPage(currentPage + 1)"
            variant="secondary"
            size="sm">
            Next
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class ClientGridComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: GridColumn[] = [];
  @Input() actions: GridAction[] = [];
  @Input() itemsPerPage: number = 20;
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = '';
  @Input() emptyMessage: string = '';
  @Input() rowClass: ((item: any) => string) | null = null;
  @Input() searchTerm: string = '';
  @Input() searchFields: string[] = [];
  @Input() sortable: boolean = true;
  @Input() showRecordsPerPage: boolean = true;
  @Input() recordsPerPageOptions: {label: string, value: number}[] = [
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() recordsPerPageChange = new EventEmitter<number>();

  filteredData: any[] = [];
  paginatedData: any[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Helper method for template
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
  }

  ngOnInit(): void {
    this.filterAndPaginate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only reset pagination if the data actually changed (not just reference)
    if ((changes['data'] && changes['data'].previousValue !== changes['data'].currentValue) || 
        changes['searchTerm'] || changes['searchFields']) {
      this.currentPage = 1;
      this.filterAndPaginate();
    }
  }

  private filterAndPaginate(): void {
    this.filterData();
    this.updatePagination();
  }

  private filterData(): void {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.data];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter(item => {
        if (this.searchFields.length === 0) {
          // Search all string properties if no specific fields provided
          return Object.values(item).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchLower)
          );
        } else {
          // Search only specified fields
          return this.searchFields.some(field => {
            const value = this.getNestedProperty(item, field);
            return typeof value === 'string' && value.toLowerCase().includes(searchLower);
          });
        }
      });
    }
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  sort(columnKey: string): void {
    if (!this.sortable) return;

    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const aValue = this.getNestedProperty(a, columnKey);
      const bValue = this.getNestedProperty(b, columnKey);
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePagination();
    this.sortChange.emit({ column: columnKey, direction: this.sortDirection });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      this.pageChange.emit(page);
    }
  }

  onRecordsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newItemsPerPage = +target.value;
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1;
    this.updatePagination();
    this.recordsPerPageChange.emit(newItemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getColspan(): number {
    return this.columns.length + (this.actions && this.actions.length > 0 ? 1 : 0);
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }
}

