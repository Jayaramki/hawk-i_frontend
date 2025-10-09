import { Component, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../../shared/components/search-dropdown/search-dropdown.component';

import { AttendanceService, AttendanceRecord, AttendanceFilters } from '../../../shared/services/attendance.service';
import { InatechEmployeeService } from '../../../shared/services/inatech-employee.service';

// Interfaces for month view
interface MonthDay {
  date: string;
  dayNumber: number;
  dayName: string;
  isCurrentMonth: boolean;
  status?: 'present' | 'time_off' | 'no_track';
  status_label?: string;
  status_color?: 'success' | 'warning' | 'danger' | 'secondary';
  in_time?: string | null;
  out_time?: string | null;
  working_hours?: number | null;
  time_off_type_name?: string | null;
}

interface EmployeeMonthData {
  employee_id: number;
  employee_name: string;
  days: MonthDay[];
  totalHours: number;
}

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

      <!-- Month Ledger View -->
      <app-card>
        <div class="ledger-container">
          <!-- Ledger Header -->
          <div class="ledger-header">
            <div class="employee-column-header">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</div>
            </div>
            <div class="days-scroll-container" #headerScrollContainer>
              <div class="days-container">
                @if (attendanceRecords().length > 0) {
                  @for (day of attendanceRecords()[0].days; track day.date) {
                    <div class="day-header">
                      <div class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ day.dayName }}</div>
                      <div class="text-xs text-gray-500">{{ formatDateHeader(day.date) }}</div>
                    </div>
                  }
                } @else {
                  <!-- Fallback headers when no data -->
                  @for (day of getMonthDays(); track day.date) {
                    <div class="day-header">
                      <div class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ day.dayName }}</div>
                      <div class="text-xs text-gray-500">{{ formatDateHeader(day.date) }}</div>
                    </div>
                  }
                }
                <div class="total-header">
                  <div class="text-xs font-semibold text-gray-700 dark:text-gray-300">Total</div>
                  <div class="text-xs text-gray-500">Hours</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ledger Body -->
          <div class="ledger-body">
            @if (loading()) {
              <div class="loading-row">
                <div class="employee-column">
                  <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="ml-2 text-gray-600 dark:text-gray-400">Loading attendance records...</span>
                  </div>
                </div>
              </div>
            } @else if (attendanceRecords().length === 0) {
              <div class="loading-row">
                <div class="employee-column">
                  <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    No attendance records found for the selected month.
                  </div>
                </div>
              </div>
            } @else {
              <div class="ledger-content">
                <!-- Employee Names Column (Frozen) -->
                <div class="employee-names-column">
                  @for (employee of attendanceRecords(); track employee.employee_id) {
                    <div class="employee-name-row">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-8 w-8 mr-3">
                          <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ employee.employee_name.charAt(0) || '?' }}
                            </span>
                          </div>
                        </div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {{ employee.employee_name || 'Unknown Employee' }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
                
                <!-- Days Data Column (Scrollable) -->
                <div class="days-data-column" #bodyScrollContainer>
                  @for (employee of attendanceRecords(); track employee.employee_id) {
                    <div class="employee-days-row">
                      @for (day of employee.days; track trackByDay($index, day)) {
                        <div class="day-cell">
                          <div class="flex flex-col items-center space-y-1">
                            <span [class]="getStatusClasses(day.status_color || 'secondary')" class="text-xs">
                              {{ day.status_label }}
                            </span>
                            @if (day.in_time && day.out_time) {
                              <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ formatTime(day.in_time) }} - {{ formatTime(day.out_time) }}
                              </div>
                              <div class="text-xs font-medium">
                                {{ formatWorkingHours(day.working_hours || 0) }}
                              </div>
                            } @else if (day.time_off_type_name) {
                              <div class="text-xs text-gray-600 dark:text-gray-400">
                                {{ day.time_off_type_name }}
                              </div>
                            }
                          </div>
                        </div>
                      }
                      <!-- Total Hours Column -->
                      <div class="total-cell">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ formatWorkingHours(employee.totalHours) }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .ledger-container {
      @apply overflow-hidden;
    }

    .ledger-header {
      @apply flex border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800;
    }

    .employee-column-header {
      @apply w-64 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700;
    }

    .days-scroll-container {
      @apply flex-1 overflow-x-auto;
    }

    .days-container {
      @apply flex;
    }

    .day-header {
      @apply w-20 flex-shrink-0 p-2 text-center border-r border-gray-200 dark:border-gray-700;
    }

    .total-header {
      @apply w-16 flex-shrink-0 p-2 text-center bg-gray-100 dark:bg-gray-700;
    }

    .ledger-body {
      @apply max-h-96 overflow-y-auto;
    }

    .ledger-content {
      @apply flex;
    }

    .employee-names-column {
      @apply w-64 flex-shrink-0;
    }

    .employee-name-row {
      @apply p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900;
    }

    .days-data-column {
      @apply flex-1 overflow-x-auto;
    }

    .employee-days-row {
      @apply flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800;
    }

    .day-cell {
      @apply w-20 flex-shrink-0 p-2 text-center border-r border-gray-200 dark:border-gray-700;
    }

    .total-cell {
      @apply w-16 flex-shrink-0 p-2 text-center bg-gray-50 dark:bg-gray-800 font-medium;
    }

    .loading-row {
      @apply flex;
    }

    .employee-column {
      @apply w-64 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900;
    }

    .status-success {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
    }
    
    .status-warning {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
    }
    
    .status-danger {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
    }
    
    .status-secondary {
      @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200;
    }
  `]
})
export class AttendanceMonthViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('headerScrollContainer') headerScrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('bodyScrollContainer') bodyScrollContainer!: ElementRef<HTMLDivElement>;

  // Signals
  attendanceRecords = signal<EmployeeMonthData[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedMonth = signal<Date | null>(null);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly inatechEmployeeService: InatechEmployeeService
  ) {
    this.loadEmployees();
    this.selectedMonth.set(new Date());
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
        const year = month.getFullYear();
        const monthIndex = month.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        
        // Simple date construction for the selected month
        filters.start_date = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01`;
        filters.end_date = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;
      }
    }

    this.attendanceService.getAttendance(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Process data for month view using the same logic as week view
          const processedData = this.processMonthAttendanceData(response.data.data);
          this.attendanceRecords.set(processedData);
          this.totalRecords.set(processedData.length);
          
          // Setup scroll synchronization after data is loaded
          setTimeout(() => {
            this.setupScrollSynchronization();
          }, 100);
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
    if (target.value) {
      // Parse the month input (YYYY-MM format) and create a date for the first day of that month
      // Use explicit date creation to avoid timezone issues
      const [year, month] = target.value.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      this.selectedMonth.set(monthDate);
    } else {
      this.selectedMonth.set(null);
    }
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



  processMonthAttendanceData(data: AttendanceRecord[]): EmployeeMonthData[] {
    if (!this.selectedMonth()) return [];
    
    const selectedMonth = this.selectedMonth()!;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get the number of days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthDays: Array<{date: string, dayNumber: number, dayName: string}> = [];
    
    // Generate ONLY the days of the selected month (1 to last day of month)
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string directly to avoid timezone issues
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      monthDays.push({
        date: dateString,
        dayNumber: day,
        dayName: dayName
      });
    }
    
    // Get all employees first, then process their attendance
    const allEmployees = this.employees();
    const employeeMap = new Map<number, EmployeeMonthData>();
    
    // Initialize all employees with empty attendance
    allEmployees.forEach(emp => {
      employeeMap.set(emp.value, {
        employee_id: emp.value,
        employee_name: emp.label,
        days: monthDays.map(day => ({
          date: day.date,
          dayNumber: day.dayNumber,
          dayName: day.dayName,
          isCurrentMonth: true,
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
    });
    
    // Process attendance data
    data.forEach(record => {
      const employee = employeeMap.get(record.employee_id);
      if (!employee) return;
      
      const dayIndex = monthDays.findIndex(day => day.date === record.attendance_date);
      
      if (dayIndex !== -1) {
        // Update the day with actual attendance data
        employee.days[dayIndex] = {
          date: record.attendance_date,
          dayNumber: monthDays[dayIndex].dayNumber,
          dayName: monthDays[dayIndex].dayName,
          isCurrentMonth: true,
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

  getMonthDays(): MonthDay[] {
    if (!this.selectedMonth()) return [];
    
    const selectedMonth = this.selectedMonth()!;
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get the number of days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: MonthDay[] = [];
    
    // Generate ONLY the days of the selected month (1 to last day of month)
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string directly to avoid timezone issues
      const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      days.push({
        date: dateString,
        dayNumber: day,
        dayName: dayName,
        isCurrentMonth: true
      });
    }
    
    return days;
  }

  formatDateHeader(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  trackByDay(index: number, day: any): string {
    return `${index}-${day.date}-${day.status}`;
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return '-';
    
    // Handle time-only strings (HH:MM:SS format)
    const timeOnlyRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (timeOnlyRegex.test(timeString)) {
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

  getStatusClasses(statusColor: string): string {
    switch (statusColor) {
      case 'success':
        return 'status-success';
      case 'warning':
        return 'status-warning';
      case 'danger':
        return 'status-danger';
      case 'secondary':
        return 'status-secondary';
      default:
        return 'status-secondary';
    }
  }

  // Store bound functions for proper cleanup
  private headerScrollHandler?: () => void;
  private bodyScrollHandler?: () => void;

  ngAfterViewInit(): void {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.setupScrollSynchronization();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up event listeners properly
    if (this.headerScrollContainer && this.headerScrollHandler) {
      this.headerScrollContainer.nativeElement.removeEventListener('scroll', this.headerScrollHandler);
    }
    if (this.bodyScrollContainer && this.bodyScrollHandler) {
      this.bodyScrollContainer.nativeElement.removeEventListener('scroll', this.bodyScrollHandler);
    }
  }

  private setupScrollSynchronization(): void {
    if (this.headerScrollContainer && this.bodyScrollContainer) {
      console.log('Setting up scroll synchronization...');
      
      // Create bound functions for proper cleanup
      this.headerScrollHandler = () => {
        if (this.bodyScrollContainer) {
          const scrollLeft = this.headerScrollContainer.nativeElement.scrollLeft;
          console.log('Header scroll:', scrollLeft);
          this.bodyScrollContainer.nativeElement.scrollTo({
            left: scrollLeft,
            behavior: 'auto'
          });
        }
      };

      this.bodyScrollHandler = () => {
        if (this.headerScrollContainer) {
          const scrollLeft = this.bodyScrollContainer.nativeElement.scrollLeft;
          console.log('Body scroll:', scrollLeft);
          this.headerScrollContainer.nativeElement.scrollTo({
            left: scrollLeft,
            behavior: 'auto'
          });
        }
      };

      // Add event listeners
      this.headerScrollContainer.nativeElement.addEventListener('scroll', this.headerScrollHandler);
      this.bodyScrollContainer.nativeElement.addEventListener('scroll', this.bodyScrollHandler);
      
      console.log('Scroll synchronization setup complete');
    } else {
      console.log('Scroll containers not found:', {
        header: !!this.headerScrollContainer,
        body: !!this.bodyScrollContainer
      });
    }
  }
}
