import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BambooHRService, Employee } from '../../shared/services/bamboohr.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ClientGridComponent, GridColumn, GridAction } from '../../shared/components/client-grid/client-grid.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent, LayoutComponent, ClientGridComponent],
  template: `
    <app-layout>
      <div class="p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Employees</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage and view employee information from BambooHR</p>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6">
        <app-card>
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <app-input
                [(ngModel)]="searchTerm"
                placeholder="Search employees..."
                (ngModelChange)="onSearchChange()"
                class="w-full">
              </app-input>
            </div>
            <div class="flex gap-2">
              <app-button
                (click)="loadAllEmployees()"
                [loading]="loading"
                variant="primary">
                <i class="fas fa-sync-alt mr-2"></i>
                Refresh
              </app-button>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Employee Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <app-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ totalEmployees }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Employees</div>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ activeEmployees }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Active Employees</div>
          </div>
        </app-card>
        <app-card>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ departments.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Departments</div>
          </div>
        </app-card>
      </div>

      <!-- Employee List -->
      <app-card>
        <app-client-grid
          [data]="allEmployees"
          [columns]="gridColumns"
          [actions]="gridActions"
          [loading]="loading"
          [searchTerm]="searchTerm"
          [searchFields]="['first_name', 'last_name', 'work_email', 'job_title', 'department.name', 'department']"
          [itemsPerPage]="20"
          loadingMessage="Loading employees..."
          emptyMessage="No employees found"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSortChange($event)">
        </app-client-grid>
      </app-card>
      </div>
    </app-layout>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class EmployeesComponent implements OnInit, OnDestroy {
  allEmployees: Employee[] = [];
  departments: string[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  totalEmployees: number = 0;
  activeEmployees: number = 0;
  
  // Grid configuration
  gridColumns: GridColumn[] = [
    {
      key: 'displayName',
      title: 'Employee',
      width: '300px'
    },
    {
      key: 'departmentDisplay',
      title: 'Department',
      sortable: true
    },
    {
      key: 'job_title',
      title: 'Job Title',
      sortable: true
    },
    {
      key: 'statusDisplay',
      title: 'Status',
      sortable: true
    }
  ];

  gridActions: GridAction[] = [
    {
      label: 'View',
      icon: 'fas fa-eye',
      class: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3',
      action: (employee: Employee) => this.viewEmployee(employee)
    },
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300',
      action: (employee: Employee) => this.editEmployee(employee)
    }
  ];
  
  // Debounced search
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly bambooHRService: BambooHRService) {}

  ngOnInit(): void {
    this.setupSearchDebouncing();
    this.loadAllEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebouncing(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value has changed
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        // The grid component will handle filtering automatically
      });
  }

  loadAllEmployees(): void {
    this.loading = true;
    
    // Load all employees at once for client-side pagination
    const params = {
      // No page parameter - load all employees for client-side pagination
      search: undefined
    };

    this.bambooHRService.getEmployees(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.allEmployees = (response.data.data || []).map((employee: Employee) => ({
            ...employee,
            displayName: `${employee.first_name} ${employee.last_name}`,
            departmentDisplay: typeof employee.department === 'string' 
              ? employee.department 
              : employee.department?.name || 'N/A',
            statusDisplay: employee.status || 'Unknown'
          }));
          this.totalEmployees = this.allEmployees.length;
          this.updateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  // Grid event handlers
  onPageChange(page: number): void {
    // Client-side pagination is handled by the grid component
    console.log('Page changed to:', page);
  }

  onSortChange(sortInfo: {column: string, direction: 'asc' | 'desc'}): void {
    // Client-side sorting is handled by the grid component
    console.log('Sort changed:', sortInfo);
  }

  onSearchChange(): void {
    // Trigger debounced search
    this.searchSubject.next(this.searchTerm);
  }

  updateStats(): void {
    this.activeEmployees = this.allEmployees.filter(emp => 
      emp.status === 'Active' || emp.status === 'Full-Time'
    ).length;
    
    this.departments = [...new Set(
      this.allEmployees
        .map(emp => {
          if (typeof emp.department === 'string') {
            return emp.department;
          } else if (emp.department && typeof emp.department === 'object' && 'name' in emp.department) {
            return emp.department.name;
          }
          return null;
        })
        .filter((dept): dept is string => dept !== null && dept.trim() !== '')
    )];
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  viewEmployee(employee: Employee): void {
    // Navigate to employee detail view or open modal
    console.log('View employee:', employee);
  }

  editEmployee(employee: Employee): void {
    // Navigate to employee edit form or open edit modal
    console.log('Edit employee:', employee);
  }

}
