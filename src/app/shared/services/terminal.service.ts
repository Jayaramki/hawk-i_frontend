import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TerminalLogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/bamboohr`;

  constructor(private http: HttpClient) {}

  /**
   * Get WebSocket logs for a specific service and operation
   */
  getLogs(service: string, operation: string): Observable<{success: boolean; data: TerminalLogEntry[]}> {
    return this.http.get<{success: boolean; data: TerminalLogEntry[]}>(`${this.apiUrl}/websocket-logs/${service}/${operation}`);
  }

  /**
   * Clear WebSocket channels for a specific service and operation
   */
  clearChannels(service: string, operation: string): Observable<{success: boolean; message: string}> {
    return this.http.delete<{success: boolean; message: string}>(`${this.apiUrl}/websocket-channels/${service}/${operation}`);
  }

  /**
   * Get WebSocket progress for a specific service and operation
   */
  getProgress(service: string, operation: string): Observable<{success: boolean; data: any}> {
    return this.http.get<{success: boolean; data: any}>(`${this.apiUrl}/websocket-progress/${service}/${operation}`);
  }
}
