import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../../shared/components/search-dropdown/search-dropdown.component';

import { AttendanceService, AttendanceRecord, AttendanceFilters } from '../../../shared/services/attendance.service';
import { InatechEmployeeService } from '../../../shared/services/inatech-employee.service';

// Week view specific interfaces
interface WeekDay {
  date: string;
  dayName: string;
  dayIndex: number;
  status: 'present' | 'time_off' | 'no_track';
  status_label: string;
  status_color: 'success' | 'warning' | 'danger' | 'secondary';
  in_time: string | null;
  out_time: string | null;
  working_hours: number | null;
  time_off_type_name: string | null;
}

interface EmployeeWeekData {
  employee_id: number;
  employee_name: string;
  days: WeekDay[];
  totalHours: number;
}

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


      <!-- Attendance Grid -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                @if (attendanceRecords().length > 0) {
                  @for (day of attendanceRecords()[0].days; track day.date) {
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div class="flex flex-col items-center">
                        <span class="font-semibold">{{ day.dayName }}</span>
                        <span class="text-xs text-gray-400 font-normal">{{ formatDateHeader(day.date) }}</span>
                      </div>
                    </th>
                  }
                } @else {
                  <!-- Fallback headers when no data -->
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Mon</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Tue</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Wed</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Thu</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Fri</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Sat</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div class="flex flex-col items-center">
                      <span class="font-semibold">Sun</span>
                      <span class="text-xs text-gray-400 font-normal">--</span>
                    </div>
                  </th>
                }
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div class="flex flex-col items-center">
                    <span class="font-semibold">Total</span>
                    <span class="text-xs text-gray-400 font-normal">Hours</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              @if (loading()) {
                <tr>
                  <td [attr.colspan]="attendanceRecords().length > 0 ? attendanceRecords()[0].days.length + 2 : 8" class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span class="ml-2 text-gray-600 dark:text-gray-400">Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              } @else if (attendanceRecords().length === 0) {
                <tr>
                  <td [attr.colspan]="attendanceRecords().length > 0 ? attendanceRecords()[0].days.length + 2 : 8" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No attendance records found for the selected week.
                  </td>
                </tr>
              } @else {
                @for (employee of attendanceRecords(); track employee.employee_id) {
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
export class AttendanceWeekViewComponent implements OnInit {
  // Signals
  attendanceRecords = signal<EmployeeWeekData[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedWeek = signal<Date | null>(null);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly inatechEmployeeService: InatechEmployeeService
  ) {
    this.loadEmployees();
    this.selectedWeek.set(new Date());
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
          const processedData = this.processWeekAttendanceData(response.data.data);
          this.attendanceRecords.set(processedData);
          this.totalRecords.set(processedData.length);
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
      const yearNum = parseInt(year);
      const weekNum = parseInt(week);
      
      // Use ISO week calculation - more reliable approach
      // Create a date for January 4th (always in week 1 of ISO weeks)
      const jan4 = new Date(yearNum, 0, 4);
      
      // Get the day of week for January 4th (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = jan4.getDay();
      
      // Calculate the Monday of week 1
      const mondayOfWeek1 = new Date(jan4);
      mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);
      
      // Calculate the start of the selected week
      const weekStart = new Date(mondayOfWeek1);
      weekStart.setDate(mondayOfWeek1.getDate() + (weekNum - 1) * 7);
      
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
    // Use ISO week calculation for consistency
    const jan4 = new Date(date.getFullYear(), 0, 4);
    const dayOfWeek = jan4.getDay();
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setDate(jan4.getDate() - dayOfWeek + 1);
    
    const diffTime = date.getTime() - mondayOfWeek1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;
    
    return weekNumber;
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

  formatDateHeader(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit' 
    });
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

  processWeekAttendanceData(data: AttendanceRecord[]): EmployeeWeekData[] {
    if (!this.selectedWeek()) return [];
    
    const weekStart = this.getStartOfWeek(this.selectedWeek()!);
    const weekDays: Array<{date: string, dayName: string, dayIndex: number}> = [];
    
    // Generate all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push({
        date: day.toISOString().split('T')[0],
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayIndex: i
      });
    }
    
    // Group data by employee
    const employeeMap = new Map<number, EmployeeWeekData>();
    
    data.forEach(record => {
      if (!employeeMap.has(record.employee_id)) {
        employeeMap.set(record.employee_id, {
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          days: weekDays.map(day => ({
            date: day.date,
            dayName: day.dayName,
            dayIndex: day.dayIndex,
            status: 'no_track' as const,
            status_label: 'No Track',
            status_color: 'danger' as const,
            in_time: null,
            out_time: null,
            working_hours: null,
            time_off_type_name: null
          })),
          totalHours: 0
        });
      }
      
      const employee = employeeMap.get(record.employee_id);
      if (!employee) return;
      
      const dayIndex = weekDays.findIndex(day => day.date === record.attendance_date);
      
      if (dayIndex !== -1) {
        // Update the day with actual attendance data
        employee.days[dayIndex] = {
          date: record.attendance_date,
          dayName: weekDays[dayIndex].dayName,
          dayIndex: dayIndex,
          status: record.status,
          status_label: record.status_label + (record.time_off_type_name ? ` (${record.time_off_type_name})` : ''),
          status_color: record.status_color as 'success' | 'warning' | 'danger' | 'secondary',
          in_time: record.in_time,
          out_time: record.out_time,
          working_hours: record.working_hours,
          time_off_type_name: record.time_off_type_name
        };
        
        // Add to total hours if present
        if (record.status === 'present' && record.working_hours) {
          employee.totalHours += record.working_hours;
        }
      }
    });
    
    return Array.from(employeeMap.values());
  }

  trackByDay(index: number, day: any): string {
    // Create a unique key combining index, date, and status
    const date = day.date || `day-${index}`;
    const status = day.status || 'unknown';
    return `${index}-${date}-${status}`;
  }
}
