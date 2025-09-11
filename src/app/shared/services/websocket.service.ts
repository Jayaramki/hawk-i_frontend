import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import Pusher from 'pusher-js';

export interface WebSocketMessage {
  type: 'log' | 'progress' | 'status';
  service: string;
  operation: string;
  data: any;
  timestamp: string;
}

export interface WebSocketLogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private pusher?: Pusher;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds

  public messages$ = this.messageSubject.asObservable();
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    // Auto-connect when service is instantiated
    this.connect();
  }

  /**
   * Connect to WebSocket server using Pusher
   */
  connect(): void {
    try {
      this.pusher = new Pusher(environment.pusherKey, {
        cluster: environment.pusherCluster,
        wsHost: environment.pusherHost,
        wsPort: environment.pusherPort,
        wssPort: environment.pusherPort,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        disabledTransports: [],
      });

      this.pusher.connection.bind('connected', () => {
        console.log('Pusher connected');
        this.connectionStatus.next(true);
        this.reconnectAttempts = 0;
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('Pusher disconnected');
        this.connectionStatus.next(false);
        this.attemptReconnect();
      });

      this.pusher.connection.bind('error', (error: any) => {
        console.error('Pusher error:', error);
        this.connectionStatus.next(false);
      });

    } catch (error) {
      console.error('Failed to connect to Pusher:', error);
      this.connectionStatus.next(false);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = undefined;
    }
    this.connectionStatus.next(false);
  }

  /**
   * Send message to WebSocket server
   */
  send(message: any): void {
    if (this.pusher && this.pusher.connection.state === 'connected') {
      // For Pusher, we typically don't send messages directly
      // Instead, we trigger events on channels
      console.log('Pusher connected, message would be sent:', message);
    } else {
      console.warn('Pusher not connected, cannot send message:', message);
    }
  }

  /**
   * Subscribe to specific service and operation logs
   */
  subscribeToLogs(service: string, operation: string): Observable<WebSocketLogEntry> {
    return new Observable(observer => {
      if (!this.pusher) {
        observer.error('Pusher not initialized');
        return;
      }

      const channelName = `sync-progress.${service}`;
      const channel = this.pusher.subscribe(channelName);

      channel.bind('sync.progress', (data: any) => {
        if (data.sync_type === operation) {
          const logEntry: WebSocketLogEntry = {
            timestamp: data.timestamp,
            level: 'info',
            message: data.progress.message || 'Progress update',
            context: data.progress
          };
          observer.next(logEntry);
        }
      });

      return () => {
        this.pusher?.unsubscribe(channelName);
      };
    });
  }

  /**
   * Subscribe to specific service and operation progress
   */
  subscribeToProgress(service: string, operation: string): Observable<any> {
    return new Observable(observer => {
      if (!this.pusher) {
        observer.error('Pusher not initialized');
        return;
      }

      const channelName = `sync-progress.${service}`;
      const channel = this.pusher.subscribe(channelName);

      channel.bind('sync.progress', (data: any) => {
        if (data.sync_type === operation) {
          observer.next(data.progress);
        }
      });

      return () => {
        this.pusher?.unsubscribe(channelName);
      };
    });
  }


  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect Pusher (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionStatus.value;
  }

}
