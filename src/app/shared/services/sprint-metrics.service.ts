import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
}

export interface Sprint {
  id: string;
  name: string;
  path?: string;
  startDate?: string;
  finishDate?: string;
  timeFrame?: string;
}

export interface WorkItem {
  id: number;
  title: string;
  state: string;
  workItemType: string;
  assignedTo: string;
  originalEstimate: number;
  remainingWork: number;
  completedWork: number;
  iterationPath: string;
  url: string;
}

export interface SprintMetrics {
  totalWorkItems: number;
  completedWorkItems: number;
  inProgressWorkItems: number;
  notStartedWorkItems: number;
  workItemTypes: {
    task: number;
    bug: number;
    feature: number;
    requirement: number;
  };
  teamPerformance: {
    assigned: number;
    unassigned: number;
  };
  progressPercentage: number;
  remainingDays: number;
  velocity: number;
  totalOriginalEstimate: number;
  totalCompletedWork: number;
  totalRemainingWork: number;
}

export interface DailyProgress {
  date: string;
  teamMember: string;
  hoursWorked: number;
  workItemsCompleted: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SprintMetricsService {
  private readonly baseUrl = 'http://localhost:8000/api/v1/sprint-metrics';

  constructor(private http: HttpClient) {}

  /**
   * Get all projects from Azure DevOps
   */
  getProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.baseUrl}/projects`);
  }

  /**
   * Get teams for a specific project
   */
  getTeams(projectId: string): Observable<ApiResponse<Team[]>> {
    const params = new HttpParams().set('project_id', projectId);
    return this.http.get<ApiResponse<Team[]>>(`${this.baseUrl}/teams`, { params });
  }

  /**
   * Get sprints for a specific team
   */
  getSprints(projectId: string, teamId: string): Observable<ApiResponse<Sprint[]>> {
    const params = new HttpParams()
      .set('project_id', projectId)
      .set('team_id', teamId);
    return this.http.get<ApiResponse<Sprint[]>>(`${this.baseUrl}/sprints`, { params });
  }

  /**
   * Get sprint metrics for a specific sprint
   */
  getSprintMetrics(projectId: string, teamId: string, sprintId: string): Observable<ApiResponse<{
    metrics: SprintMetrics;
    workItems: WorkItem[];
  }>> {
    const params = new HttpParams()
      .set('project_id', projectId)
      .set('team_id', teamId)
      .set('sprint_id', sprintId);
    return this.http.get<ApiResponse<{
      metrics: SprintMetrics;
      workItems: WorkItem[];
    }>>(`${this.baseUrl}/metrics`, { params });
  }

  /**
   * Get work items with filtering options
   */
  getWorkItems(
    projectId: string, 
    sprintId: string, 
    filters?: {
      state_filter?: string;
      assignee_filter?: string;
      work_item_type_filter?: string;
    }
  ): Observable<ApiResponse<WorkItem[]>> {
    let params = new HttpParams()
      .set('project_id', projectId)
      .set('sprint_id', sprintId);

    if (filters) {
      if (filters.state_filter) {
        params = params.set('state_filter', filters.state_filter);
      }
      if (filters.assignee_filter) {
        params = params.set('assignee_filter', filters.assignee_filter);
      }
      if (filters.work_item_type_filter) {
        params = params.set('work_item_type_filter', filters.work_item_type_filter);
      }
    }

    return this.http.get<ApiResponse<WorkItem[]>>(`${this.baseUrl}/work-items`, { params });
  }

  /**
   * Get daily progress tracking data
   */
  getDailyProgress(
    projectId: string, 
    sprintId: string, 
    startDate: string, 
    endDate: string
  ): Observable<ApiResponse<DailyProgress[]>> {
    const params = new HttpParams()
      .set('project_id', projectId)
      .set('sprint_id', sprintId)
      .set('start_date', startDate)
      .set('end_date', endDate);
    return this.http.get<ApiResponse<DailyProgress[]>>(`${this.baseUrl}/daily-progress`, { params });
  }
}
