import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Removed PrimeNG imports - using custom design system components
import { ButtonComponent } from '../button/button.component';

export interface DataTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'dropdown' | 'date' | 'multiselect';
  filterOptions?: any[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'currency';
  template?: any;
}

export interface DataTableAction {
  label: string;
  icon?: string;
  command: (rowData: any) => void;
  visible?: (rowData: any) => boolean;
  disabled?: (rowData: any) => boolean;
  class?: string;
}

export interface DataTableFilter {
  field: string;
  value: any;
  matchMode: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'lt' | 'lte' | 'gt' | 'gte' | 'dateIs' | 'dateIsNot' | 'dateBefore' | 'dateAfter';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent
  ],
  template: `
    <div class="data-table-container">
      <!-- Global Search -->
      <div *ngIf="globalFilter" class="mb-4">
        <div class="flex items-center space-x-2">
          <i class="fas fa-search text-gray-400"></i>
          <input
            type="text"
            pInputText
            [(ngModel)]="searchTerm"
            (input)="onGlobalFilterChange($event)"
            placeholder="Search all columns..."
            class="flex-1"
          />
          <app-button
            *ngIf="searchTerm"
            (click)="clearGlobalFilter()"
            variant="secondary"
            size="sm">
            <i class="fas fa-times"></i>
          </app-button>
        </div>
      </div>

      <!-- Column Filters -->
      <div *ngIf="showColumnFilters && columns.some(col => col.filterable)" class="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let column of columns" [ngSwitch]="column.filterType">
            <!-- Text Filter -->
            <div *ngSwitchCase="'text'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ column.header }}
              </label>
              <input
                type="text"
                pInputText
                [(ngModel)]="columnFilters[column.field]"
                (input)="onColumnFilterChange(column.field, $event)"
                [placeholder]="'Filter by ' + column.header"
                class="w-full"
              />
            </div>

            <!-- Dropdown Filter -->
            <div *ngSwitchCase="'dropdown'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ column.header }}
              </label>
              <p-dropdown
                [options]="column.filterOptions"
                [(ngModel)]="columnFilters[column.field]"
                (onChange)="onColumnFilterChange(column.field, $event)"
                [placeholder]="'Select ' + column.header"
                [showClear]="true"
                class="w-full">
              </p-dropdown>
            </div>

            <!-- Date Filter -->
            <div *ngSwitchCase="'date'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ column.header }}
              </label>
              <p-calendar
                [(ngModel)]="columnFilters[column.field]"
                (onSelect)="onColumnFilterChange(column.field, $event)"
                [placeholder]="'Select date'"
                [showIcon]="true"
                class="w-full">
              </p-calendar>
            </div>

            <!-- MultiSelect Filter -->
            <div *ngSwitchCase="'multiselect'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ column.header }}
              </label>
              <p-multiSelect
                [options]="column.filterOptions"
                [(ngModel)]="columnFilters[column.field]"
                (onChange)="onColumnFilterChange(column.field, $event)"
                [placeholder]="'Select ' + column.header"
                [showClear]="true"
                class="w-full">
              </p-multiSelect>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex justify-end space-x-2">
          <app-button
            (click)="clearAllFilters()"
            variant="secondary"
            size="sm">
            <i class="fas fa-times mr-2"></i>
            Clear Filters
          </app-button>
        </div>
      </div>

      <!-- PrimeNG DataTable -->
      <p-table
        [value]="data"
        [columns]="columns"
        [paginator]="paginator"
        [rows]="rows"
        [totalRecords]="totalRecords"
        [lazy]="lazy"
        [loading]="loading"
        [sortField]="sortField"
        [sortOrder]="sortOrder"
        [multiSortMeta]="multiSortMeta"
        [selectionMode]="selectionMode"
        [(selection)]="selectedItems"
        [rowHover]="rowHover"
        [stripedRows]="stripedRows"
        [responsive]="responsive"
        [scrollable]="scrollable"
        [scrollHeight]="scrollHeight"
        [virtualScroll]="virtualScroll"
        [virtualScrollItemSize]="virtualScrollItemSize"
        [resizableColumns]="resizableColumns"
        [reorderableColumns]="reorderableColumns"
        [showCurrentPageReport]="showCurrentPageReport"
        [currentPageReportTemplate]="currentPageReportTemplate"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [globalFilterFields]="globalFilterFields"
        [filterDelay]="filterDelay"
        [exportFilename]="exportFilename"
        (onLazyLoad)="lazyLoad.emit($event)"
        (onPage)="pageChange.emit($event)"
        (onSort)="sortChange.emit($event)"
        (onRowSelect)="rowSelect.emit($event)"
        (onRowUnselect)="rowUnselect.emit($event)"
        (onSelectionChange)="selectionChange.emit($event)"
        (onColReorder)="colReorder.emit($event)"
        (onRowReorder)="rowReorder.emit($event)"
        styleClass="p-datatable-sm">
        
        <!-- Column Headers -->
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngFor="let col of columns" 
                [pSortableColumn]="col.sortable ? col.field : null"
                [pResizableColumn]="resizableColumns"
                [pReorderableColumn]="reorderableColumns"
                [style.width]="col.width"
                [style.text-align]="col.align || 'left'">
              {{ col.header }}
              <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
            </th>
            <th *ngIf="actions && actions.length > 0" 
                [pResizableColumn]="resizableColumns"
                [pReorderableColumn]="reorderableColumns">
              Actions
            </th>
          </tr>
        </ng-template>

        <!-- Column Filters -->
        <ng-template pTemplate="headergroup" let-columns>
          <tr>
            <th *ngFor="let col of columns" [style.width]="col.width">
              <div *ngIf="col.filterable" class="p-input-icon-left">
                <i class="fas fa-filter"></i>
                <input
                  *ngIf="col.filterType === 'text'"
                  type="text"
                  pInputText
                  [(ngModel)]="columnFilters[col.field]"
                  (input)="onColumnFilter(col.field, $event)"
                  [placeholder]="'Filter by ' + col.header"
                  class="w-full"
                />
                <p-dropdown
                  *ngIf="col.filterType === 'dropdown'"
                  [options]="col.filterOptions"
                  [(ngModel)]="columnFilters[col.field]"
                  (onChange)="onColumnFilter(col.field, $event)"
                  [placeholder]="'Select ' + col.header"
                  [showClear]="true"
                  class="w-full">
                </p-dropdown>
              </div>
            </th>
            <th *ngIf="actions && actions.length > 0"></th>
          </tr>
        </ng-template>

        <!-- Data Rows -->
        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr [pSelectableRow]="rowData" [pContextMenuRow]="rowData">
            <td *ngFor="let col of columns" 
                [style.text-align]="col.align || 'left'"
                [pTooltip]="getTooltip(rowData, col)"
                [tooltipPosition]="'top'">
              <ng-container *ngIf="col.template; else defaultCell">
                <ng-container *ngTemplateOutlet="col.template; context: { $implicit: rowData, rowIndex: rowIndex, column: col }"></ng-container>
              </ng-container>
              <ng-template #defaultCell>
                <span [innerHTML]="formatCellValue(rowData, col)"></span>
              </ng-template>
            </td>
            <td *ngIf="actions && actions.length > 0">
              <div class="flex space-x-2">
                <app-button
                  *ngFor="let action of actions"
                  (click)="action.command(rowData)"
                  [variant]="action.class?.includes('danger') ? 'danger' : 'secondary'"
                  size="sm"
                  [disabled]="action.disabled ? action.disabled(rowData) : false"
                  [class.hidden]="action.visible && !action.visible(rowData)">
                  <i *ngIf="action.icon" [class]="action.icon" class="mr-1"></i>
                  {{ action.label }}
                </app-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty State -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="getColspan()" class="text-center py-8">
              <div class="flex flex-col items-center">
                <i class="fas fa-inbox text-gray-400 text-4xl mb-2"></i>
                <p class="text-gray-500 dark:text-gray-400">{{ emptyMessage || 'No data found' }}</p>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Loading State -->
        <ng-template pTemplate="loadingbody">
          <tr>
            <td [attr.colspan]="getColspan()" class="text-center py-8">
              <div class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin text-blue-500 mr-2"></i>
                <span class="text-gray-500 dark:text-gray-400">{{ loadingMessage || 'Loading...' }}</span>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .data-table-container {
      @apply w-full;
    }
    
    :host ::ng-deep .p-datatable {
      @apply border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-header {
      @apply bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      @apply bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      @apply hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors;
    }
    
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr.p-highlight {
      @apply bg-blue-50 dark:bg-blue-900/20;
    }
    
    :host ::ng-deep .p-datatable .p-paginator {
      @apply bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700;
    }
    
    :host ::ng-deep .p-datatable .p-paginator .p-paginator-page {
      @apply text-gray-700 dark:text-gray-300;
    }
    
    :host ::ng-deep .p-datatable .p-paginator .p-paginator-page.p-highlight {
      @apply bg-blue-500 text-white;
    }
  `]
})
export class DataTableComponent implements OnInit, OnChanges {
  // Data inputs
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() actions: DataTableAction[] = [];
  
