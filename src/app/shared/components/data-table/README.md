# Data Table Component

A comprehensive PrimeNG-based data table component for the design system that provides advanced table functionality with filtering, sorting, pagination, and more.

## Features

- 📊 **Advanced Data Display**: Full-featured data table with PrimeNG
- 🔍 **Global & Column Filtering**: Text, dropdown, date, and multiselect filters
- 📄 **Pagination**: Built-in pagination with customizable options
- 🔄 **Sorting**: Single and multi-column sorting
- ✅ **Selection**: Single, multiple, and checkbox selection modes
- 📱 **Responsive**: Mobile-friendly responsive design
- 🎨 **Customizable**: Extensive styling and theming options
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🌙 **Dark Mode**: Complete dark mode support
- 📤 **Export**: Built-in data export functionality
- 🔄 **Lazy Loading**: Server-side data loading support
- 📏 **Virtual Scrolling**: Performance optimization for large datasets

## Usage

### Basic Usage

```typescript
import { DataTableComponent, DataTableColumn } from './shared/components/data-table/data-table.component';

export class MyComponent {
  data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ];

  columns: DataTableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
    { field: 'email', header: 'Email', sortable: true, filterable: true, filterType: 'text' },
    { 
      field: 'status', 
      header: 'Status', 
      sortable: true, 
      filterable: true, 
      filterType: 'dropdown',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    }
  ];

  actions = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      command: (rowData) => this.editItem(rowData)
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      command: (rowData) => this.deleteItem(rowData),
      class: 'text-red-600'
    }
  ];

  onPageChange(event: any): void {
    console.log('Page changed:', event);
  }

  onSortChange(event: any): void {
    console.log('Sort changed:', event);
  }

  editItem(item: any): void {
    console.log('Edit item:', item);
  }

  deleteItem(item: any): void {
    console.log('Delete item:', item);
  }
}
```

```html
<app-data-table
  [data]="data"
  [columns]="columns"
  [actions]="actions"
  [paginator]="true"
  [rows]="10"
  [globalFilter]="true"
  [showColumnFilters]="true"
  (onPage)="onPageChange($event)"
  (onSort)="onSortChange($event)">
</app-data-table>
```

### Advanced Usage with Lazy Loading

```typescript
export class AdvancedComponent {
  data: any[] = [];
  totalRecords = 0;
  loading = false;

  columns: DataTableColumn[] = [
    { field: 'name', header: 'Name', sortable: true, filterable: true, filterType: 'text' },
    { field: 'email', header: 'Email', sortable: true, filterable: true, filterType: 'text' },
    { 
      field: 'department', 
      header: 'Department', 
      sortable: true, 
      filterable: true, 
      filterType: 'multiselect',
      filterOptions: [
        { label: 'IT', value: 'it' },
        { label: 'HR', value: 'hr' },
        { label: 'Finance', value: 'finance' }
      ]
    },
    { 
      field: 'hireDate', 
      header: 'Hire Date', 
      sortable: true, 
      filterable: true, 
      filterType: 'date',
      dataType: 'date'
    }
  ];

  onLazyLoad(event: any): void {
    this.loading = true;
    
    // Simulate API call
    this.dataService.getData({
      first: event.first,
      rows: event.rows,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
      filters: event.filters
    }).subscribe({
      next: (response) => {
        this.data = response.data;
        this.totalRecords = response.totalRecords;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading data:', error);
      }
    });
  }
}
```

```html
<app-data-table
  [data]="data"
  [columns]="columns"
  [lazy]="true"
  [totalRecords]="totalRecords"
  [loading]="loading"
  [globalFilter]="true"
  [showColumnFilters]="true"
  (onLazyLoad)="onLazyLoad($event)">
</app-data-table>
```

