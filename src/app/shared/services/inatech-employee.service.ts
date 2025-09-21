import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface InatechEmployee {
  id: number;
  ina_emp_id: string;
  employee_name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface InatechEmployeeResponse {
  success: boolean;
  data: InatechEmployee;
  message?: string;
}

export interface InatechEmployeeListResponse {
  success: boolean;
  data: {
    data: InatechEmployee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MappingSuggestion {
  bamboo_employee: {
    id: number;
    bamboohr_id: string;
    first_name: string;
    last_name: string;
    email: string;
    job_title: string;
    department_id: number;
    status: string;
  };
  similarity_percentage: number;
  is_already_mapped: boolean;
}

export interface MappingSuggestionsResponse {
  success: boolean;
  data: {
    inatech_employee: InatechEmployee;
    suggestions: MappingSuggestion[];
  };
}

export interface CreateMappingRequest {
  ina_emp_id: number;
  bamboohr_id: number;
}

export interface CreateMappingResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class InatechEmployeeService {
  private apiUrl = `${environment.apiUrl}/api/v1/inatech-employees`;

  // Signals for reactive state management
  private employeesSignal = signal<InatechEmployee[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed values
  public employees = computed(() => this.employeesSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  constructor(private http: HttpClient) {}

  /**
   * Get all Inatech employees (no pagination - client-side grid handles it)
   */
  getEmployees(): Observable<InatechEmployeeListResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<InatechEmployeeListResponse>(`${this.apiUrl}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response.success) {
            // Store all employees for client-side grid
            this.employeesSignal.set(response.data.data);
          }
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to fetch employees');
          throw error;
        })
      );
  }

  /**
   * Get a single Inatech employee by ID
   */
  getEmployee(id: number): Observable<InatechEmployeeResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<InatechEmployeeResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to fetch employee');
          throw error;
        })
      );
  }

  /**
   * Create a new Inatech employee
   */
  createEmployee(employee: Partial<InatechEmployee>): Observable<InatechEmployeeResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<InatechEmployeeResponse>(this.apiUrl, employee)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response.success) {
            // Add the new employee to the list
            const currentEmployees = this.employeesSignal();
            this.employeesSignal.set([...currentEmployees, response.data]);
          }
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to create employee');
          throw error;
        })
      );
  }

  /**
   * Update an existing Inatech employee
   */
  updateEmployee(id: number, employee: Partial<InatechEmployee>): Observable<InatechEmployeeResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<InatechEmployeeResponse>(`${this.apiUrl}/${id}`, employee)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response.success) {
            // Update the employee in the list
            const currentEmployees = this.employeesSignal();
            const updatedEmployees = currentEmployees.map(emp => 
              emp.id === id ? response.data : emp
            );
            this.employeesSignal.set(updatedEmployees);
          }
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to update employee');
          throw error;
        })
      );
  }

  /**
   * Delete an Inatech employee
   */
  deleteEmployee(id: number): Observable<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response.success) {
            // Remove the employee from the list
            const currentEmployees = this.employeesSignal();
            const filteredEmployees = currentEmployees.filter(emp => emp.id !== id);
            this.employeesSignal.set(filteredEmployees);
          }
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to delete employee');
          throw error;
        })
      );
  }

  /**
   * Get mapping suggestions for an Inatech employee
   */
  getMappingSuggestions(id: number): Observable<MappingSuggestionsResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<MappingSuggestionsResponse>(`${this.apiUrl}/${id}/mapping-suggestions`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to get mapping suggestions');
          throw error;
        })
      );
  }

  /**
   * Create employee mapping
   */
  createMapping(mapping: CreateMappingRequest): Observable<CreateMappingResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<CreateMappingResponse>(`${this.apiUrl}/mapping`, mapping)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to create mapping');
          throw error;
        })
      );
  }

  /**
   * Remove employee mapping
   */
  removeMapping(inaEmpId: number): Observable<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/mapping`, {
      body: { ina_emp_id: inaEmpId }
    })
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          this.errorSignal.set('Failed to remove mapping');
          throw error;
        })
      );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Reset all signals
   */
  reset(): void {
    this.employeesSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}
