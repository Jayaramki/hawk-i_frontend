import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { TerminalService, TerminalLogEntry } from '../../services/terminal.service';
import { WebSocketService, WebSocketLogEntry } from '../../services/websocket.service';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal-container bg-gray-900 text-green-400 font-mono text-sm rounded-lg overflow-hidden">
      <!-- Terminal Header -->
      <div class="terminal-header bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-gray-300 ml-4">Sync Terminal</span>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            (click)="clearLogs()" 
            class="text-gray-400 hover:text-white transition-colors"
            title="Clear logs"
          >
            <i class="fas fa-trash"></i>
          </button>
          <button 
            (click)="toggleAutoScroll()" 
            [class]="autoScroll ? 'text-green-400' : 'text-gray-400'"
            class="hover:text-white transition-colors"
            title="Toggle auto-scroll"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
        </div>
      </div>
      
      <!-- Terminal Content -->
      <div 
        #terminalContent 
        class="terminal-content h-96 overflow-y-auto p-4 space-y-1"
        [class.scroll-smooth]="autoScroll"
      >
        <div *ngIf="logs.length === 0" class="text-gray-500 italic">
          Waiting for sync operations...
        </div>
        
        <div 
          *ngFor="let log of logs; trackBy: trackByTimestamp" 
          class="log-entry flex items-start space-x-2"
          [class]="getLogClass(log.level)"
        >
          <span class="timestamp text-gray-500 flex-shrink-0">
            {{ formatTimestamp(log.timestamp) }}
          </span>
          <span class="level-badge flex-shrink-0" [class]="getLevelBadgeClass(log.level)">
            [{{ log.level.toUpperCase() }}]
          </span>
          <span class="message flex-1">{{ log.message }}</span>
        </div>
        
        <!-- Progress indicator -->
        <div *ngIf="isLoading" class="flex items-center space-x-2 text-blue-400">
          <div class="animate-spin">
            <i class="fas fa-spinner"></i>
          </div>
          <span>Loading logs...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terminal-container {
      font-family: 'Courier New', monospace;
    }
    
    .log-entry {
      word-wrap: break-word;
    }
    
    .level-badge {
      font-weight: bold;
      min-width: 60px;
    }
    
    .timestamp {
      min-width: 80px;
    }
    
    .terminal-content::-webkit-scrollbar {
      width: 8px;
    }
    
    .terminal-content::-webkit-scrollbar-track {
      background: #1f2937;
    }
    
    .terminal-content::-webkit-scrollbar-thumb {
      background: #4b5563;
      border-radius: 4px;
    }
    
    .terminal-content::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
  `]
})
export class TerminalComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() service: string = 'bamboohr';
  @Input() operation: string = 'selected';
  @Input() autoRefresh: boolean = true;
  @Input() refreshInterval: number = 2000; // 2 seconds
  
  @ViewChild('terminalContent') terminalContent!: ElementRef;
  
  logs: TerminalLogEntry[] = [];
  isLoading: boolean = false;
  autoScroll: boolean = true;
  private readonly destroy$ = new Subject<void>();
  private refreshInterval$?: any;
  private webSocketService = new WebSocketService();
  
  ngOnInit(): void {
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
    
    // Subscribe to WebSocket logs for this service and operation
    this.webSocketService.subscribeToLogs(this.service, this.operation)
      .pipe(takeUntil(this.destroy$))
      .subscribe(logEntry => {
        this.logs.push(logEntry);
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
    this.webSocketService.disconnect();
  }
  
  ngAfterViewChecked(): void {
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }
  
  startAutoRefresh(): void {
    this.refreshInterval$ = interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadLogs();
      });
    
    // Load initial logs
    this.loadLogs();
  }
  
  stopAutoRefresh(): void {
    if (this.refreshInterval$) {
      this.refreshInterval$.unsubscribe();
    }
  }
  
  loadLogs(): void {
    this.isLoading = true;
    
    // For now, use mock data and disable polling to prevent API errors
    // The terminal will be updated via the addLog() method when sync operations run
    setTimeout(() => {
      // Add initial log entries only if terminal is empty
      if (this.logs.length === 0) {
        this.logs = [
          {
            timestamp: new Date(Date.now() - 30000).toISOString(),
            level: 'info',
            message: 'Terminal initialized and ready for sync operations',
            context: { service: this.service, operation: this.operation }
          },
          {
            timestamp: new Date(Date.now() - 20000).toISOString(),
            level: 'info',
            message: 'Waiting for sync operations to begin...',
            context: {}
          },
          {
            timestamp: new Date(Date.now() - 10000).toISOString(),
            level: 'info',
            message: 'Select operations from the left panel and click "Start Selected Sync"',
            context: {}
          }
        ];
      }
      this.isLoading = false;
    }, 500);
    
    // NOTE: Real WebSocket implementation would be:
    // 1. Connect to WebSocket server
    // 2. Listen for real-time log events
    // 3. Update terminal in real-time without polling
    
    // Current polling approach (commented out to prevent errors):
    // const terminalService = new TerminalService(null as any);
    // terminalService.getLogs(this.service, this.operation)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => {
    //       if (data.success && data.data) {
    //         this.logs = data.data;
    //       }
    //       this.isLoading = false;
    //     },
    //     error: (error) => {
    //       console.error('Failed to load logs:', error);
    //       this.isLoading = false;
    //     }
    //   });
  }
  
  clearLogs(): void {
    this.logs = [];
    // Add a log entry to show that logs were cleared
    this.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Terminal logs cleared',
      context: {}
    });
    
    // TODO: Replace with actual API call once backend is properly configured
    // const terminalService = new TerminalService(null as any);
    // terminalService.clearChannels(this.service, this.operation)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => {
    //       if (data.success) {
    //         console.log('Logs cleared successfully');
    //       }
    //     },
    //     error: (error) => {
    //       console.error('Failed to clear logs:', error);
    //       this.logs.push({
    //         timestamp: new Date().toISOString(),
    //         level: 'error',
    //         message: `Failed to clear logs: ${error.message || 'Unknown error'}`,
    //         context: { error: error.status }
    //       });
    //     }
    //   });
  }
  
  toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
  }
  
  scrollToBottom(): void {
    if (this.terminalContent) {
      const element = this.terminalContent.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
  
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
  
  getLogClass(level: string): string {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  }
  
  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  }
  
  trackByTimestamp(index: number, log: TerminalLogEntry): string {
    return log.timestamp;
  }

  /**
   * Add a log entry to the terminal (for external components to use)
   */
  addLog(level: 'info' | 'success' | 'warning' | 'error', message: string, context?: any): void {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    });
  }

}
