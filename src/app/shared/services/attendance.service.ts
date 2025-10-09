import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AttendanceRecord {
  id: number | null;
  employee_id: number;
  employee_name: string;
  attendance_date: string;
  in_time: string | null;
  out_time: string | null;
  working_hours: number | null;
  status: 'present' | 'time_off' | 'no_track';
  status_label: string;
  status_color: 'success' | 'warning' | 'secondary';
  time_off_type: number | null;
  time_off_type_name: string | null;
}

export interface AttendanceImportResponse {
  success: boolean;
  message: string;
  data?: {
    processed_count: number;
    error_count: number;
    total_rows: number;
    errors: string[];
    new_employees?: NewEmployee[];
    new_employees_count?: number;
  };
  errors?: any;
}

export interface NewEmployee {
  id: number;
  ina_emp_id: string;
  employee_name: string;
}

export interface AttendanceFilters {
  employee_id?: number;
  start_date?: string;
  end_date?: string;
  department_id?: number;
  view_type?: 'day' | 'week' | 'month';
  per_page?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/attendance`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Import attendance data from spreadsheet
   */
  importAttendance(file: File): Observable<AttendanceImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AttendanceImportResponse>(`${this.apiUrl}/import`, formData);
  }

  /**
   * Get attendance records with optional filtering
   */
  getAttendance(filters?: AttendanceFilters): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof AttendanceFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  /**
   * Download attendance template
   */
  downloadTemplate(): void {
    const link = document.createElement('a');
    link.href = `${this.apiUrl}/template`;
    link.download = 'attendance_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; message?: string } {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Please select a valid Excel (.xlsx, .xls) or CSV file'
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File size must be less than 10MB'
      };
    }

    return { valid: true };
  }
}