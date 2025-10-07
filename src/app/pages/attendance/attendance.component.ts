import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Design System Components
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { TabComponent, TabItem } from '../../shared/components/tab/tab.component';
import { TabPanelComponent } from '../../shared/components/tab/tab-panel.component';

// View Components
import { AttendanceDayViewComponent } from './views/attendance-day-view.component';
import { AttendanceWeekViewComponent } from './views/attendance-week-view.component';
import { AttendanceMonthViewComponent } from './views/attendance-month-view.component';

// Services
import { AttendanceService } from '../../shared/services/attendance.service';
import { BambooHRService } from '../../shared/services/bamboohr.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LayoutComponent,
    TabComponent,
    TabPanelComponent,
    AttendanceDayViewComponent,
    AttendanceWeekViewComponent,
    AttendanceMonthViewComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent {
  // Tab configuration
  tabs: TabItem[] = [
    { id: 'day', label: 'Day View', icon: 'fas fa-calendar-day' },
    { id: 'week', label: 'Week View', icon: 'fas fa-calendar-week' },
    { id: 'month', label: 'Month View', icon: 'fas fa-calendar-alt' }
  ];
  
  activeTab = signal('day');

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly bambooHRService: BambooHRService
  ) {}

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId);
  }
}