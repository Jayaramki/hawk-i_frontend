import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeoffRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_date: string;
  approved_date?: string;
  approved_by?: string;
  notes?: string;
}

export interface TimeoffFilters {
  employee_id?: number | null;
  status?: string | null;
  start_date?: Date | null;
  end_date?: Date | null;
  page?: number;
  per_page?: number;
  sort_column?: string | null;
  sort_direction?: 'asc' | 'desc';
}

export interface TimeoffResponse {
  data: TimeoffRequest[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeoffService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/timeoff`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get timeoff requests with filters
   */
  getTimeoffRequests(filters: TimeoffFilters): Observable<TimeoffResponse> {
    let params = new HttpParams();
    
    if (filters.employee_id) {
      params = params.set('employee_id', filters.employee_id.toString());
    }
    
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    
    if (filters.start_date) {
      params = params.set('start_date', filters.start_date.toISOString().split('T')[0]);
    }
    
    if (filters.end_date) {
      params = params.set('end_date', filters.end_date.toISOString().split('T')[0]);
    }
    
    if (filters.page) {
      params = params.set('page', filters.page.toString());
    }
    
    if (filters.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }
    
    if (filters.sort_column) {
      params = params.set('sort_column', filters.sort_column);
    }
    
    if (filters.sort_direction) {
      params = params.set('sort_direction', filters.sort_direction);
    }

    return this.http.get<TimeoffResponse>(this.apiUrl, { params });
  }

  /**
   * Get a single timeoff request by ID
   */
  getTimeoffRequest(id: number): Observable<TimeoffRequest> {
    return this.http.get<TimeoffRequest>(`${this.apiUrl}/${id}`);
  }


  /**
   * Get employees for dropdown
   */
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/api/v1/employees`);
  }

  /**
   * Get timeoff statistics
   */
  getTimeoffStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}