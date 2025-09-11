import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { BambooHRService, Employee } from '../../shared/services/bamboohr.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, InputComponent, LayoutComponent],
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
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Job Title
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngIf="loading" class="animate-pulse">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Loading employees...
                </td>
              </tr>
              <tr *ngIf="!loading && paginatedEmployees.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  <i class="fas fa-users mr-2"></i>
                  No employees found
                </td>
              </tr>
              <tr *ngFor="let employee of paginatedEmployees" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {{ getInitials(employee.first_name, employee.last_name) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ employee.first_name }} {{ employee.last_name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ employee.work_email || 'No email' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ employee.department?.name || employee.department || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ employee.job_title || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [class]="getStatusClass(employee.status)">
                    {{ employee.status || 'Unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="viewEmployee(employee)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    (click)="editEmployee(employee)"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredEmployees.length) }} of {{ filteredEmployees.length }} results
            </div>
            <div class="flex items-center space-x-2">
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
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  departments: string[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  totalEmployees: number = 0;
  activeEmployees: number = 0;
  
  // Client-side pagination
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  
  // Debounced search
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  
  // Expose Math to template
  Math = Math;

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
        this.filterEmployees();
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
          this.allEmployees = response.data.data || [];
          this.totalEmployees = this.allEmployees.length;
          this.filterEmployees();
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

  private filterEmployees(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.allEmployees];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredEmployees = this.allEmployees.filter(employee => {
        const departmentName = typeof employee.department === 'string' 
          ? employee.department 
          : employee.department?.name || '';
        
        return employee.first_name?.toLowerCase().includes(searchLower) ||
               employee.last_name?.toLowerCase().includes(searchLower) ||
               employee.work_email?.toLowerCase().includes(searchLower) ||
               employee.job_title?.toLowerCase().includes(searchLower) ||
               departmentName.toLowerCase().includes(searchLower);
      });
    }
    
    this.currentPage = 1; // Reset to first page when filtering
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}
