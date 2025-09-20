import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

// Design System Components
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { GridColumn } from '../../shared/components/client-grid/client-grid.component';

import { AttendanceService, AttendanceRecord, AttendanceFilters } from '../../shared/services/attendance.service';
import { BambooHRService } from '../../shared/services/bamboohr.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    LayoutComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  // Signals
  attendanceRecords = signal<AttendanceRecord[]>([]);
  employees = signal<any[]>([]);
  departments = signal<any[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<any>(null);
  selectedDepartment = signal<any>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  // Pagination
  first = signal(0);
  rows = signal(15);

  // Import Modal
  showImportModal = signal(false);
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  importResult = signal<any>(null);

  // Grid configuration
  columns: GridColumn[] = [
    { key: 'employee_name', title: 'Employee', sortable: true },
    { key: 'department', title: 'Department', sortable: true },
    { key: 'attendance_date', title: 'Date', sortable: true },
    { key: 'in_time', title: 'Check In', sortable: false },
    { key: 'out_time', title: 'Check Out', sortable: false },
    { key: 'working_hours', title: 'Hours', sortable: true },
    { key: 'status', title: 'Status', sortable: false }
  ];

  // Document reference for template
  document = document;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly bamboohrService: BambooHRService,
    private readonly messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadAttendanceRecords();
  }

  loadEmployees(): void {
    this.bamboohrService.getEmployees().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Handle different response structures
          const employeesData = response.data.data || response.data;
          if (Array.isArray(employeesData)) {
            this.employees.set(employeesData.map((emp: any) => ({
              label: emp.full_name || `${emp.first_name} ${emp.last_name}`,
              value: emp.id,
              bamboohr_id: emp.bamboohr_id
            })));
          }
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
      }
    });
  }

  loadDepartments(): void {
    this.bamboohrService.getDepartments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Handle different response structures
          const departmentsData = response.data.data || response.data;
          if (Array.isArray(departmentsData)) {
            this.departments.set(departmentsData.map((dept: any) => ({
              label: dept.name,
              value: dept.id
            })));
          }
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
      }
    });
  }

  loadAttendanceRecords(): void {
    this.loading.set(true);
    
    const filters: AttendanceFilters = {
      per_page: this.rows()
    };

    if (this.selectedEmployee()) {
      filters.employee_id = this.selectedEmployee().value;
    }
    if (this.selectedDepartment()) {
      filters.department_id = this.selectedDepartment().value;
    }
    if (this.startDate()) {
      filters.start_date = this.startDate()!.toISOString().split('T')[0];
    }
    if (this.endDate()) {
      filters.end_date = this.endDate()!.toISOString().split('T')[0];
    }

    this.attendanceService.getAttendance(filters).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          // Handle paginated response structure
          const attendanceData = response.data.data || response.data;
          this.attendanceRecords.set(attendanceData);
          this.totalRecords.set(response.data.total || attendanceData.length);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load attendance records'
          });
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load attendance records'
        });
        console.error('Error loading attendance:', error);
      }
    });
  }

  onFilterChange(): void {
    this.first.set(0);
    this.loadAttendanceRecords();
  }

  onPageChange(event: any): void {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.loadAttendanceRecords();
  }

  clearFilters(): void {
    this.selectedEmployee.set(null);
    this.selectedDepartment.set(null);
    this.startDate.set(null);
    this.endDate.set(null);
    this.onFilterChange();
  }

  showImportDialog(): void {
    this.showImportModal.set(true);
    this.selectedFile.set(null);
    this.importResult.set(null);
  }

  hideImportDialog(): void {
    this.showImportModal.set(false);
    this.selectedFile.set(null);
    this.importResult.set(null);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.attendanceService.validateFile(file);
      if (validation.valid) {
        this.selectedFile.set(file);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: validation.message
        });
        event.target.value = '';
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select a file to upload'
      });
      return;
    }

    this.isUploading.set(true);

    this.attendanceService.importAttendance(this.selectedFile()!).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        this.importResult.set(response);

        if (response.success) {
          // Check if there are any errors even in successful response
          const hasErrors = response.data?.errors && response.data.errors.length > 0;
          const hasProcessedRecords = (response.data?.processed_count ?? 0) > 0;
          
          if (hasErrors && hasProcessedRecords) {
            // Partial success - some records processed, some had errors
            this.messageService.add({
              severity: 'warn',
              summary: 'Import Partially Successful',
              detail: `Processed ${response.data?.processed_count ?? 0} records, ${response.data?.error_count ?? 0} errors occurred`
            });
          } else if (hasErrors && !hasProcessedRecords) {
            // All records had errors
            this.messageService.add({
              severity: 'error',
              summary: 'Import Failed',
              detail: response.message || 'All records failed validation'
            });
          } else {
            // Complete success
            this.messageService.add({
              severity: 'success',
              summary: 'Import Successful',
              detail: `Processed ${response.data?.processed_count ?? 0} records successfully`
            });
          }
          
          this.loadAttendanceRecords(); // Refresh the data
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: response.message
          });
        }
      },
      error: (error) => {
        this.isUploading.set(false);
        
        // Handle different types of errors
        let errorMessage = 'An error occurred while uploading the file';
        let errorDetails: string[] = [];
        
        if (error.error) {
          if (error.error.message) {
            errorMessage = error.error.message;
          }
          if (error.error.errors) {
            // Handle validation errors
            if (typeof error.error.errors === 'object') {
              Object.keys(error.error.errors).forEach(key => {
                if (Array.isArray(error.error.errors[key])) {
                  errorDetails.push(...error.error.errors[key]);
                } else {
                  errorDetails.push(error.error.errors[key]);
                }
              });
            } else if (Array.isArray(error.error.errors)) {
              errorDetails = error.error.errors;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Set import result with error details
        this.importResult.set({
          success: false,
          message: errorMessage,
          data: {
            processed_count: 0,
            error_count: errorDetails.length,
            total_rows: 0,
            errors: errorDetails
          }
        });
        
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: errorMessage
        });
        console.error('Upload error:', error);
      }
    });
  }

  getStatusClass(record: AttendanceRecord): string {
    if (record.in_time && record.out_time) {
      return 'status-complete';
    } else if (record.in_time && !record.out_time) {
      return 'status-checked-in';
    } else {
      return 'status-incomplete';
    }
  }

  getStatusText(record: AttendanceRecord): string {
    if (record.in_time && record.out_time) {
      return 'Complete';
    } else if (record.in_time && !record.out_time) {
      return 'Checked In';
    } else {
      return 'Incomplete';
    }
  }

  formatTime(time: string | null): string {
    if (!time) return '-';
    return new Date('1970-01-01T' + time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}