  // Pagination inputs
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() totalRecords: number = 0;
  @Input() lazy: boolean = false;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  
  // Sorting inputs
  @Input() sortField: string = '';
  @Input() sortOrder: number = 1;
  @Input() multiSortMeta: any[] = [];
  
  // Selection inputs
  @Input() selectionMode: 'single' | 'multiple' | 'checkbox' | null = null;
  @Input() selectedItems: any[] = [];
  
  // Display inputs
  @Input() loading: boolean = false;
  @Input() rowHover: boolean = true;
  @Input() stripedRows: boolean = false;
  @Input() responsive: boolean = true;
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '';
  @Input() virtualScroll: boolean = false;
  @Input() virtualScrollItemSize: number = 0;
  @Input() resizableColumns: boolean = false;
  @Input() reorderableColumns: boolean = false;
  
  // Filter inputs
  @Input() globalFilter: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() filterDelay: number = 300;
  @Input() showColumnFilters: boolean = false;
  
  // Export inputs
  @Input() exportFilename: string = 'export';
  
  // Pagination report inputs
  @Input() showCurrentPageReport: boolean = true;
  @Input() currentPageReportTemplate: string = 'Showing {first} to {last} of {totalRecords} entries';
  
  // Messages
  @Input() emptyMessage: string = 'No data found';
  @Input() loadingMessage: string = 'Loading...';
  
