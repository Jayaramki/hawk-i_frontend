# Server Grid Component

A reusable grid component for server-side pagination, sorting, and data display.

## Usage

```typescript
import { ServerGridComponent, GridColumn, GridAction, PaginationInfo } from './server-grid.component';

@Component({
  template: `
    <app-server-grid
      [data]="employees"
      [columns]="gridColumns"
      [actions]="gridActions"
      [loading]="loading"
      [paginationInfo]="paginationInfo"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)">
    </app-server-grid>
  `
})
export class MyComponent {
  employees: any[] = [];
  loading = false;
  
  gridColumns: GridColumn[] = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'department', title: 'Department' }
  ];
  
  gridActions: GridAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      action: (item) => this.editItem(item)
    }
  ];
  
  paginationInfo: PaginationInfo = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 200,
    itemsPerPage: 20,
    startIndex: 1,
    endIndex: 20
  };
  
  onPageChange(page: number): void {
    // Handle server-side pagination
    this.loadData(page);
  }
  
  onSortChange(sortInfo: {column: string, direction: 'asc' | 'desc'}): void {
    // Handle server-side sorting
    this.loadData(this.paginationInfo.currentPage, sortInfo);
  }
}
```

## Features

- Server-side pagination
- Server-side sorting
- Customizable columns
- Action buttons
- Loading states
- Empty states
- Responsive design
- Dark mode support

