import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SyncStatus {
  success: boolean;
  data: {
    stats: {
      projects: number;
      work_items: number;
      iterations: number;
      teams: number;
      users: number;
      team_iterations: number;
    };
    last_sync: {
      projects: string | null;
      work_items: string | null;
      iterations: string | null;
      teams: string | null;
      users: string | null;
      team_iterations: string | null;
    };
  };
}

export interface SyncHistory {
  id: number;
  table_name: string;
  project_id: string | null;
  last_sync_at: string;
  sync_type: string;
  status: string;
  records_processed: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AzureDevOpsService {
  private readonly baseUrl = `${environment.apiUrl || 'http://localhost:8000/api'}/v1/ado-sync`;

  constructor(private http: HttpClient) {}

  /**
   * Get sync status and statistics
   */
  getSyncStatus(): Observable<SyncStatus> {
    return this.http.get<SyncStatus>(`${this.baseUrl}/status`);
  }

  /**
   * Get sync history
   */
  getSyncHistory(): Observable<{ success: boolean; data: SyncHistory[] }> {
    return this.http.get<{ success: boolean; data: SyncHistory[] }>(`${this.baseUrl}/sync-history`);
  }

  /**
   * Test connection to Azure DevOps
   */
  testConnection(): Observable<TestConnectionResponse> {
    return this.http.get<TestConnectionResponse>(`${this.baseUrl}/test-connection`);
  }

  /**
   * Sync all resources
   */
  syncAll(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-all`, {});
  }

  /**
   * Sync projects
   */
  syncProjects(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-projects`, {});
  }

  /**
   * Sync users
   */
  syncUsers(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-users`, {});
  }

  /**
   * Sync teams
   */
  syncTeams(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-teams`, {});
  }

  /**
   * Sync iterations
   */
  syncIterations(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-iterations`, {});
  }

  /**
   * Sync team iterations
   */
  syncTeamIterations(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-team-iterations`, {});
  }

  /**
   * Sync work items
   */
  syncWorkItems(projectId?: string): Observable<SyncResponse> {
    const body = projectId ? { project_id: projectId } : {};
    return this.http.post<SyncResponse>(`${this.baseUrl}/sync-work-items`, body);
  }

  /**
   * Clear cache
   */
  clearCache(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/clear-cache`, {});
  }

  /**
   * Get projects from database
   */
  getProjects(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/projects`);
  }

  /**
   * Get teams from database
   */
  getTeams(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/teams`);
  }

  /**
   * Get iterations from database
   */
  getIterationsFromDB(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/iterations/db`);
  }

  /**
   * Get team iterations from database
   */
  getTeamIterationsFromDB(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/team-iterations/db`);
  }

  /**
   * Toggle team active status
   */
  toggleTeamStatus(teamId: string, isActive: boolean): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/toggle-team-status`, {
      team_id: teamId,
      is_active: isActive
    });
  }

  /**
   * Toggle iteration active status
   */
  toggleIterationStatus(iterationId: number, isActive: boolean): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/toggle-iteration-status`, {
      iteration_id: iterationId,
      is_active: isActive
    });
  }

  /**
   * Toggle team iteration active status
   */
  toggleTeamIterationStatus(teamIterationId: number, isActive: boolean): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.baseUrl}/toggle-team-iteration-status`, {
      team_iteration_id: teamIterationId,
      is_active: isActive
    });
  }
}
