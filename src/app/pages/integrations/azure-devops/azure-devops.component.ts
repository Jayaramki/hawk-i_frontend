import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AzureDevOpsService, SyncStatus, SyncHistory, SyncResponse, TestConnectionResponse } from '../../../shared/services/azure-devops.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';

@Component({
  selector: 'app-azure-devops',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonComponent, CardComponent, LayoutComponent],
  template: `
    <app-layout>
      <div class="p-6 space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Azure DevOps Integration</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Manage Azure DevOps synchronization and view sync history</p>
        </div>
        <div class="flex space-x-3">
          <app-button
            [variant]="'secondary'"
            (click)="testConnection()"
            [loading]="isTestingConnection"
            [disabled]="isSyncing"
          >
            <i class="fas fa-wifi mr-2"></i>
            Test Connection
          </app-button>
          <app-button
            [variant]="'primary'"
            (click)="refreshData()"
            [loading]="isLoading"
            [disabled]="isSyncing"
          >
            <i class="fas fa-sync-alt mr-2"></i>
            Refresh
          </app-button>
        </div>
      </div>

      <!-- Connection Status -->
      <app-card>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div [class]="connectionStatusClass" class="w-3 h-3 rounded-full mr-3"></div>
            <span class="text-lg font-medium text-gray-900 dark:text-white">Connection Status</span>
          </div>
          <span [class]="connectionTextClass" class="text-sm font-medium">
            {{ connectionStatus }}
          </span>
        </div>
      </app-card>

      <!-- Sync Statistics -->
      <app-card>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sync Statistics</h2>
        <div *ngIf="syncStatus" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ syncStatus.data.stats.projects }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Projects</div>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ syncStatus.data.stats.users }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Users</div>
          </div>
          <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ syncStatus.data.stats.teams }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Teams</div>
          </div>
          <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ syncStatus.data.stats.iterations }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Iterations</div>
          </div>
          <div class="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ syncStatus.data.stats.team_iterations }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Team Iterations</div>
          </div>
          <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ syncStatus.data.stats.work_items }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Work Items</div>
          </div>
        </div>
      </app-card>

      <!-- Sync Operations -->
      <app-card>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sync Operations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-button
            [variant]="'primary'"
            [size]="'lg'"
            (click)="syncAll()"
            [loading]="currentSyncOperation === 'all'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-sync mr-2"></i>
            Sync All
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncProjects()"
            [loading]="currentSyncOperation === 'projects'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-project-diagram mr-2"></i>
            Sync Projects
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncUsers()"
            [loading]="currentSyncOperation === 'users'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-users mr-2"></i>
            Sync Users
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncTeams()"
            [loading]="currentSyncOperation === 'teams'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-user-friends mr-2"></i>
            Sync Teams
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncIterations()"
            [loading]="currentSyncOperation === 'iterations'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-calendar-alt mr-2"></i>
            Sync Iterations
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncTeamIterations()"
            [loading]="currentSyncOperation === 'team-iterations'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-calendar-week mr-2"></i>
            Team Iterations
          </app-button>
          <app-button
            [variant]="'secondary'"
            [size]="'lg'"
            (click)="syncWorkItems()"
            [loading]="currentSyncOperation === 'work-items'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-tasks mr-2"></i>
            Sync Work Items
          </app-button>
          <app-button
            [variant]="'warning'"
            [size]="'lg'"
            (click)="clearCache()"
            [loading]="currentSyncOperation === 'clear-cache'"
            [disabled]="isSyncing"
            class="w-full"
          >
            <i class="fas fa-trash mr-2"></i>
            Clear Cache
          </app-button>
        </div>
      </app-card>

      <!-- Sync History -->
      <app-card>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Sync History</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {{ lastUpdated | date:'medium' }}
          </span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Table
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Project
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Sync
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Records
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let history of syncHistory" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ history.table_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ history.project_id || 'All' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ history.last_sync_at | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span [class]="getSyncTypeClass(history.sync_type)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ history.sync_type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span [class]="getStatusClass(history.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ history.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ history.records_processed }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-400">
                  {{ history.error_message || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div *ngIf="!syncHistory || syncHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            No sync history available
          </div>
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
export class AzureDevOpsComponent implements OnInit {
  syncStatus: SyncStatus | null = null;
  syncHistory: SyncHistory[] = [];
  isLoading = false;
  isSyncing = false;
  isTestingConnection = false;
  currentSyncOperation: string | null = null;
  lastUpdated = new Date();
  connectionStatus = 'Unknown';
  connectionStatusClass = 'bg-gray-400';
  connectionTextClass = 'text-gray-600';
  
  // Toast properties
  toastMessage: string | null = null;
  toastClass = '';
  toastIcon = '';

  constructor(private azureDevOpsService: AzureDevOpsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadSyncStatus();
    this.loadSyncHistory();
  }

  loadSyncStatus(): void {
    this.azureDevOpsService.getSyncStatus().subscribe({
      next: (response) => {
        this.syncStatus = response;
        this.isLoading = false;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading sync status:', error);
        this.showToast('Error loading sync status', 'error');
        this.isLoading = false;
      }
    });
  }

  loadSyncHistory(): void {
    this.azureDevOpsService.getSyncHistory().subscribe({
      next: (response) => {
        this.syncHistory = response.data || [];
      },
      error: (error) => {
        console.error('Error loading sync history:', error);
        this.showToast('Error loading sync history', 'error');
      }
    });
  }

  refreshData(): void {
    this.loadData();
    this.showToast('Data refreshed successfully', 'success');
  }

  testConnection(): void {
    this.isTestingConnection = true;
    this.azureDevOpsService.testConnection().subscribe({
      next: (response) => {
        this.isTestingConnection = false;
        if (response.success) {
          this.connectionStatus = 'Connected';
          this.connectionStatusClass = 'bg-green-400';
          this.connectionTextClass = 'text-green-600';
          this.showToast('Connection test successful', 'success');
        } else {
          this.connectionStatus = 'Failed';
          this.connectionStatusClass = 'bg-red-400';
          this.connectionTextClass = 'text-red-600';
          this.showToast('Connection test failed', 'error');
        }
      },
      error: (error) => {
        this.isTestingConnection = false;
        this.connectionStatus = 'Error';
        this.connectionStatusClass = 'bg-red-400';
        this.connectionTextClass = 'text-red-600';
        this.showToast('Connection test error', 'error');
      }
    });
  }

  private performSync(operation: string, syncFunction: () => any): void {
    this.isSyncing = true;
    this.currentSyncOperation = operation;
    
    syncFunction().subscribe({
      next: (response: SyncResponse) => {
        this.isSyncing = false;
        this.currentSyncOperation = null;
        if (response.success) {
          this.showToast(`${operation} sync completed successfully`, 'success');
          this.loadData(); // Refresh data after successful sync
        } else {
          this.showToast(`${operation} sync failed: ${response.error}`, 'error');
        }
      },
      error: (error: any) => {
        this.isSyncing = false;
        this.currentSyncOperation = null;
        this.showToast(`${operation} sync error: ${error.message}`, 'error');
      }
    });
  }

  syncAll(): void {
    this.performSync('All', () => this.azureDevOpsService.syncAll());
  }

  syncProjects(): void {
    this.performSync('Projects', () => this.azureDevOpsService.syncProjects());
  }

  syncUsers(): void {
    this.performSync('Users', () => this.azureDevOpsService.syncUsers());
  }

  syncTeams(): void {
    this.performSync('Teams', () => this.azureDevOpsService.syncTeams());
  }

  syncIterations(): void {
    this.performSync('Iterations', () => this.azureDevOpsService.syncIterations());
  }

  syncTeamIterations(): void {
    this.performSync('Team Iterations', () => this.azureDevOpsService.syncTeamIterations());
  }

  syncWorkItems(): void {
    this.performSync('Work Items', () => this.azureDevOpsService.syncWorkItems());
  }

  clearCache(): void {
    this.performSync('Clear Cache', () => this.azureDevOpsService.clearCache());
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getSyncTypeClass(syncType: string): string {
    switch (syncType.toLowerCase()) {
      case 'full':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'incremental':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
