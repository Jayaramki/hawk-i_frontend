import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BambooHRStatus {
  status: string;
  data: {
    stats: {
      employees: number;
      departments: number;
      job_titles: number;
      time_off: number;
    };
    last_sync: {
      employees: string | null;
      departments: string | null;
      job_titles: string | null;
      time_off: string | null;
    };
  };
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    timestamp?: string;
    error?: string;
  };
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface Employee {
  id: number;
  bamboohr_id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  mapping_status: string;
  department_id: number;
  hire_date: string;
  termination_date: string | null;
  status: string;
  work_email: string;
  mobile_phone: string;
  work_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  supervisor_id: number | null;
  last_sync_at: string;
  sync_status: string;
  error_message: string | null;
  department?: Department;
  supervisor?: Employee;
  time_off_requests?: TimeOffRequest[];
  full_name?: string;
}

export interface Department {
  id: number;
  bamboohr_id: string;
  name: string;
  description: string | null;
  parent_department_id: number | null;
  last_sync_at: string;
  sync_status: string;
  error_message: string | null;
  parent_department?: Department;
  child_departments?: Department[];
  employees?: Employee[];
}

export interface JobTitle {
  id: number;
  bamboohr_id: string;
  title: string;
  description: string | null;
  department_id: number | null;
  last_sync_at: string;
  sync_status: string;
  error_message: string | null;
  department?: Department;
  employees?: Employee[];
}

export interface TimeOffRequest {
  id: number;
  bamboohr_id: string;
  employee_id: number | null;
  type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  requested_date: string | null;
  approved_date: string | null;
  approved_by: number | null;
  notes: string | null;
  last_sync_at: string;
  sync_status: string;
  error_message: string | null;
  employee?: Employee;
  approver?: Employee;
}

export interface SyncHistory {
  id: number;
  table_name: string;
  project_id: string | null;
  sync_type: string;
  status: string;
  records_processed: number;
  error_message: string | null;
  last_sync_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncProgress {
  service: string;
  operation: string;
  status: 'initializing' | 'in_progress' | 'completed' | 'failed';
  progress: {
    total_employees?: number;
    total_batches?: number;
    processed_employees?: number;
    processed_batches?: number;
    current_batch?: number;
    api_calls_made?: number;
    current_employee?: string;
    errors?: string[];
  };
  message?: string;
  started_at?: string;
  completed_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BambooHRService {
  private apiUrl = `${environment.apiUrl}/api/v1/bamboohr`;
  
  // Signals for reactive state management
  private statusSignal = signal<BambooHRStatus | null>(null);
  private employeesSignal = signal<Employee[]>([]);
  private loadingSignal = signal<boolean>(false);
  
  // Public readonly signals
  public status = this.statusSignal.asReadonly();
  public employees = this.employeesSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  
  // Computed signals for derived state
  public employeeCount = computed(() => this.employeesSignal().length);
  public activeEmployees = computed(() => 
    this.employeesSignal().filter(emp => emp.status === 'Active').length
  );
  
  // Legacy observable for backward compatibility
  private statusSubject = new BehaviorSubject<BambooHRStatus | null>(null);
  public status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Test connection to BambooHR
   */
  testConnection(): Observable<ConnectionTestResponse> {
    return this.http.get<ConnectionTestResponse>(`${this.apiUrl}/test-connection`);
  }

  /**
   * Get sync status
   */
  getStatus(): Observable<BambooHRStatus> {
    return this.http.get<BambooHRStatus>(`${this.apiUrl}/status`);
  }

  /**
   * Refresh status and update the subject
   */
  refreshStatus(): void {
    this.getStatus().subscribe({
      next: (status) => this.statusSubject.next(status),
      error: (error) => console.error('Failed to refresh status:', error)
    });
  }

  /**
   * Sync all data
   */
  syncAll(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-all`, {});
  }

  /**
   * Sync employees (combined method)
   */
  syncEmployees(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-employees`, {});
  }

  /**
   * Sync employees directory (Part 1)
   */
  syncEmployeesDirectory(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-employees-directory`, {});
  }

  /**
   * Sync employees detailed (Part 2)
   */
  syncEmployeesDetailed(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-employees-detailed`, {});
  }

