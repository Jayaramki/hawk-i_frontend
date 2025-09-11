import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';
import { FormsModule } from '@angular/forms';
import { SprintMetricsService, Project, Team, Sprint, WorkItem, SprintMetrics } from '../../../shared/services/sprint-metrics.service';

@Component({
  selector: 'app-sprint-metrics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LayoutComponent,
    FormsModule
  ],
  template: `
    <app-layout>
      <!-- Page header -->
      <div class="mb-8">
        <h1 class="text-heading text-gray-900 dark:text-white mb-2">Sprint Metrics</h1>
        <p class="text-body text-gray-600 dark:text-gray-300">Real-time sprint analytics and team performance insights</p>
      </div>

      <!-- Project Selection -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card mb-8">
        <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Project Configuration</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project</label>
            <select 
              [(ngModel)]="selectedProject" 
              (change)="onProjectChange()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Project --</option>
              <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</label>
            <select 
              [(ngModel)]="selectedTeam" 
              (change)="onTeamChange()"
              [disabled]="!selectedProject"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">-- Select Team --</option>
              <option *ngFor="let team of teams" [value]="team.id">{{ team.name }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sprint</label>
            <select 
              [(ngModel)]="selectedSprint" 
              (change)="onSprintChange()"
              [disabled]="!selectedTeam"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">-- Select Sprint --</option>
              <option *ngFor="let sprint of sprints" [value]="sprint.id">{{ sprint.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">Loading sprint metrics...</span>
      </div>

      <!-- Sprint Metrics Dashboard -->
      <div *ngIf="!loading && metrics" class="space-y-8">
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-success-500 rounded-lg p-6 shadow-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white text-sm font-medium">{{ metrics.progressPercentage }}%</p>
                <p class="text-white text-xs opacity-90">Sprint Progress</p>
              </div>
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-info-500 rounded-lg p-6 shadow-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white text-sm font-medium">{{ metrics.totalWorkItems }}</p>
                <p class="text-white text-xs opacity-90">Total Work Items</p>
              </div>
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-warning-500 rounded-lg p-6 shadow-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white text-sm font-medium">{{ metrics.remainingDays }}</p>
                <p class="text-white text-xs opacity-90">Days Remaining</p>
              </div>
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-primary-500 rounded-lg p-6 shadow-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white text-sm font-medium">{{ metrics.velocity }}</p>
                <p class="text-white text-xs opacity-90">Velocity</p>
              </div>
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Item Status Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Work Item Types -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
            <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Work Item Types</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Tasks</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.workItemTypes.task }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Bugs</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.workItemTypes.bug }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Features</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.workItemTypes.feature }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Requirements</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.workItemTypes.requirement }}</span>
              </div>
            </div>
          </div>

          <!-- Work Item Status -->
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
            <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Work Item Status</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-success-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Completed</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.completedWorkItems }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-warning-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.inProgressWorkItems }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 bg-gray-500 rounded mr-3"></div>
                  <span class="text-sm text-gray-700 dark:text-gray-300">Not Started</span>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ metrics.notStartedWorkItems }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Assignment Overview -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
          <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Team Assignment Overview</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Assigned</span>
              </div>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ metrics.teamPerformance.assigned }}</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">Unassigned</span>
              </div>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ metrics.teamPerformance.unassigned }}</span>
            </div>
          </div>
        </div>

        <!-- Work Items Table -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-card">
          <h3 class="text-subheading text-gray-900 dark:text-white mb-4">Work Items Details</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">State</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let item of workItems" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <a [href]="item.url" target="_blank" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      {{ item.id }}
                    </a>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ item.title }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ item.workItemType }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStateBadgeClass(item.state)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ item.state }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {{ item.assignedTo || 'Unassigned' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full" 
                          [style.width.%]="getProgressPercentage(item)"
                        ></div>
                      </div>
                      <span class="text-xs">{{ getProgressPercentage(item) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class SprintMetricsComponent implements OnInit {
  constructor(private sprintMetricsService: SprintMetricsService) {}

  // Form data
  selectedProject = '';
  selectedTeam = '';
  selectedSprint = '';

  // Data arrays
  projects: Project[] = [];
  teams: Team[] = [];
  sprints: Sprint[] = [];
  workItems: WorkItem[] = [];

  // State
  loading = false;
  metrics: SprintMetrics | null = null;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.sprintMetricsService.getProjects().subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = response.data;
        } else {
          console.error('Failed to load projects:', response.message);
          // Fallback to mock data
          this.projects = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        // Fallback to mock data
        this.projects = [];
        this.loading = false;
      }
    });
  }

  onProjectChange() {
    this.selectedTeam = '';
    this.selectedSprint = '';
    this.teams = [];
    this.sprints = [];
    this.metrics = null;
    this.workItems = [];

    if (this.selectedProject) {
      this.loadTeams();
    }
  }

  onTeamChange() {
    this.selectedSprint = '';
    this.sprints = [];
    this.metrics = null;
    this.workItems = [];

    if (this.selectedTeam) {
      this.loadSprints();
    }
  }

  onSprintChange() {
    this.metrics = null;
    this.workItems = [];

    if (this.selectedSprint) {
      this.loadSprintMetrics();
    }
  }

  loadTeams() {
    this.loading = true;
    this.sprintMetricsService.getTeams(this.selectedProject).subscribe({
      next: (response) => {
        if (response.success) {
          this.teams = response.data;
        } else {
          console.error('Failed to load teams:', response.message);
          // Fallback to mock data
          this.teams = [
            { id: '1', name: 'Development Team' },
            { id: '2', name: 'QA Team' }
          ];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        // Fallback to mock data
        this.teams = [
          { id: '1', name: 'Development Team' },
          { id: '2', name: 'QA Team' }
        ];
        this.loading = false;
      }
    });
  }

  loadSprints() {
    this.loading = true;
    this.sprintMetricsService.getSprints(this.selectedProject, this.selectedTeam).subscribe({
      next: (response) => {
        if (response.success) {
          this.sprints = response.data;
        } else {
          console.error('Failed to load sprints:', response.message);
          // Fallback to mock data
          this.sprints = [
            { id: '1', name: 'Sprint 1' },
            { id: '2', name: 'Sprint 2' },
            { id: '3', name: 'Sprint 3' }
          ];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sprints:', error);
        // Fallback to mock data
        this.sprints = [
          { id: '1', name: 'Sprint 1' },
          { id: '2', name: 'Sprint 2' },
          { id: '3', name: 'Sprint 3' }
        ];
        this.loading = false;
      }
    });
  }

  loadSprintMetrics() {
    this.loading = true;
    this.sprintMetricsService.getSprintMetrics(this.selectedProject, this.selectedTeam, this.selectedSprint).subscribe({
      next: (response) => {
        if (response.success) {
          this.metrics = response.data.metrics;
          this.workItems = response.data.workItems;
        } else {
          console.error('Failed to load sprint metrics:', response.message);
          // Fallback to mock data
          this.metrics = {
            totalWorkItems: 25,
            completedWorkItems: 15,
            inProgressWorkItems: 7,
            notStartedWorkItems: 3,
            workItemTypes: {
              task: 12,
              bug: 5,
              feature: 6,
              requirement: 2
            },
            teamPerformance: {
              assigned: 22,
              unassigned: 3
            },
            progressPercentage: 60,
            remainingDays: 8,
            velocity: 12.5,
            totalOriginalEstimate: 120,
            totalCompletedWork: 72,
            totalRemainingWork: 48
          };

          this.workItems = [
            {
              id: 123,
              title: 'Implement user authentication',
              state: 'Completed',
              workItemType: 'Task',
              assignedTo: 'John Doe',
              originalEstimate: 8,
              remainingWork: 0,
              completedWork: 8,
              iterationPath: 'Sprint 1',
              url: 'https://dev.azure.com/org/project/_workitems/edit/123'
            },
            {
              id: 124,
              title: 'Fix login bug',
              state: 'In Progress',
              workItemType: 'Bug',
              assignedTo: 'Jane Smith',
              originalEstimate: 4,
              remainingWork: 2,
              completedWork: 2,
              iterationPath: 'Sprint 1',
              url: 'https://dev.azure.com/org/project/_workitems/edit/124'
            }
          ];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sprint metrics:', error);
        // Fallback to mock data
        this.metrics = {
          totalWorkItems: 25,
          completedWorkItems: 15,
          inProgressWorkItems: 7,
          notStartedWorkItems: 3,
          workItemTypes: {
            task: 12,
            bug: 5,
            feature: 6,
            requirement: 2
          },
          teamPerformance: {
            assigned: 22,
            unassigned: 3
          },
          progressPercentage: 60,
          remainingDays: 8,
          velocity: 12.5,
          totalOriginalEstimate: 120,
          totalCompletedWork: 72,
          totalRemainingWork: 48
        };

        this.workItems = [
          {
            id: 123,
            title: 'Implement user authentication',
            state: 'Completed',
            workItemType: 'Task',
            assignedTo: 'John Doe',
            originalEstimate: 8,
            remainingWork: 0,
            completedWork: 8,
            iterationPath: 'Sprint 1',
            url: 'https://dev.azure.com/org/project/_workitems/edit/123'
          },
          {
            id: 124,
            title: 'Fix login bug',
            state: 'In Progress',
            workItemType: 'Bug',
            assignedTo: 'Jane Smith',
            originalEstimate: 4,
            remainingWork: 2,
            completedWork: 2,
            iterationPath: 'Sprint 1',
            url: 'https://dev.azure.com/org/project/_workitems/edit/124'
          }
        ];
        this.loading = false;
      }
    });
  }

  getStateBadgeClass(state: string): string {
    switch (state.toLowerCase()) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'in progress':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'not started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getProgressPercentage(item: WorkItem): number {
    if (item.originalEstimate === 0) return 0;
    return Math.round((item.completedWork / item.originalEstimate) * 100);
  }
}