  // Outputs
  @Output() lazyLoad = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() colReorder = new EventEmitter<any>();
  @Output() rowReorder = new EventEmitter<any>();
  @Output() globalFilterChange = new EventEmitter<string>();
  @Output() columnFilterChange = new EventEmitter<{field: string, value: any}>();
  
  // Internal state
  searchTerm: string = '';
  columnFilters: { [key: string]: any } = {};
  
  ngOnInit(): void {
    this.initializeFilters();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.initializeFilters();
    }
  }
  
  initializeFilters(): void {
    this.columnFilters = {};
    this.columns.forEach(column => {
      if (column.filterable) {
        this.columnFilters[column.field] = null;
      }
    });
  }
  
  getColspan(): number {
    return this.columns.length + (this.actions && this.actions.length > 0 ? 1 : 0);
  }
  
  formatCellValue(rowData: any, column: DataTableColumn): string {
    const value = this.getNestedProperty(rowData, column.field);
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    switch (column.dataType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return value.toLocaleString();
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }
  
  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  getTooltip(rowData: any, column: DataTableColumn): string {
    const value = this.getNestedProperty(rowData, column.field);
    return value ? String(value) : '';
  }
  
  clearGlobalFilter(): void {
    this.searchTerm = '';
    this.globalFilterChange.emit('');
  }
  
  clearAllFilters(): void {
    this.searchTerm = '';
    this.columnFilters = {};
    this.initializeFilters();
    this.globalFilterChange.emit('');
  }

  onGlobalFilterChange(event: any): void {
    this.globalFilterChange.emit(this.searchTerm);
  }

  onColumnFilterChange(field: string, event: any): void {
    this.columnFilters[field] = event.target?.value || event.value || event;
    this.columnFilterChange.emit({ field, value: this.columnFilters[field] });
  }
}