  /**
   * Sync departments
   */
  syncDepartments(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-departments`, {});
  }

  /**
   * Sync job titles
   */
  syncJobTitles(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-job-titles`, {});
  }

  /**
   * Sync time off requests
   */
  syncTimeOff(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-time-off`, {});
  }

  /**
   * Clear cache
   */
  clearCache(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/clear-cache`, {});
  }

  /**
   * Sync selected operations
   */
  syncSelected(operations: string[]): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/sync-selected`, { operations });
  }

  /**
   * Get employees with pagination and filters
   */
  getEmployees(params: {
    page?: number;
    status?: string;
    department_id?: number;
    search?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.department_id) queryParams.set('department_id', params.department_id.toString());
    if (params.search) queryParams.set('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString
      ? `${this.apiUrl}/employees?${queryString}`
      : `${this.apiUrl}/employees`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  /**
   * Get all employees without pagination (for client-side grid)
   */
  getAllEmployees(params: {
    status?: string;
    department_id?: number;
    search?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    this.loadingSignal.set(true);
    
    const queryParams = new URLSearchParams();
    
    // Always set all=true to fetch all employees
    queryParams.set('all', 'true');
    
    if (params.status) queryParams.set('status', params.status);
    if (params.department_id) queryParams.set('department_id', params.department_id.toString());
    if (params.search) queryParams.set('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `${this.apiUrl}/employees?${queryString}`;
    
    return this.http.get<{ success: boolean; data: any }>(url).pipe(
      map(response => {
        if (response.success && response.data?.data) {
          this.employeesSignal.set(response.data.data);
        }
        this.loadingSignal.set(false);
        return response;
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Get departments with pagination and filters
   */
  getDepartments(params: {
    page?: number;
    search?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.search) queryParams.set('search', params.search);

    const url = `${this.apiUrl}/departments?${queryParams.toString()}`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  /**
   * Get job titles with pagination and filters
   */
  getJobTitles(params: {
    page?: number;
    search?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.search) queryParams.set('search', params.search);

    const url = `${this.apiUrl}/job-titles?${queryParams.toString()}`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  /**
   * Get time off requests with pagination and filters
   */
  getTimeOff(params: {
    page?: number;
    status?: string;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.employee_id) queryParams.set('employee_id', params.employee_id.toString());
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);

    const url = `${this.apiUrl}/time-off?${queryParams.toString()}`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  /**
   * Get sync history
   */
  getSyncHistory(params: {
    page?: number;
    table?: string;
    status?: string;
  } = {}): Observable<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.table) queryParams.set('table', params.table);
    if (params.status) queryParams.set('status', params.status);

    const url = `${this.apiUrl}/sync-history?${queryParams.toString()}`;
    return this.http.get<{ success: boolean; data: any }>(url);
  }

  /**
   * Get employee by ID
   */
  getEmployee(id: number): Observable<{ success: boolean; data: Employee }> {
    return this.http.get<{ success: boolean; data: Employee }>(`${this.apiUrl}/employees/${id}`);
  }

  /**
   * Get department by ID
   */
  getDepartment(id: number): Observable<{ success: boolean; data: Department }> {
    return this.http.get<{ success: boolean; data: Department }>(`${this.apiUrl}/departments/${id}`);
  }

  /**
   * Get time off request by ID
   */
  getTimeOffRequest(id: number): Observable<{ success: boolean; data: TimeOffRequest }> {
    return this.http.get<{ success: boolean; data: TimeOffRequest }>(`${this.apiUrl}/time-off/${id}`);
  }

  /**
   * Get current status value
   */
  getCurrentStatus(): BambooHRStatus | null {
    return this.statusSubject.value;
  }

  /**
   * Get sync progress
   */
  getSyncProgress(service: string, operation: string): Observable<SyncProgress> {
    return this.http.get<SyncProgress>(`${this.apiUrl}/sync-progress/${service}/${operation}`);
  }

  /**
   * Get all active sync progress
   */
  getAllSyncProgress(): Observable<SyncProgress[]> {
    return this.http.get<SyncProgress[]>(`${this.apiUrl}/sync-progress`);
  }
}
