import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../../shared/components/search-dropdown/search-dropdown.component';
import { ClientGridComponent, GridColumn } from '../../../shared/components/client-grid/client-grid.component';

import { AttendanceService, AttendanceRecord, AttendanceFilters } from '../../../shared/services/attendance.service';
import { InatechEmployeeService } from '../../../shared/services/inatech-employee.service';

@Component({
  selector: 'app-attendance-day-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    SearchDropdownComponent,
    ClientGridComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- Filters Section -->
      <app-card class="dropdown-container">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee</label>
            <app-search-dropdown
              [options]="employees()"
              placeholder="Search employees..."
              [clearable]="true"
              [minSearchLength]="0"
              [debounceTime]="300"
              (selectionChange)="onEmployeeChange($event)">
            </app-search-dropdown>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
            <input 
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              [value]="selectedDate() ? selectedDate()!.toISOString().split('T')[0] : ''"
              (change)="onDateChange($event)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <app-search-dropdown
              [options]="statusOptions"
              placeholder="Select status..."
              [clearable]="true"
              [minSearchLength]="0"
              [debounceTime]="300"
              (selectionChange)="onStatusChange($event)">
            </app-search-dropdown>
          </div>
          <div class="flex items-end">
            <app-button 
              variant="primary" 
              size="md"
              (click)="loadAttendance()"
              [loading]="loading()">
              <i class="fas fa-search mr-2"></i>
              Search
            </app-button>
          </div>
          <div class="flex items-end">
            <app-button 
              variant="secondary" 
              size="md"
              (click)="clearFilters()">
              <i class="fas fa-times mr-2"></i>
              Clear
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Attendance Grid -->
      <app-card>
        @if (loading()) {
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600 dark:text-gray-400">Loading attendance records...</span>
          </div>
        } @else {
          <app-client-grid
            [data]="attendanceRecords()"
            [columns]="columns"
            [loading]="loading()"
            [itemsPerPage]="15"
            [showRecordsPerPage]="true"
            [sortable]="true"
            [searchFields]="['employee_name', 'status_label']"
            [emptyMessage]="'No attendance records found for the selected date.'">
          </app-client-grid>
        }
      </app-card>
    </div>
  `,
  styles: [`
    /* Fix dropdown clipping in attendance component */
    .dropdown-container {
      overflow: visible !important;
    }

    .dropdown-container app-card {
      overflow: visible !important;
    }

    .dropdown-container .grid {
      overflow: visible !important;
    }

    .dropdown-container app-search-dropdown {
      position: relative !important;
      z-index: 9999 !important;
    }

    .dropdown-container app-search-dropdown .search-dropdown-options {
      z-index: 99999 !important;
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
    }

  `]
})
export class AttendanceDayViewComponent implements OnInit {
  // Signals
  attendanceRecords = signal<any[]>([]);
  originalAttendanceData = signal<any[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedDate = signal<Date | null>(null);
  selectedStatus = signal<SearchDropdownOption | null>(null);

  // Status options
  statusOptions: SearchDropdownOption[] = [
    { label: 'All Status', value: '' },
    { label: 'Present', value: 'present' },
    { label: 'Time Off', value: 'time_off' },
    { label: 'No Track', value: 'no_track' }
  ];

  // Grid configuration
  columns: GridColumn[] = [
    { key: 'employee_name', title: 'Employee', sortable: true, width: '200px' },
    { key: 'attendance_date', title: 'Date', sortable: true, width: '120px' },
    { key: 'in_time', title: 'Check In', sortable: true, width: '100px' },
    { key: 'out_time', title: 'Check Out', sortable: true, width: '100px' },
    { key: 'working_hours', title: 'Working Hours', sortable: true, width: '120px' },
    { 
      key: 'status_label', 
      title: 'Status', 
      sortable: true, 
      width: '120px',
      type: 'status',
      statusConfig: {
        colorField: 'status_color',
        labelField: 'status_label'
      }
    }
  ];

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly inatechEmployeeService: InatechEmployeeService
  ) {
    this.loadEmployees();
    this.selectedDate.set(new Date());
  }

  ngOnInit(): void {
    // Load attendance data on page load with current filter values
    this.loadAttendance();
  }

  loadEmployees(): void {
    this.inatechEmployeeService.getEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          // Handle different response structures
          const employeesData = response.data.data || response.data;
          if (Array.isArray(employeesData)) {
            const employeeOptions = employeesData.map((emp: any) => ({
              label: emp.employee_name,
              value: emp.id
            }));
            this.employees.set(employeeOptions);
          }
        }
      },
      error: (error) => {
        console.error('Failed to load employees');
      }
    });
  }

  loadAttendance(): void {
    this.loading.set(true);
    
    const filters: AttendanceFilters = {
      view_type: 'day'
    };

    if (this.selectedEmployee()) {
      const employee = this.selectedEmployee();
      if (employee) {
        filters.employee_id = employee.value;
      }
    }
    
    if (this.selectedDate()) {
      const date = this.selectedDate();
      if (date) {
        filters.start_date = date.toISOString().split('T')[0];
        filters.end_date = date.toISOString().split('T')[0];
      }
    }

    this.attendanceService.getAttendance(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Process data for client-side grid
          const processedData = this.processAttendanceData(response.data.data);
          this.originalAttendanceData.set(processedData);
          this.applyAllFilters();
        } else {
          console.error('Failed to load attendance records');
        }
      },
      error: (error) => {
        this.loading.set(false);
        console.error('Failed to load attendance records');
        console.error('Error loading attendance:', error);
      }
    });
  }

  processAttendanceData(data: AttendanceRecord[]): any[] {
    return data.map(record => ({
      ...record,
      employee_name: record.employee_name || 'Unknown Employee',
      attendance_date: this.formatDate(record.attendance_date),
      in_time: this.formatTime(record.in_time),
      out_time: this.formatTime(record.out_time),
      working_hours: this.formatWorkingHours(record.working_hours),
      status_label: record.status_label + (record.time_off_type_name ? ` (${record.time_off_type_name})` : '')
    }));
  }

  onEmployeeChange(employee: SearchDropdownOption | null): void {
    this.selectedEmployee.set(employee);
  }

  onDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedDate.set(target.value ? new Date(target.value) : null);
  }

  onStatusChange(status: SearchDropdownOption | null): void {
    this.selectedStatus.set(status);
    this.applyAllFilters();
  }

  applyAllFilters(): void {
    let filteredData = [...this.originalAttendanceData()];
    
    // Apply status filter if selected
    if (this.selectedStatus()?.value) {
      filteredData = filteredData.filter(record => 
        record.status === this.selectedStatus()!.value
      );
    }
    
    this.attendanceRecords.set(filteredData);
    this.totalRecords.set(filteredData.length);
  }

  clearFilters(): void {
    this.selectedEmployee.set(null);
    this.selectedDate.set(new Date());
    this.selectedStatus.set(null);
    this.originalAttendanceData.set([]);
    this.attendanceRecords.set([]);
    this.totalRecords.set(0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '-';
    
    // Handle time-only strings (HH:MM:SS format)
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5); // Return HH:MM format
    }
    
    // Handle datetime strings - display in IST timezone
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return timeString; // Return as-is if parsing fails
    }
    
    // Format time in IST (UTC+5:30)
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }

  formatWorkingHours(hours: number | null): string {
    if (!hours) return '-';
    
    // Convert decimal hours to hours and minutes
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hrs === 0 && mins === 0) return '0 mins';
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    
    return `${hrs} hrs ${mins} mins`;
  }

}
