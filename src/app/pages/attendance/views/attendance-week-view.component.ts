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
  selector: 'app-attendance-week-view',
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
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Week</label>
            <input 
              type="week"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              [value]="getWeekValue()"
              (change)="onWeekChange($event)"
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

      <!-- Week Summary -->
      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ getWeekSummary().totalEmployees }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Employees</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ getWeekSummary().presentDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Present Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ getWeekSummary().timeOffDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Time Off Days</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">{{ getWeekSummary().noTrackDays }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">No Track Days</div>
          </div>
        </div>
      </app-card>

      <!-- Attendance Grid -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mon
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tue
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Wed
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thu
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fri
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sat
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sun
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Hours
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              @if (loading()) {
                <tr>
                  <td colspan="9" class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              } @else if (attendanceRecords().length === 0) {
                <tr>
                  <td colspan="9" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No attendance records found for the selected week.
                  </td>
                </tr>
              } @else {
                @for (employee of getEmployeeWeekData(); track employee.employee_id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8">
                          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ employee.employee_name.charAt(0) || '?' }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-3">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ employee.employee_name || 'Unknown Employee' }}
                          </div>
                        </div>
                      </div>
                    </td>
                    @for (day of employee.days; track trackByDay($index, day)) {
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <div class="flex flex-col items-center space-y-1">
                          <span [class]="getStatusClasses(day.status_color)" class="text-xs">
                            {{ day.status_label }}
                          </span>
                          @if (day.in_time && day.out_time) {
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                              {{ formatTime(day.in_time) }} - {{ formatTime(day.out_time) }}
                            </div>
                            <div class="text-xs font-medium">
                              {{ formatWorkingHours(day.working_hours) }}
                            </div>
                          } @else if (day.time_off_type_name) {
                            <div class="text-xs text-gray-600 dark:text-gray-400">
                              {{ day.time_off_type_name }}
                            </div>
                          }
                        </div>
                      </td>
                    }
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {{ formatWorkingHours(employee.totalHours) }}
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .status-success {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }
    
    .status-warning {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }
    
    .status-secondary {
      @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200;
    }
  `]
})
export class AttendanceWeekViewComponent {
  // Signals
  attendanceRecords = signal<AttendanceRecord[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedWeek = signal<Date | null>(null);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly bambooHRService: BambooHRService
  ) {
    this.loadEmployees();
    this.selectedWeek.set(new Date());
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
      view_type: 'week'
    };

    if (this.selectedEmployee()) {
      const employee = this.selectedEmployee();
      if (employee) {
        filters.employee_id = employee.value;
      }
    }
    
    if (this.selectedWeek()) {
      const week = this.selectedWeek();
      if (week) {
        const startOfWeek = this.getStartOfWeek(week);
        const endOfWeek = this.getEndOfWeek(week);
        filters.start_date = startOfWeek.toISOString().split('T')[0];
        filters.end_date = endOfWeek.toISOString().split('T')[0];
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

  onWeekChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.value) {
      // Parse week input format (YYYY-WNN) to get the first day of the week
      const [year, week] = target.value.split('-W');
      const firstDayOfYear = new Date(parseInt(year), 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      const dayOfWeek = firstDayOfYear.getDay();
      const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // Get to first Monday
      firstMonday.setDate(firstDayOfYear.getDate() + daysToAdd);
      
      // Calculate the start of the selected week
      const weekStart = new Date(firstMonday);
      weekStart.setDate(firstMonday.getDate() + (parseInt(week) - 1) * 7);
      
      this.selectedWeek.set(weekStart);
    } else {
      this.selectedWeek.set(null);
    }
  }

  clearFilters(): void {
    this.selectedEmployee.set(null);
    this.selectedWeek.set(new Date());
    this.attendanceRecords.set([]);
    this.totalRecords.set(0);
  }

  getWeekValue(): string {
    if (!this.selectedWeek()) return '';
    const date = this.selectedWeek();
    if (!date) return '';
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  getEmployeeWeekData(): any[] {
    const employeeMap = new Map();
    
    this.attendanceRecords().forEach(record => {
      if (!employeeMap.has(record.employee_id)) {
        employeeMap.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          days: [],
          totalHours: 0
        });
      }
      
      const employee = employeeMap.get(record.employee_id);
      employee.days.push(record);
      if (record.working_hours) {
        employee.totalHours += record.working_hours;
      }
    });
    
    return Array.from(employeeMap.values());
  }

  getWeekSummary(): any {
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

  trackByDay(index: number, day: any): string {
    // Create a unique key combining index, date, and status
    const date = day.date || `day-${index}`;
    const status = day.status || 'unknown';
    return `${index}-${date}-${status}`;
  }
}
