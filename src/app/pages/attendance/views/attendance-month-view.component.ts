import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../../shared/components/search-dropdown/search-dropdown.component';

import { AttendanceService, AttendanceRecord, AttendanceFilters } from '../../../shared/services/attendance.service';
import { BambooHRService } from '../../../shared/services/bamboohr.service';

@Component({
  selector: 'app-attendance-month-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    SearchDropdownComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Filters Section -->
      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
            <input 
              type="month"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              [value]="getMonthValue()"
              (change)="onMonthChange($event)"
            />
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

      <!-- Month Summary -->
      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getMonthSummary().totalEmployees }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Employees</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getMonthSummary().presentDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Present Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ getMonthSummary().timeOffDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Time Off Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ getMonthSummary().noTrackDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">No Track Days</div>
          </div>
        </div>
      </app-card>

      <!-- Calendar View -->
      <app-card>
        <div class="overflow-x-auto">
          <div class="min-w-full">
            <!-- Calendar Header -->
            <div class="grid grid-cols-8 gap-1 mb-4">
              <div class="p-2 text-center font-medium text-gray-700 dark:text-gray-300">Employee</div>
              @for (day of getCalendarDays(); track day.date) {
                <div class="p-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div>{{ day.dayNumber }}</div>
                  <div class="text-xs text-gray-500">{{ day.dayName }}</div>
                </div>
              }
            </div>
            
            <!-- Calendar Body -->
            <div class="space-y-1">
              @if (loading()) {
                <div class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span class="ml-2 text-gray-600 dark:text-gray-400">Loading attendance records...</span>
                </div>
              } @else if (attendanceRecords().length === 0) {
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                  No attendance records found for the selected month.
                </div>
              } @else {
                @for (employee of getEmployeeMonthData(); track employee.employee_id) {
                  <div class="grid grid-cols-8 gap-1 py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div class="p-2 flex items-center">
                      <div class="flex-shrink-0 h-6 w-6 mr-2">
                        <div class="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-xs font-medium text-gray-700">
                            {{ employee.employee_name.charAt(0) || '?' }}
                          </span>
                        </div>
                      </div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ employee.employee_name || 'Unknown Employee' }}
                      </div>
                    </div>
                    @for (day of getCalendarDays(); track day.date) {
                      <div class="p-1 text-center">
                        @if (employee.attendance[day.date]) {
                          <div class="flex flex-col items-center space-y-1">
                            <span [class]="getStatusClasses(employee.attendance[day.date].status_color)" class="text-xs">
                              {{ employee.attendance[day.date].status_label }}
                            </span>
                            @if (employee.attendance[day.date].in_time && employee.attendance[day.date].out_time) {
                              <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ formatTime(employee.attendance[day.date].in_time) }}
                              </div>
                              <div class="text-xs font-medium">
                                {{ formatWorkingHours(employee.attendance[day.date].working_hours) }}
                              </div>
                            } @else if (employee.attendance[day.date].time_off_type_name) {
                              <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ employee.attendance[day.date].time_off_type_name }}
                              </div>
                            }
                          </div>
                        } @else {
                          <div class="text-xs text-gray-400">-</div>
                        }
                      </div>
                    }
                  </div>
                }
              }
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .status-success {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }
    
    .status-warning {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }
    
    .status-secondary {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200;
    }
  `]
})
export class AttendanceMonthViewComponent {
  // Signals
  attendanceRecords = signal<AttendanceRecord[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedMonth = signal<Date | null>(null);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly bambooHRService: BambooHRService
  ) {
    this.loadEmployees();
    this.selectedMonth.set(new Date());
  }

  loadEmployees(): void {
    this.bambooHRService.getEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          // Handle different response structures
          const employeesData = response.data.data || response.data;
          if (Array.isArray(employeesData)) {
            const employeeOptions = employeesData.map((emp: any) => ({
              label: emp.full_name || `${emp.first_name} ${emp.last_name}`,
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
      view_type: 'month'
    };

    if (this.selectedEmployee()) {
      const employee = this.selectedEmployee();
      if (employee) {
        filters.employee_id = employee.value;
      }
    }
    
    if (this.selectedMonth()) {
      const month = this.selectedMonth();
      if (month) {
        const startOfMonth = this.getStartOfMonth(month);
        const endOfMonth = this.getEndOfMonth(month);
        filters.start_date = startOfMonth.toISOString().split('T')[0];
        filters.end_date = endOfMonth.toISOString().split('T')[0];
      }
    }

    this.attendanceService.getAttendance(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.attendanceRecords.set(response.data.data);
          this.totalRecords.set(response.data.total);
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

  onEmployeeChange(employee: SearchDropdownOption | null): void {
    this.selectedEmployee.set(employee);
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedMonth.set(target.value ? new Date(target.value + '-01') : null);
  }

  clearFilters(): void {
    this.selectedEmployee.set(null);
    this.selectedMonth.set(new Date());
    this.attendanceRecords.set([]);
    this.totalRecords.set(0);
  }

  getMonthValue(): string {
    if (!this.selectedMonth()) return '';
    const date = this.selectedMonth();
    const year = date!.getFullYear();
    const month = (date!.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  getEndOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  getCalendarDays(): any[] {
    if (!this.selectedMonth()) return [];
    
    const month = this.selectedMonth()!;
    const startOfMonth = this.getStartOfMonth(month);
    const endOfMonth = this.getEndOfMonth(month);
    const days = [];
    
    // Add days from previous month to fill the first week
    const startDay = startOfMonth.getDay();
    const prevMonth = new Date(month.getFullYear(), month.getMonth() - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - i);
      days.push({
        date: day.toISOString().split('T')[0],
        dayNumber: day.getDate(),
        dayName: day.toLocaleDateString('en', { weekday: 'short' }),
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: day,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(month.getFullYear(), month.getMonth() + 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        dayNumber: day,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        isCurrentMonth: false
      });
    }
    
    return days;
  }

  getEmployeeMonthData(): any[] {
    const employeeMap = new Map();
    
    this.attendanceRecords().forEach(record => {
      if (!employeeMap.has(record.employee_id)) {
        employeeMap.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          attendance: {}
        });
      }
      
      const employee = employeeMap.get(record.employee_id);
      employee.attendance[record.attendance_date] = record;
    });
    
    return Array.from(employeeMap.values());
  }

  getMonthSummary(): any {
    const records = this.attendanceRecords();
    const employeeIds = new Set(records.map(r => r.employee_id));
    
    return {
      totalEmployees: employeeIds.size,
      presentDays: records.filter(r => r.status === 'present').length,
      timeOffDays: records.filter(r => r.status === 'time_off').length,
      noTrackDays: records.filter(r => r.status === 'no_track').length
    };
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatWorkingHours(hours: number | null): string {
    if (!hours) return '-';
    return `${hours.toFixed(1)}h`;
  }

  getStatusClasses(statusColor: string): string {
    switch (statusColor) {
      case 'success':
        return 'status-success';
      case 'warning':
        return 'status-warning';
      case 'secondary':
        return 'status-secondary';
      default:
        return 'status-secondary';
    }
  }
}
