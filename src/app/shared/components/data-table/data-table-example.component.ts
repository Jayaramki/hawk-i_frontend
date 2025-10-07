import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableColumn, DataTableAction } from './data-table.component';

@Component({
  selector: 'app-data-table-example',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Data Table Example</h2>
      
      <app-data-table
        [data]="sampleData"
        [columns]="columns"
        [actions]="actions"
        [paginator]="true"
        [rows]="5"
        [globalFilter]="true"
        [showColumnFilters]="true"
        [selectionMode]="'multiple'"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (selectionChange)="onSelectionChange($event)"
        (globalFilterChange)="onGlobalFilterChange($event)"
        (columnFilterChange)="onColumnFilterChange($event)">
      </app-data-table>
      
      <div *ngIf="selectedItems.length > 0" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="font-semibold mb-2">Selected Items:</h3>
        <ul class="list-disc list-inside">
          <li *ngFor="let item of selectedItems">{{ item.name }} ({{ item.email }})</li>
        </ul>
      </div>
    </div>
  `,
  styles: []
})
export class DataTableExampleComponent {
  sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 75000, hireDate: '2022-01-15', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 65000, hireDate: '2022-03-20', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', salary: 70000, hireDate: '2021-11-10', status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', department: 'Engineering', salary: 80000, hireDate: '2023-02-01', status: 'active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', department: 'HR', salary: 60000, hireDate: '2022-07-15', status: 'active' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', department: 'Marketing', salary: 68000, hireDate: '2023-01-10', status: 'active' },
    { id: 7, name: 'Eve Miller', email: 'eve@example.com', department: 'Sales', salary: 72000, hireDate: '2022-09-05', status: 'inactive' },
    { id: 8, name: 'Frank Garcia', email: 'frank@example.com', department: 'Engineering', salary: 85000, hireDate: '2021-12-01', status: 'active' }
  ];

  columns: DataTableColumn[] = [
    { 
      field: 'id', 
      header: 'ID', 
      sortable: true, 
      width: '80px',
      align: 'center'
    },
    { 
      field: 'name', 
      header: 'Full Name', 
      sortable: true, 
      filterable: true, 
      filterType: 'text'
    },
    { 
      field: 'email', 
      header: 'Email', 
      sortable: true, 
      filterable: true, 
      filterType: 'text'
    },
    { 
      field: 'department', 
      header: 'Department', 
      sortable: true, 
      filterable: true, 
      filterType: 'dropdown',
      filterOptions: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Sales', value: 'Sales' },
        { label: 'HR', value: 'HR' }
      ]
    },
    { 
      field: 'salary', 
      header: 'Salary', 
      sortable: true, 
      dataType: 'currency',
      align: 'right'
    },
    { 
      field: 'hireDate', 
      header: 'Hire Date', 
      sortable: true, 
      filterable: true, 
      filterType: 'date',
      dataType: 'date'
    },
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

  actions: DataTableAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      command: (rowData) => this.editItem(rowData),
      class: 'text-blue-600 hover:text-blue-800'
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      command: (rowData) => this.deleteItem(rowData),
      class: 'text-red-600 hover:text-red-800'
    },
    {
      label: 'View',
      icon: 'fas fa-eye',
      command: (rowData) => this.viewItem(rowData),
      class: 'text-green-600 hover:text-green-800'
    }
  ];

  selectedItems: any[] = [];

  onPageChange(event: any): void {
    console.log('Page changed:', event);
  }

  onSortChange(event: any): void {
    console.log('Sort changed:', event);
  }

  onSelectionChange(event: any): void {
    this.selectedItems = event;
    console.log('Selection changed:', event);
  }

  onGlobalFilterChange(searchTerm: string): void {
    console.log('Global filter changed:', searchTerm);
  }

  onColumnFilterChange(filter: {field: string, value: any}): void {
    console.log('Column filter changed:', filter);
  }

  editItem(item: any): void {
    console.log('Edit item:', item);
    alert(`Edit: ${item.name}`);
  }

  deleteItem(item: any): void {
    console.log('Delete item:', item);
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      const index = this.sampleData.findIndex(d => d.id === item.id);
      if (index > -1) {
        this.sampleData.splice(index, 1);
      }
    }
  }

  viewItem(item: any): void {
    console.log('View item:', item);
    alert(`View: ${item.name} - ${item.email}`);
  }
}
