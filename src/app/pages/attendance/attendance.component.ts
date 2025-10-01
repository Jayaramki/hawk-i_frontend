import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Design System Components
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../shared/components/search-dropdown/search-dropdown.component';

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
    LayoutComponent,
    SearchDropdownComponent
  ],
  // providers: [MessageService],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  // Signals
  attendanceRecords = signal<AttendanceRecord[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  departments = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedDepartment = signal<SearchDropdownOption | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  // Pagination
  first = signal(0);
  rows = signal(15);
  currentPage = signal(1);
  
  // Records per page options
  recordsPerPageOptions = [
    { label: '15', value: 15 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // Import Modal
  showImportModal = signal(false);
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  importResult = signal<any>(null);

  // Grid configuration removed for now

  // Document reference for template
  document = document;

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly bamboohrService: BambooHRService
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
              searchText: `${emp.full_name || `${emp.first_name} ${emp.last_name}`} ${emp.email || ''}`.trim()
            })));
          }
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        console.error('Failed to load employees');
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
              value: dept.id,
              searchText: dept.name
            })));
          }
        }
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        console.error('Failed to load departments');
      }
    });
  }

  loadAttendanceRecords(): void {
    this.loading.set(true);
    
    console.log('Loading attendance with per_page:', this.rows());
    
    const filters: AttendanceFilters = {
      per_page: this.rows(),
      page: this.currentPage()
    };

    if (this.selectedEmployee()) {
      const employee = this.selectedEmployee();
      if (employee) {
        filters.employee_id = employee.value;
      }
    }
    if (this.selectedDepartment()) {
      const department = this.selectedDepartment();
      if (department) {
        filters.department_id = department.value;
      }
    }
    if (this.startDate()) {
      const startDate = this.startDate();
      if (startDate) {
        filters.start_date = startDate.toISOString().split('T')[0];
      }
    }
    if (this.endDate()) {
      const endDate = this.endDate();
      if (endDate) {
        filters.end_date = endDate.toISOString().split('T')[0];
      }
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
    this.onFilterChange();
  }

  onDepartmentChange(department: SearchDropdownOption | null): void {
    this.selectedDepartment.set(department);
    this.onFilterChange();
  }

  onStartDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateValue = target.value;
    if (dateValue) {
      this.startDate.set(new Date(dateValue));
    } else {
      this.startDate.set(null);
    }
    this.onFilterChange();
  }

  onEndDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateValue = target.value;
    if (dateValue) {
      this.endDate.set(new Date(dateValue));
    } else {
      this.endDate.set(null);
    }
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.first.set(0);
    this.loadAttendanceRecords();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.first.set((page - 1) * this.rows());
    this.loadAttendanceRecords();
  }

  onRecordsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newRows = parseInt(target.value, 10);
    this.rows.set(newRows);
    this.currentPage.set(1);
    this.first.set(0);
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
        console.error('Invalid File:', validation.message);
        event.target.value = '';
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile()) {
      console.warn('No File Selected - Please select a file to upload');
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
            console.warn(`Import Partially Successful - Processed ${response.data?.processed_count ?? 0} records, ${response.data?.error_count ?? 0} errors occurred`);
          } else if (hasErrors && !hasProcessedRecords) {
            // All records had errors
            console.error('Import Failed:', response.message || 'All records failed validation');
          } else {
            // Complete success
            console.log(`Import Successful - Processed ${response.data?.processed_count ?? 0} records successfully`);
          }
          
          this.loadAttendanceRecords(); // Refresh the data
        } else {
          console.error('Import Failed:', response.message);
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
        
        console.error('Upload Failed:', errorMessage);
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

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.rows(), this.totalRecords());
  }

  getTotalPages(): number {
    return Math.ceil(this.totalRecords() / this.rows());
  }

  getServerPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage();
    const pages: number[] = [];
    
    // Show up to 5 page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

}