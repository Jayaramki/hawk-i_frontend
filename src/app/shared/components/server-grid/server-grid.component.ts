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
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

@Component({
  selector: 'app-server-grid',
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
          <tr *ngIf="!loading && data.length === 0">
            <td [attr.colspan]="getColspan()" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              <i class="fas fa-inbox mr-2"></i>
              {{ emptyMessage || 'No data found' }}
            </td>
          </tr>
          
          <!-- Data Rows -->
          <tr *ngFor="let item of data" 
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
    <div *ngIf="paginationInfo.totalPages > 1" class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Showing {{ paginationInfo.startIndex }} to {{ paginationInfo.endIndex }} of {{ paginationInfo.totalItems }} results
        </div>
        <div class="flex items-center space-x-2">
          <app-button
            *ngIf="paginationInfo.currentPage > 1"
            (click)="goToPage(paginationInfo.currentPage - 1)"
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
              [class]="page === paginationInfo.currentPage 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'">
              {{ page }}
            </button>
          </div>
          
          <app-button
            *ngIf="paginationInfo.currentPage < paginationInfo.totalPages"
            (click)="goToPage(paginationInfo.currentPage + 1)"
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
export class ServerGridComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: GridColumn[] = [];
  @Input() actions: GridAction[] = [];
  @Input() loading: boolean = false;
  @Input() loadingMessage: string = '';
  @Input() emptyMessage: string = '';
  @Input() rowClass: ((item: any) => string) | null = null;
  @Input() paginationInfo: PaginationInfo = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    startIndex: 0,
    endIndex: 0
  };

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    // Server-side grid doesn't need to filter or paginate data locally
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle any changes if needed
  }

  sort(columnKey: string): void {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ column: columnKey, direction: this.sortDirection });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.paginationInfo.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.paginationInfo.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.paginationInfo.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.paginationInfo.currentPage - 2);
      const end = Math.min(this.paginationInfo.totalPages, start + maxVisiblePages - 1);
      
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

