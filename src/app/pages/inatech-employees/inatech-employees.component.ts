import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { InatechEmployeeService, InatechEmployee, MappingSuggestion } from '../../shared/services/inatech-employee.service';
import { BambooHRService } from '../../shared/services/bamboohr.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { ClientGridComponent, GridColumn, GridAction } from '../../shared/components/client-grid/client-grid.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-inatech-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, InputComponent, LayoutComponent, ClientGridComponent, ModalComponent],
  templateUrl: './inatech-employees.component.html',
  styleUrls: ['./inatech-employees.component.scss']
})
export class InatechEmployeesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // Component state
  employees: InatechEmployee[] = [];
  totalItems = 0;
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showMappingModal = false;
  selectedEmployee: InatechEmployee | null = null;
  mappingSuggestions: MappingSuggestion[] = [];

  // Form data
  newEmployee: Partial<InatechEmployee> = {
    ina_emp_id: '',
    employee_name: '',
    status: 'active'
  };

  editEmployee: Partial<InatechEmployee> = {};

  // Grid configuration
  gridColumns: GridColumn[] = [
    { key: 'employee_name', title: 'Employee Name', sortable: true, width: '300px' },
    { key: 'ina_emp_id', title: 'INA ID', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'mappingStatus', title: 'Mapping', sortable: true }
  ];

  gridActions: GridAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300',
      action: (employee: any) => this.editEmployeeRecord(employee)
    },
    {
      label: 'Map',
      icon: 'fas fa-link',
      class: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
      action: (employee: any) => this.openMappingModal(employee),
      condition: (employee: any) => !employee.is_mapped // Only show if not mapped
    },
    {
      label: 'Unmap',
      icon: 'fas fa-unlink',
      class: 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300',
      action: (employee: any) => this.removeMapping(employee),
      condition: (employee: any) => employee.is_mapped // Only show if mapped
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
      action: (employee: any) => this.deleteEmployee(employee)
    }
  ];

  constructor(
    private readonly inatechEmployeeService: InatechEmployeeService,
    private readonly bambooHRService: BambooHRService
  ) {
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.loadEmployees();
      });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Grid data transformation with client-side filtering
  get gridData(): any[] {
    let filteredEmployees = this.employees;
    
    // Apply status filter if set
    if (this.statusFilter) {
      filteredEmployees = filteredEmployees.filter(employee => employee.status === this.statusFilter);
    }
    
    return filteredEmployees.map(employee => ({
      ...employee,
      mappingStatus: employee.mapping_status || 'Unmapped'
    }));
  }

  /**
   * Load all employees (client-side grid handles pagination and filtering)
   */
  loadEmployees(): void {
    this.loading = true;
    this.error = null;

    this.inatechEmployeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.employees = response.data.data;
            this.totalItems = response.data.total;
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to load employees';
          console.error('Error loading employees:', error);
        }
      });
  }

  /**
   * Handle search input
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    // Client-side grid will handle filtering
  }


  /**
   * Show create employee modal
   */
  showCreateEmployeeModal(): void {
    this.newEmployee = {
      ina_emp_id: '',
      employee_name: '',
      status: 'active'
    };
    this.showCreateModal = true;
  }

  /**
   * Create new employee
   */
  createEmployee(): void {
    if (!this.newEmployee.ina_emp_id || !this.newEmployee.employee_name) {
      return;
    }

    this.inatechEmployeeService.createEmployee(this.newEmployee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showCreateModal = false;
            this.loadEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
  }

  /**
   * Edit employee record (called from grid action)
   */
  editEmployeeRecord(employee: InatechEmployee): void {
    this.showEditEmployeeModal(employee);
  }

  /**
   * Show edit employee modal
   */
  showEditEmployeeModal(employee: InatechEmployee): void {
    this.editEmployee = { ...employee };
    this.showEditModal = true;
  }

  /**
   * Update employee
   */
  updateEmployee(): void {
    if (!this.editEmployee.id || !this.editEmployee.ina_emp_id || !this.editEmployee.employee_name) {
      return;
    }

    this.inatechEmployeeService.updateEmployee(this.editEmployee.id, this.editEmployee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showEditModal = false;
            this.loadEmployees();
          }
        },
        error: (error) => {
          console.error('Error updating employee:', error);
        }
      });
  }

  /**
   * Delete employee
   */
  deleteEmployee(employee: InatechEmployee): void {
    if (confirm(`Are you sure you want to delete ${employee.employee_name}?`)) {
      this.inatechEmployeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadEmployees();
            }
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
          }
        });
    }
  }

  /**
   * Show mapping modal for employee
   */
  openMappingModal(employee: InatechEmployee): void {
    this.selectedEmployee = employee;
    this.mappingSuggestions = [];
    this.showMappingModal = true;

    // Load mapping suggestions
    this.inatechEmployeeService.getMappingSuggestions(employee.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mappingSuggestions = response.data.suggestions;
          }
        },
        error: (error) => {
          console.error('Error loading mapping suggestions:', error);
        }
      });
  }

  /**
   * Create employee mapping
   */
  createMapping(bambooEmployeeId: number): void {
    if (!this.selectedEmployee) return;

    this.inatechEmployeeService.createMapping({
      ina_emp_id: this.selectedEmployee.id,
      bamboohr_id: bambooEmployeeId
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showMappingModal = false;
            this.loadEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating mapping:', error);
        }
      });
  }

  /**
   * Remove employee mapping
   */
  removeMapping(employee: InatechEmployee): void {
    if (confirm(`Are you sure you want to remove the mapping for ${employee.employee_name}?`)) {
      this.inatechEmployeeService.removeMapping(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadEmployees();
            }
          },
          error: (error) => {
            console.error('Error removing mapping:', error);
          }
        });
    }
  }

  /**
   * Get similarity color class
   */
  getSimilarityColorClass(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Close all modals
   */
  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showMappingModal = false;
    this.selectedEmployee = null;
    this.mappingSuggestions = [];
  }

}
