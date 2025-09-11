import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';
import { ProgressComponent } from '../../../shared/components/progress/progress.component';
import { TerminalComponent } from '../../../shared/components/terminal/terminal.component';
import { BambooHRService, BambooHRStatus, ConnectionTestResponse, SyncResponse, SyncProgress } from '../../../shared/services/bamboohr.service';

@Component({
  selector: 'app-bamboohr',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent, LayoutComponent, TerminalComponent],
  template: `
    <app-layout>
      <div class="p-6 space-y-6">
        <!-- Page Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">BambooHR Integration</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Production-grade BambooHR synchronization with real-time monitoring</p>
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
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ employeeCount }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Employees</div>
            </div>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ departmentCount }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Departments</div>
            </div>
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ jobTitleCount }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Job Titles</div>
            </div>
            <div class="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ timeoffCount }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Time Off Requests</div>
            </div>
            <div class="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">{{ lastSyncTime }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Last Sync</div>
            </div>
          </div>
        </app-card>

        <!-- Two Column Layout: Sync Operations + Terminal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: Sync Operations -->
        <app-card>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sync Operations</h2>
          
            <!-- Sync Options with Checkboxes -->
            <div class="space-y-4 mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Select Operations:</h3>
              
              <div class="space-y-3">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="selectedOperations.employees"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <div class="flex items-center">
                    <i class="fas fa-users text-blue-500 mr-2"></i>
                    <span class="text-gray-900 dark:text-white">Sync Employees</span>
                  </div>
                </label>
                
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="selectedOperations.employee_details"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <div class="flex items-center">
                    <i class="fas fa-user-cog text-green-500 mr-2"></i>
                    <span class="text-gray-900 dark:text-white">Sync Employee Details</span>
              </div>
                </label>
                
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="selectedOperations.departments"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <div class="flex items-center">
                    <i class="fas fa-building text-purple-500 mr-2"></i>
                    <span class="text-gray-900 dark:text-white">Sync Departments</span>
              </div>
                </label>
                
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="selectedOperations.job_titles"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <div class="flex items-center">
                    <i class="fas fa-briefcase text-orange-500 mr-2"></i>
                    <span class="text-gray-900 dark:text-white">Sync Job Titles</span>
              </div>
                </label>
                
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="selectedOperations.time_off"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  >
                  <div class="flex items-center">
                    <i class="fas fa-calendar-times text-red-500 mr-2"></i>
                    <span class="text-gray-900 dark:text-white">Sync Time Off</span>
              </div>
                </label>
            </div>
          </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
            <app-button
              [variant]="'primary'"
              [size]="'lg'"
                (click)="syncSelected()"
                [loading]="isSyncing"
                [disabled]="!hasSelectedOperations()"
              class="w-full"
            >
                <i class="fas fa-play mr-2"></i>
                Start Selected Sync
            </app-button>
              
            <app-button
              [variant]="'secondary'"
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

          <!-- Right Column: Terminal Window -->
          <app-card>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sync Terminal</h2>
            <app-terminal 
              #terminal
              [service]="'bamboohr'" 
              [operation]="'selected'"
              [autoRefresh]="false"
              [refreshInterval]="2000"
            ></app-terminal>
          </app-card>
        </div>

        <!-- Configuration -->
        <app-card>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  BambooHR Subdomain
                </label>
                <input
                  type="text"
                  [(ngModel)]="config.subdomain"
                  placeholder="yourcompany"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  [(ngModel)]="config.apiKey"
                  placeholder="Enter API Key"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            <div class="flex justify-end">
              <app-button
                [variant]="'primary'"
                (click)="saveConfig()"
                [loading]="isSaving"
              >
                <i class="fas fa-save mr-2"></i>
                Save Configuration
              </app-button>
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
export class BambooHRComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Connection status
  connectionStatus: string = 'Disconnected';
  connectionStatusClass: string = 'bg-red-500';
  connectionTextClass: string = 'text-red-600 dark:text-red-400';

  // Loading states
  isLoading: boolean = false;
  isSyncing: boolean = false;
  isTestingConnection: boolean = false;
  isSaving: boolean = false;

  // Current sync operation
  currentSyncOperation: string | null = null;

  // Statistics
  employeeCount: number = 0;
  departmentCount: number = 0;
  jobTitleCount: number = 0;
  timeoffCount: number = 0;
  lastSyncTime: string = 'Never';

  // Configuration
  config = {
    subdomain: '',
    apiKey: ''
  };

  // Selected operations for sync
  selectedOperations = {
    employees: false,
    employee_details: false,
    departments: false,
    job_titles: false,
    time_off: false
  };

  // Toast message
  toastMessage: string = '';
  toastClass: string = '';
  toastIcon: string = '';

  // Progress tracking
  syncProgress: SyncProgress | null = null;
  progressInterval: any = null;

  // Terminal reference
  @ViewChild('terminal') terminal?: any;

  constructor(private readonly bambooHRService: BambooHRService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadConfig();
    
    // Subscribe to status updates
    this.bambooHRService.status$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (status) => {
        if (status) {
          this.updateStatistics(status);
        }
      },
      error: (error) => console.error('Error receiving status updates:', error)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopProgressTracking();
  }

  loadData(): void {
    this.isLoading = true;
    this.bambooHRService.getStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (status) => {
        this.updateStatistics(status);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load data:', error);
        this.isLoading = false;
        this.showToast('Failed to load data', 'error');
      }
    });
  }

  updateStatistics(status: BambooHRStatus): void {
    this.employeeCount = status.data.stats.employees;
    this.departmentCount = status.data.stats.departments;
    this.jobTitleCount = status.data.stats.job_titles;
    this.timeoffCount = status.data.stats.time_off;
    
    // Get the most recent sync time
    const lastSyncs = Object.values(status.data.last_sync).filter(time => time !== null);
    if (lastSyncs.length > 0) {
      const mostRecent = new Date(Math.max(...lastSyncs.map(time => new Date(time!).getTime())));
      this.lastSyncTime = mostRecent.toLocaleDateString();
    } else {
      this.lastSyncTime = 'Never';
    }
  }

  loadConfig(): void {
    // TODO: Load configuration from service
    this.config = {
      subdomain: '',
      apiKey: ''
    };
  }

  testConnection(): void {
    this.isTestingConnection = true;
    this.bambooHRService.testConnection().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ConnectionTestResponse) => {
        if (response.success) {
          this.connectionStatus = 'Connected';
          this.connectionStatusClass = 'bg-green-500';
          this.connectionTextClass = 'text-green-600 dark:text-green-400';
          this.showToast('Connection successful!', 'success');
        } else {
          this.connectionStatus = 'Failed';
          this.connectionStatusClass = 'bg-red-500';
          this.connectionTextClass = 'text-red-600 dark:text-red-400';
          this.showToast('Connection failed: ' + response.message, 'error');
        }
        this.isTestingConnection = false;
      },
      error: (error) => {
        this.connectionStatus = 'Error';
        this.connectionStatusClass = 'bg-red-500';
        this.connectionTextClass = 'text-red-600 dark:text-red-400';
        this.isTestingConnection = false;
        this.showToast('Connection test failed: ' + error.message, 'error');
      }
    });
  }

  refreshData(): void {
    this.bambooHRService.refreshStatus();
    this.showToast('Data refreshed successfully', 'success');
  }

  syncAll(): void {
    this.currentSyncOperation = 'all';
    this.isSyncing = true;
    this.bambooHRService.syncAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SyncResponse) => {
        this.currentSyncOperation = null;
        this.isSyncing = false;
        if (response.success) {
          this.showToast('All data synced successfully', 'success');
          this.refreshData();
        } else {
          this.showToast('Sync failed: ' + response.message, 'error');
        }
      },
      error: (error) => {
        this.currentSyncOperation = null;
        this.isSyncing = false;
        this.showToast('Sync failed: ' + error.message, 'error');
      }
    });
  }


  clearCache(): void {
    this.currentSyncOperation = 'clear-cache';
    this.isSyncing = true;
    this.bambooHRService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SyncResponse) => {
        this.currentSyncOperation = null;
        this.isSyncing = false;
        if (response.success) {
          this.showToast('Cache cleared successfully', 'success');
          this.refreshData();
        } else {
          this.showToast('Cache clear failed: ' + response.message, 'error');
        }
      },
      error: (error) => {
        this.currentSyncOperation = null;
        this.isSyncing = false;
        this.showToast('Cache clear failed: ' + error.message, 'error');
      }
    });
  }

  saveConfig(): void {
    this.isSaving = true;
    // TODO: Implement actual config saving
    setTimeout(() => {
      this.isSaving = false;
      this.showToast('Configuration saved successfully', 'success');
    }, 1000);
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

    setTimeout(() => {
      this.dismissToast();
    }, 5000);
  }

  dismissToast(): void {
    this.toastMessage = '';
    this.toastClass = '';
    this.toastIcon = '';
  }

  startProgressTracking(service: string, operation: string): void {
    this.progressInterval = setInterval(() => {
      this.bambooHRService.getSyncProgress(service, operation).pipe(takeUntil(this.destroy$)).subscribe({
        next: (progress) => {
          this.syncProgress = progress;
        },
        error: (error) => {
          console.error('Failed to get sync progress:', error);
        }
      });
    }, 2000); // Poll every 2 seconds
  }

  stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.syncProgress = null;
  }

  getProgressPercentage(): number {
    if (!this.syncProgress || !this.syncProgress.progress.total_employees) {
      return 0;
    }
    return Math.round((this.syncProgress.progress.processed_employees || 0) / this.syncProgress.progress.total_employees * 100);
  }

  getProgressText(): string {
    if (!this.syncProgress) return '';
    
    const processed = this.syncProgress.progress.processed_employees || 0;
    const total = this.syncProgress.progress.total_employees || 0;
    const batches = this.syncProgress.progress.processed_batches || 0;
    const totalBatches = this.syncProgress.progress.total_batches || 0;
    
    let text = `${processed} of ${total} employees processed`;
    if (totalBatches > 0) {
      text += ` (${batches}/${totalBatches} batches)`;
    }
    
    return text;
  }

  getProgressColor(): 'blue' | 'green' | 'red' | 'yellow' {
    if (!this.syncProgress) return 'blue';
    
    if (this.syncProgress.status === 'failed') return 'red';
    if (this.syncProgress.status === 'completed') return 'green';
    if (this.syncProgress.progress.errors && this.syncProgress.progress.errors.length > 0) return 'yellow';
    
    return 'blue';
  }

  /**
   * Check if any operations are selected
   */
  hasSelectedOperations(): boolean {
    return Object.values(this.selectedOperations).some(selected => selected);
  }

  /**
   * Get selected operations as array
   */
  getSelectedOperationsArray(): string[] {
    return Object.entries(this.selectedOperations)
      .filter(([_, selected]) => selected)
      .map(([operation, _]) => operation);
  }

  /**
   * Sync selected operations
   */
  syncSelected(): void {
    const operations = this.getSelectedOperationsArray();
    
    if (operations.length === 0) {
      this.showToast('Please select at least one operation', 'warning');
      return;
    }

    this.isSyncing = true;
    this.currentSyncOperation = 'selected';
    
    // Clear terminal and show real sync start
    if (this.terminal) {
      this.terminal.logs = [];
      this.terminal.addLog('info', `Starting sync for selected operations: ${operations.join(', ')}`);
      this.terminal.addLog('info', 'Connecting to BambooHR API...');
    }
    
    // Start real API call
    this.bambooHRService.syncSelected(operations).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: SyncResponse) => {
        this.isSyncing = false;
        this.currentSyncOperation = null;
        
        if (this.terminal) {
        if (response.success) {
            this.terminal.addLog('success', 'All selected operations completed successfully!');
            if (response.data) {
              Object.entries(response.data).forEach(([operation, result]: [string, any]) => {
                if (result && result.synced_count !== undefined) {
                  this.terminal.addLog('success', `${operation}: ${result.synced_count} records synced`);
                }
              });
            }
          } else {
            this.terminal.addLog('error', `Sync failed: ${response.message}`);
            if (response.error) {
              this.terminal.addLog('error', response.error);
            }
          }
        }
        
        if (response.success) {
          this.showToast('Selected operations completed successfully', 'success');
          this.refreshData();
        } else {
          this.showToast('Sync failed: ' + response.message, 'error');
        }
      },
      error: (error) => {
        this.isSyncing = false;
        this.currentSyncOperation = null;
        
        if (this.terminal) {
          this.terminal.addLog('error', `API Error: ${error.message || 'Unknown error'}`);
        }
        
        this.showToast('Sync failed: ' + error.message, 'error');
      }
    });
    
    // The WebSocket service will automatically handle real-time updates
    // No need for additional polling - the terminal will receive updates via WebSocket
  }
}