# Client Grid Component

A reusable grid component for client-side pagination, sorting, and data display.

## Usage

```typescript
import { ClientGridComponent, GridColumn, GridAction } from './client-grid.component';

@Component({
  template: `
    <app-client-grid
      [data]="employees"
      [columns]="gridColumns"
      [actions]="gridActions"
      [loading]="loading"
      [searchTerm]="searchTerm"
      [searchFields]="['name', 'email', 'department']"
      [itemsPerPage]="20"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)">
    </app-client-grid>
  `
})
export class MyComponent {
  employees: any[] = [];
  loading = false;
  searchTerm = '';
  
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
  
  onPageChange(page: number): void {
    // Client-side pagination is handled automatically
    console.log('Page changed to:', page);
  }
  
  onSortChange(sortInfo: {column: string, direction: 'asc' | 'desc'}): void {
    // Client-side sorting is handled automatically
    console.log('Sort changed:', sortInfo);
  }
}
```

## Features

- Client-side pagination
- Client-side sorting
- Client-side search/filtering
- Customizable columns
- Action buttons
- Loading states
- Empty states
- Responsive design
- Dark mode support
- Debounced search

