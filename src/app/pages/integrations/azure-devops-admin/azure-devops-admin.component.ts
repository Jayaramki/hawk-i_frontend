import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AzureDevOpsService } from '../../../shared/services/azure-devops.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

interface ADOProject {
  id: string;
  name: string;
  is_active: boolean;
}

interface ADOTeam {
  id: string;
  name: string;
  project_name: string;
  is_active: boolean;
}

interface ADOIteration {
  id: number;
  name: string;
  project_name: string;
  start_date: string;
  finish_date: string;
  is_active: boolean;
}

interface ADOTeamIteration {
  id: number;
  team_name: string;
  iteration_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

@Component({
  selector: 'app-azure-devops-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonComponent, CardComponent, LayoutComponent],
  template: `
    <app-layout>
      <div class="p-6 space-y-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Azure DevOps Administration</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage active/inactive status for projects, teams, iterations, and team iterations</p>
          </div>
          <div class="flex space-x-3">
            <app-button
              [variant]="'primary'"
              (click)="refreshAllData()"
              [loading]="isLoading"
            >
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh All
            </app-button>
          </div>
        </div>

        <!-- Projects Section -->
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Projects</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ getActiveCount(projects) }}/{{ projects.length }} Active
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let project of projects" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ project.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span [class]="getStatusClass(project.is_active)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ project.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="project.is_active"
                        (change)="toggleProjectStatus(project, $event)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>

        <!-- Teams Section -->
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Teams</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ getActiveCount(teams) }}/{{ teams.length }} Active
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let team of teams" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ team.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ team.project_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span [class]="getStatusClass(team.is_active)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ team.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="team.is_active"
                        (change)="toggleTeamStatus(team, $event)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>

        <!-- Iterations Section -->
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Iterations</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ getActiveCount(iterations) }}/{{ iterations.length }} Active
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Iteration Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let iteration of iterations" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ iteration.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ iteration.project_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ iteration.start_date | date:'short' }} - {{ iteration.finish_date | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span [class]="getStatusClass(iteration.is_active)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ iteration.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="iteration.is_active"
                        (change)="toggleIterationStatus(iteration, $event)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>

        <!-- Team Iterations Section -->
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Team Iterations</h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ getActiveCount(teamIterations) }}/{{ teamIterations.length }} Active
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Team
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Iteration
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr *ngFor="let teamIteration of teamIterations" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ teamIteration.team_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ teamIteration.iteration_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ teamIteration.start_date | date:'short' }} - {{ teamIteration.end_date | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span [class]="getStatusClass(teamIteration.is_active)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ teamIteration.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        [checked]="teamIteration.is_active"
                        (change)="toggleTeamIterationStatus(teamIteration, $event)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>

        <!-- Toast Messages -->
        <div *ngIf="toastMessage" 
             [class]="toastClass"
             class="fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <div class="flex items-center">
            <i [class]="toastIcon" class="mr-2"></i>
            <span>{{ toastMessage }}</span>
            <button (click)="dismissToast()" class="ml-auto text-white hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: []
})
export class AzureDevOpsAdminComponent implements OnInit {
  projects: ADOProject[] = [];
  teams: ADOTeam[] = [];
  iterations: ADOIteration[] = [];
  teamIterations: ADOTeamIteration[] = [];
  isLoading = false;

  // Toast properties
  toastMessage: string | null = null;
  toastClass = '';
  toastIcon = '';

  constructor(private azureDevOpsService: AzureDevOpsService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.loadProjects();
    this.loadTeams();
    this.loadIterations();
    this.loadTeamIterations();
  }

  loadProjects(): void {
    this.azureDevOpsService.getProjects().subscribe({
      next: (response) => {
        this.projects = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.showToast('Error loading projects', 'error');
        this.isLoading = false;
      }
    });
  }

  loadTeams(): void {
    this.azureDevOpsService.getTeams().subscribe({
      next: (response) => {
        this.teams = response.data || [];
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.showToast('Error loading teams', 'error');
      }
    });
  }

  loadIterations(): void {
    this.azureDevOpsService.getIterationsFromDB().subscribe({
      next: (response) => {
        this.iterations = response.data || [];
      },
      error: (error) => {
        console.error('Error loading iterations:', error);
        this.showToast('Error loading iterations', 'error');
      }
    });
  }

  loadTeamIterations(): void {
    this.azureDevOpsService.getTeamIterationsFromDB().subscribe({
      next: (response) => {
        this.teamIterations = response.data || [];
      },
      error: (error) => {
        console.error('Error loading team iterations:', error);
        this.showToast('Error loading team iterations', 'error');
      }
    });
  }

  refreshAllData(): void {
    this.loadAllData();
    this.showToast('Data refreshed successfully', 'success');
  }

  toggleProjectStatus(project: ADOProject, event: any): void {
    const isActive = event.target.checked;
    // Note: Projects already have is_active, we'd need to implement this endpoint if needed
    project.is_active = isActive;
    this.showToast(`Project ${project.name} ${isActive ? 'activated' : 'deactivated'}`, 'success');
  }

  toggleTeamStatus(team: ADOTeam, event: any): void {
    const isActive = event.target.checked;
    
    this.azureDevOpsService.toggleTeamStatus(team.id, isActive).subscribe({
      next: (response) => {
        if (response.success) {
          team.is_active = isActive;
          this.showToast(`Team ${team.name} ${isActive ? 'activated' : 'deactivated'}`, 'success');
        } else {
          // Revert checkbox if failed
          event.target.checked = !isActive;
          this.showToast(`Failed to update team status: ${response.error}`, 'error');
        }
      },
      error: (error) => {
        // Revert checkbox if failed
        event.target.checked = !isActive;
        this.showToast(`Error updating team status: ${error.message}`, 'error');
      }
    });
  }

  toggleIterationStatus(iteration: ADOIteration, event: any): void {
    const isActive = event.target.checked;
    
    this.azureDevOpsService.toggleIterationStatus(iteration.id, isActive).subscribe({
      next: (response) => {
        if (response.success) {
          iteration.is_active = isActive;
          this.showToast(`Iteration ${iteration.name} ${isActive ? 'activated' : 'deactivated'}`, 'success');
        } else {
          // Revert checkbox if failed
          event.target.checked = !isActive;
          this.showToast(`Failed to update iteration status: ${response.error}`, 'error');
        }
      },
      error: (error) => {
        // Revert checkbox if failed
        event.target.checked = !isActive;
        this.showToast(`Error updating iteration status: ${error.message}`, 'error');
      }
    });
  }

  toggleTeamIterationStatus(teamIteration: ADOTeamIteration, event: any): void {
    const isActive = event.target.checked;
    
    this.azureDevOpsService.toggleTeamIterationStatus(teamIteration.id, isActive).subscribe({
      next: (response) => {
        if (response.success) {
          teamIteration.is_active = isActive;
          this.showToast(`Team iteration ${teamIteration.iteration_name} ${isActive ? 'activated' : 'deactivated'}`, 'success');
        } else {
          // Revert checkbox if failed
          event.target.checked = !isActive;
          this.showToast(`Failed to update team iteration status: ${response.error}`, 'error');
        }
      },
      error: (error) => {
        // Revert checkbox if failed
        event.target.checked = !isActive;
        this.showToast(`Error updating team iteration status: ${error.message}`, 'error');
      }
    });
  }

  getActiveCount(items: any[]): number {
    return items.filter(item => item.is_active).length;
  }

  getStatusClass(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.toastMessage = message;
    
    switch (type) {
      case 'success':
        this.toastClass = 'bg-green-500 text-white';
        this.toastIcon = 'fas fa-check-circle';
        break;
      case 'error':
        this.toastClass = 'bg-red-500 text-white';
        this.toastIcon = 'fas fa-exclamation-circle';
        break;
      case 'warning':
        this.toastClass = 'bg-yellow-500 text-white';
        this.toastIcon = 'fas fa-exclamation-triangle';
        break;
      case 'info':
        this.toastClass = 'bg-blue-500 text-white';
        this.toastIcon = 'fas fa-info-circle';
        break;
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      this.dismissToast();
    }, 5000);
  }

  dismissToast(): void {
    this.toastMessage = null;
  }
}
