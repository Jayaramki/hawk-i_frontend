import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { UnifiedEmployeeService } from '../../shared/services/unified-employee.service';
import { BambooHRService } from '../../shared/services/bamboohr.service';
import { InatechEmployeeService, InatechEmployee } from '../../shared/services/inatech-employee.service';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { TabComponent, TabItem } from '../../shared/components/tab/tab.component';
import { TabPanelComponent } from '../../shared/components/tab/tab-panel.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ClientGridComponent, GridColumn, GridAction } from '../../shared/components/client-grid/client-grid.component';

@Component({
  selector: 'app-employees-unified',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LayoutComponent, 
    TabComponent, 
    TabPanelComponent,
    CardComponent, 
    ButtonComponent, 
    InputComponent, 
    ModalComponent,
    ClientGridComponent
  ],
  template: `
    <app-layout>
      <!-- Page header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-heading text-gray-900 dark:text-white mb-2">Employee Management</h1>
            <p class="text-body text-gray-600 dark:text-gray-300">Manage employees from BambooHR and Inatech systems</p>
          </div>
          <div class="flex space-x-3">
            <app-button
              [variant]="'primary'"
              (click)="loadAllEmployees()"
              [loading]="loading()">
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh All
            </app-button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ mappingStats().totalBambooHREmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">BambooHR Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ mappingStats().totalInatechEmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Inatech Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ mappingStats().mappedEmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Mapped Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ mappingStats().mappingCoverage }}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Mapping Coverage</div>
            </div>
          </app-card>
        </div>

        <!-- Tab Navigation -->
        <app-tab
          [tabs]="tabs"
          [activeTab]="activeTab"
          (tabChange)="onTabChange($event)">
          
          <!-- BambooHR Employees Tab -->
          <app-tab-panel [id]="'bamboohr'" [isActive]="activeTab === 'bamboohr'">
            <div class="space-y-6">
              <!-- Search and Filters -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search BambooHR Employees"
                      placeholder="Search by name, email, department..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadBambooHREmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- BambooHR Employees Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="bambooHREmployees"
                  [columns]="bambooHRGridColumns"
                  [actions]="bambooHRGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['name', 'email', 'department', 'jobTitle']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading BambooHR employees..."
                  emptyMessage="No BambooHR employees found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>

          <!-- Inatech Employees Tab -->
          <app-tab-panel [id]="'inatech'" [isActive]="activeTab === 'inatech'">
            <div class="space-y-6">
              <!-- Search and Filters -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search Inatech Employees"
                      placeholder="Search by name or ID..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'primary'"
                      (click)="showCreateInatechEmployeeModal()">
                      <i class="fas fa-plus mr-2"></i>
                      Add Employee
                    </app-button>
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadInatechEmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- Inatech Employees Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="inatechEmployees"
                  [columns]="inatechGridColumns"
                  [actions]="inatechGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['name', 'ina_emp_id']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading Inatech employees..."
                  emptyMessage="No Inatech employees found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>

          <!-- Mappings Tab -->
          <app-tab-panel [id]="'mappings'" [isActive]="activeTab === 'mappings'">
            <div class="space-y-6">
              <!-- Mapping Controls -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search Mappings"
                      placeholder="Search by employee name..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'primary'"
                      (click)="openBulkMappingModal()">
                      <i class="fas fa-link mr-2"></i>
                      Bulk Mapping
                    </app-button>
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadAllEmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- Mapping Statistics -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ mappingStats().mappedEmployees }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Mapped</div>
                  </div>
                </app-card>
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ mappingStats().unmappedBambooHR }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Unmapped BambooHR</div>
                  </div>
                </app-card>
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ mappingStats().unmappedInatech }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Unmapped Inatech</div>
                  </div>
                </app-card>
              </div>

              <!-- Mappings Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="mappedEmployees"
                  [columns]="mappingGridColumns"
                  [actions]="mappingGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['bambooName', 'inatechName']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading mappings..."
                  emptyMessage="No mappings found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>
        </app-tab>

        <!-- Modals -->
        <!-- Create Inatech Employee Modal -->
        <app-modal
          [isOpen]="showCreateModal"
          [title]="'Create Inatech Employee'"
          [size]="'md'"
          (closeEvent)="closeCreateModal()">
          <form (ngSubmit)="createInatechEmployee()">
            <div class="space-y-4">
              <app-input
                label="INA Employee ID"
                [(ngModel)]="newEmployee.ina_emp_id"
                name="ina_emp_id"
                [required]="true"
                placeholder="Enter INA Employee ID">
              </app-input>
              <app-input
                label="Employee Name"
                [(ngModel)]="newEmployee.employee_name"
                name="employee_name"
                [required]="true"
                placeholder="Enter employee name">
              </app-input>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  id="status"
                  [(ngModel)]="newEmployee.status"
                  name="status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6" modal-footer>
              <app-button
                [variant]="'secondary'"
                type="button"
                (click)="closeCreateModal()">
                Cancel
              </app-button>
              <app-button
                [variant]="'primary'"
                type="submit">
                <i class="fas fa-plus mr-2"></i>
                Create Employee
              </app-button>
            </div>
          </form>
        </app-modal>

        <!-- Bulk Mapping Modal -->
        <app-modal
          [isOpen]="showBulkMappingModal"
          [title]="'Bulk Employee Mapping'"
          [size]="'lg'"
          (closeEvent)="closeBulkMappingModal()">
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              Select employees to map between BambooHR and Inatech systems.
            </p>
            <!-- Bulk mapping interface would go here -->
            <div class="text-center py-8 text-gray-500">
              Bulk mapping interface coming soon...
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6" modal-footer>
            <app-button
              [variant]="'secondary'"
              (click)="closeBulkMappingModal()">
              Cancel
            </app-button>
            <app-button
              [variant]="'primary'"
              [disabled]="true">
              <i class="fas fa-link mr-2"></i>
              Create Mappings
            </app-button>
          </div>
        </app-modal>

        <!-- Mapping Modal -->
        <app-modal
          [isOpen]="showMappingModal"
          [title]="'Map Employee'"
          [size]="'lg'"
          (closeEvent)="closeMappingModal()">
          <div class="space-y-4">
            <div *ngIf="selectedEmployee" class="mb-4">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">BambooHR Employee</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedEmployee.name }}</p>
            </div>
            
            <div *ngIf="mappingSuggestions.length > 0">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Suggested Mappings</h4>
              <div class="space-y-2">
                <div *ngFor="let suggestion of mappingSuggestions" 
                     class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ suggestion.inatech_employee.employee_name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">INA ID: {{ suggestion.inatech_employee.ina_emp_id }}</p>
                    <p class="text-sm text-blue-600 dark:text-blue-400">{{ suggestion.similarity_percentage }}% match</p>
                  </div>
                  <app-button
                    [variant]="'primary'"
                    [size]="'sm'"
                    (click)="createMapping(selectedEmployee.id, suggestion.inatech_employee.id)">
                    <i class="fas fa-link mr-1"></i>
                    Map
                  </app-button>
                </div>
              </div>
            </div>
            
            <div *ngIf="mappingSuggestions.length === 0" class="text-center py-8 text-gray-500">
              No mapping suggestions found.
            </div>
          </div>
        </app-modal>
    </app-layout>
  `,
  styles: []
})
export class EmployeesUnifiedComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // Component state
  activeTab = 'bamboohr';
  searchTerm = '';
  showCreateModal = false;
  showBulkMappingModal = false;
  showMappingModal = false;
  selectedEmployee: any = null;
  mappingSuggestions: any[] = [];

  // Form data
  newEmployee: Partial<InatechEmployee> = {
    ina_emp_id: '',
    employee_name: '',
    status: 'active'
  };

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'bamboohr', label: 'BambooHR Employees', icon: 'fas fa-users' },
    { id: 'inatech', label: 'Inatech Employees', icon: 'fas fa-user-cog' },
    { id: 'mappings', label: 'Employee Mappings', icon: 'fas fa-link' }
  ];

  // Grid configurations
  bambooHRGridColumns: GridColumn[] = [
    { key: 'name', title: 'Employee', width: '300px' },
    { key: 'department', title: 'Department', sortable: true },
    { key: 'jobTitle', title: 'Job Title', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'mappingStatus', title: 'Mapping', sortable: true }
  ];

  inatechGridColumns: GridColumn[] = [
    { key: 'name', title: 'Employee', width: '300px' },
    { key: 'ina_emp_id', title: 'INA ID', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'mappingStatus', title: 'Mapping', sortable: true }
  ];

  mappingGridColumns: GridColumn[] = [
    { key: 'bambooName', title: 'BambooHR Employee', width: '250px' },
    { key: 'inatechName', title: 'Inatech Employee', width: '250px' },
    { key: 'confidence', title: 'Confidence', sortable: true },
    { key: 'mappedAt', title: 'Mapped At', sortable: true }
  ];

  bambooHRGridActions: GridAction[] = [
    {
      label: 'Map',
      icon: 'fas fa-link',
      class: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
      action: (employee: any) => this.mapEmployee(employee)
    }
  ];

  inatechGridActions: GridAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300',
      action: (employee: any) => this.editInatechEmployee(employee)
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
      action: (employee: any) => this.deleteInatechEmployee(employee)
    }
  ];

  mappingGridActions: GridAction[] = [
    {
      label: 'Unmap',
      icon: 'fas fa-unlink',
      class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
      action: (mapping: any) => this.unmapEmployee(mapping)
    }
  ];

  constructor(
    private readonly unifiedEmployeeService: UnifiedEmployeeService,
    private readonly bambooHRService: BambooHRService,
    private readonly inatechEmployeeService: InatechEmployeeService
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
      });
  }

  ngOnInit(): void {
    this.loadAllEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
  get loading() {
    return this.unifiedEmployeeService.loading;
  }

  get mappingStats() {
    return this.unifiedEmployeeService.mappingStats;
  }

  // Debug method to check if data is loaded
  get isDataLoaded(): boolean {
    const bambooCount = this.unifiedEmployeeService.bambooHREmployees().length;
    const inatechCount = this.unifiedEmployeeService.inatechEmployees().length;
    console.log('Data loaded check - BambooHR:', bambooCount, 'Inatech:', inatechCount);
    return bambooCount > 0 || inatechCount > 0;
  }

  // Tab management
  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  // Search functionality
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  // Data loading
  loadAllEmployees(): void {
    this.unifiedEmployeeService.loadAllEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Get current mappings to determine status
          const currentMappings = this.unifiedEmployeeService.mappings();
          
          // Transform and store the data
          this.bambooHREmployees = (data.bambooHR || []).map(emp => {
            const isMapped = currentMappings.some(mapping => mapping.bamboohrEmployee?.id === emp.id);
            return {
              ...emp,
              name: `${emp.first_name} ${emp.last_name}`,
              department: typeof emp.department === 'string' ? emp.department : emp.department?.name || 'N/A',
              jobTitle: emp.job_title || 'N/A',
              mappingStatus: isMapped ? 'Mapped' : 'Unmapped'
            };
          });
          
          this.inatechEmployees = (data.inatech || []).map(emp => {
            const isMapped = currentMappings.some(mapping => mapping.inatechEmployee?.id === emp.id);
            return {
              ...emp,
              name: emp.employee_name,
              mappingStatus: isMapped ? 'Mapped' : 'Unmapped'
            };
          });
          
          this.mappedEmployees = this.unifiedEmployeeService.mappings().map(mapping => ({
            id: mapping.id,
            bambooName: `${mapping.bamboohrEmployee?.first_name || ''} ${mapping.bamboohrEmployee?.last_name || ''}`,
            inatechName: mapping.inatechEmployee?.employee_name || '',
            confidence: mapping.confidence,
            mappedAt: mapping.mappedAt
          }));
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }

  loadBambooHREmployees(): void {
    this.bambooHRService.getAllEmployees({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('BambooHR employees loaded');
          }
        },
        error: (error) => {
          console.error('Error loading BambooHR employees:', error);
        }
      });
  }

  loadInatechEmployees(): void {
    this.inatechEmployeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Inatech employees loaded');
          }
        },
        error: (error) => {
          console.error('Error loading Inatech employees:', error);
        }
      });
  }

  // Reactive data properties
  bambooHREmployees: any[] = [];
  inatechEmployees: any[] = [];
  mappedEmployees: any[] = [];


  // Modal management
  showCreateInatechEmployeeModal(): void {
    this.newEmployee = {
      ina_emp_id: '',
      employee_name: '',
      status: 'active'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openBulkMappingModal(): void {
    this.showBulkMappingModal = true;
  }

  closeBulkMappingModal(): void {
    this.showBulkMappingModal = false;
  }

  closeMappingModal(): void {
    this.showMappingModal = false;
    this.selectedEmployee = null;
    this.mappingSuggestions = [];
  }

  createMapping(bamboohrId: string, inatechId: string): void {
    this.unifiedEmployeeService.createMapping(bamboohrId, inatechId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Mapping created successfully:', response);
            this.closeMappingModal();
            // Reload all data to update mapping status
            this.loadAllEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating mapping:', error);
        }
      });
  }

  // Employee management
  createInatechEmployee(): void {
    if (!this.newEmployee.ina_emp_id || !this.newEmployee.employee_name) {
      return;
    }

    this.inatechEmployeeService.createEmployee(this.newEmployee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.closeCreateModal();
            this.loadInatechEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
  }

  editInatechEmployee(employee: any): void {
    // Set the employee data for editing
    this.newEmployee = {
      id: employee.id,
      ina_emp_id: employee.ina_emp_id,
      employee_name: employee.employee_name,
      status: employee.status
    };
    this.showCreateModal = true;
  }

  deleteInatechEmployee(employee: any): void {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      this.inatechEmployeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadInatechEmployees();
            }
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
          }
        });
    }
  }

  // Mapping functionality
  mapEmployee(employee: any): void {
    console.log('Opening mapping modal for employee:', employee);
    // Open mapping modal for BambooHR employee
    this.selectedEmployee = employee;
    this.mappingSuggestions = [];
    this.showMappingModal = true;
    
    // Get mapping suggestions
    this.unifiedEmployeeService.getMappingSuggestions(employee.id.toString(), 'bamboohr')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Mapping suggestions response:', response);
          if (response.success) {
            this.mappingSuggestions = response.data.suggestions;
            console.log('Mapping suggestions loaded:', this.mappingSuggestions.length);
          }
        },
        error: (error) => {
          console.error('Error loading mapping suggestions:', error);
        }
      });
  }

  unmapEmployee(mapping: any): void {
    if (confirm(`Are you sure you want to unmap ${mapping.bambooName} and ${mapping.inatechName}?`)) {
      this.unifiedEmployeeService.removeMapping(mapping.inatechId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadAllEmployees();
            }
          },
          error: (error) => {
            console.error('Error unmapping employee:', error);
          }
        });
    }
  }
}