## API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `any[]` | `[]` | Array of data to display |
| `columns` | `DataTableColumn[]` | `[]` | Column configuration |
| `actions` | `DataTableAction[]` | `[]` | Row action buttons |
| `paginator` | `boolean` | `true` | Show pagination |
| `rows` | `number` | `10` | Number of rows per page |
| `totalRecords` | `number` | `0` | Total number of records (for lazy loading) |
| `lazy` | `boolean` | `false` | Enable lazy loading |
| `loading` | `boolean` | `false` | Show loading state |
| `globalFilter` | `boolean` | `true` | Enable global search |
| `showColumnFilters` | `boolean` | `false` | Show column filter panel |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox' \| null` | `null` | Row selection mode |
| `responsive` | `boolean` | `true` | Enable responsive design |
| `scrollable` | `boolean` | `false` | Enable horizontal scrolling |
| `virtualScroll` | `boolean` | `false` | Enable virtual scrolling |
| `resizableColumns` | `boolean` | `false` | Allow column resizing |
| `reorderableColumns` | `boolean` | `false` | Allow column reordering |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `onLazyLoad` | `EventEmitter<any>` | Fired when lazy loading is triggered |
| `onPage` | `EventEmitter<any>` | Fired when page changes |
| `onSort` | `EventEmitter<any>` | Fired when sorting changes |
| `onRowSelect` | `EventEmitter<any>` | Fired when a row is selected |
| `onRowUnselect` | `EventEmitter<any>` | Fired when a row is unselected |
| `onSelectionChange` | `EventEmitter<any>` | Fired when selection changes |
| `onGlobalFilter` | `EventEmitter<string>` | Fired when global filter changes |
| `onColumnFilter` | `EventEmitter<{field: string, value: any}>` | Fired when column filter changes |

### DataTableColumn Interface

```typescript
interface DataTableColumn {
  field: string;                    // Data field name
  header: string;                   // Column header text
  sortable?: boolean;               // Enable sorting
  filterable?: boolean;             // Enable filtering
  filterType?: 'text' | 'dropdown' | 'date' | 'multiselect'; // Filter type
  filterOptions?: any[];            // Options for dropdown/multiselect filters
  width?: string;                   // Column width
  align?: 'left' | 'center' | 'right'; // Text alignment
  dataType?: 'text' | 'number' | 'date' | 'boolean' | 'currency'; // Data type for formatting
  template?: any;                   // Custom template
}
```

### DataTableAction Interface

```typescript
interface DataTableAction {
  label: string;                    // Action button label
  icon?: string;                    // Action button icon
  command: (rowData: any) => void;  // Action handler function
  visible?: (rowData: any) => boolean; // Show/hide condition
  disabled?: (rowData: any) => boolean; // Disable condition
  class?: string;                   // CSS classes
}
```

## Styling

The component uses Tailwind CSS classes and includes dark mode support. You can customize the appearance by overriding the component styles:

```scss
:host ::ng-deep .p-datatable {
  // Custom table styles
}

:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  // Custom header styles
}

:host ::ng-deep .p-datatable .p-datatable-tbody > tr {
  // Custom row styles
}
```

## Examples

### Employee Management Table

```typescript
columns: DataTableColumn[] = [
  { field: 'id', header: 'ID', sortable: true, width: '80px' },
  { field: 'name', header: 'Full Name', sortable: true, filterable: true, filterType: 'text' },
  { field: 'email', header: 'Email', sortable: true, filterable: true, filterType: 'text' },
  { 
    field: 'department', 
    header: 'Department', 
    sortable: true, 
    filterable: true, 
    filterType: 'dropdown',
    filterOptions: [
      { label: 'Engineering', value: 'engineering' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Sales', value: 'sales' }
    ]
  },
  { 
    field: 'salary', 
    header: 'Salary', 
    sortable: true, 
    dataType: 'currency' 
  },
  { 
    field: 'hireDate', 
    header: 'Hire Date', 
    sortable: true, 
    filterable: true, 
    filterType: 'date',
    dataType: 'date'
  }
];
```

### Product Inventory Table

```typescript
columns: DataTableColumn[] = [
  { field: 'sku', header: 'SKU', sortable: true, filterable: true, filterType: 'text' },
  { field: 'name', header: 'Product Name', sortable: true, filterable: true, filterType: 'text' },
  { 
    field: 'category', 
    header: 'Category', 
    sortable: true, 
    filterable: true, 
    filterType: 'multiselect',
    filterOptions: [
      { label: 'Electronics', value: 'electronics' },
      { label: 'Clothing', value: 'clothing' },
      { label: 'Books', value: 'books' }
    ]
  },
  { field: 'price', header: 'Price', sortable: true, dataType: 'currency' },
  { field: 'stock', header: 'Stock', sortable: true, dataType: 'number' },
  { 
    field: 'inStock', 
    header: 'In Stock', 
    sortable: true, 
    filterable: true, 
    filterType: 'dropdown',
    filterOptions: [
      { label: 'Yes', value: true },
      { label: 'No', value: false }
    ],
    dataType: 'boolean'
  }
];
```

## Dependencies

This component requires the following PrimeNG modules:

- `TableModule`
- `ButtonModule`
- `InputTextModule`
- `DropdownModule`
- `PaginatorModule`
- `MultiSelectModule`
- `CalendarModule`
- `TooltipModule`

Make sure to import these modules in your application or add them to your module imports.
