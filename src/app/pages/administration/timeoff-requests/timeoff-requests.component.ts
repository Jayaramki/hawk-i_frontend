import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LayoutComponent } from '../../../shared/components/layout/layout.component';
import { SearchDropdownComponent, SearchDropdownOption } from '../../../shared/components/search-dropdown/search-dropdown.component';
import { ServerGridComponent, GridColumn, GridAction, PaginationInfo } from '../../../shared/components/server-grid/server-grid.component';

// Services
import { TimeoffService, TimeoffRequest, TimeoffFilters } from '../../../shared/services/timeoff.service';

@Component({
  selector: 'app-timeoff-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    LayoutComponent,
    SearchDropdownComponent,
    ServerGridComponent
  ],
  templateUrl: './timeoff-requests.component.html',
  styleUrls: ['./timeoff-requests.component.scss']
})
export class TimeoffRequestsComponent implements OnInit {
  // Signals
  timeoffRequests = signal<TimeoffRequest[]>([]);
  employees = signal<SearchDropdownOption[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  paginationInfo = signal<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15,
    startIndex: 0,
    endIndex: 0
  });
  
  // Filter signals
  selectedEmployee = signal<SearchDropdownOption | null>(null);
  selectedStatus = signal<SearchDropdownOption | null>(null);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  // Pagination
  first = signal(0);
  rows = signal(15);
  currentPage = signal(1);
  
  // Sorting
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Records per page options
  recordsPerPageOptions = [
    { label: '15', value: 15 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // Status options
  statusOptions: SearchDropdownOption[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ];

  // Grid columns
  columns: GridColumn[] = [
    { key: 'employee_name', title: 'Employee', sortable: true },
    { key: 'type', title: 'Type', sortable: true },
    { key: 'start_date', title: 'Start Date', sortable: true },
    { key: 'end_date', title: 'End Date', sortable: true },
    { key: 'days_requested', title: 'Days', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { key: 'requested_date', title: 'Requested', sortable: true },
    { key: 'approved_by', title: 'Approved By', sortable: true }
  ];

  // Grid actions - Read-only view since BambooHR handles approvals
  actions: GridAction[] = [
    {
      label: 'View',
      icon: 'fas fa-eye',
      class: 'text-blue-600 hover:text-blue-900',
      action: (item: TimeoffRequest) => this.viewRequest(item)
    }
  ];

  constructor(private readonly timeoffService: TimeoffService) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTimeoffRequests();
  }

  // Computed properties for status counts
  get pendingCount(): number {
    return this.timeoffRequests().filter(req => req.status === 'pending').length;
  }

  get approvedCount(): number {
    return this.timeoffRequests().filter(req => req.status === 'approved').length;
  }

  get rejectedCount(): number {
    return this.timeoffRequests().filter(req => req.status === 'rejected').length;
  }

  loadEmployees(): void {
    this.timeoffService.getEmployees().subscribe({
      next: (employees: any[]) => {
        const options: SearchDropdownOption[] = employees.map((emp: any) => ({
          label: emp.name,
          value: emp.id,
          searchText: `${emp.name} ${emp.email}`
        }));
        this.employees.set(options);
      },
      error: (error: any) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  loadTimeoffRequests(): void {
    this.loading.set(true);
    
    const filters: TimeoffFilters = {
      employee_id: this.selectedEmployee()?.value || null,
      status: this.selectedStatus()?.value || null,
      start_date: this.startDate(),
      end_date: this.endDate(),
      page: this.currentPage(),
      per_page: this.rows(),
      sort_column: this.sortColumn() || null,
      sort_direction: this.sortDirection()
    };

    this.timeoffService.getTimeoffRequests(filters).subscribe({
      next: (response: any) => {
        this.timeoffRequests.set(response.data);
        this.totalRecords.set(response.total);
        
        // Update pagination info
        const totalPages = Math.ceil(response.total / this.rows());
        const startIndex = (this.currentPage() - 1) * this.rows() + 1;
        const endIndex = Math.min(this.currentPage() * this.rows(), response.total);
        
        this.paginationInfo.set({
          currentPage: this.currentPage(),
          totalPages: totalPages,
          totalItems: response.total,
          itemsPerPage: this.rows(),
          startIndex: startIndex,
          endIndex: endIndex
        });
        
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading timeoff requests:', error);
        this.loading.set(false);
      }
    });
  }

  onEmployeeChange(employee: SearchDropdownOption | null): void {
    this.selectedEmployee.set(employee);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  onStatusChange(status: SearchDropdownOption | null): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  onStartDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.startDate.set(target.value ? new Date(target.value) : null);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  onEndDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.endDate.set(target.value ? new Date(target.value) : null);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  onRecordsPerPageChange(recordsPerPage: number): void {
    this.rows.set(recordsPerPage);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.first.set((page - 1) * this.rows());
    this.loadTimeoffRequests();
  }

  onSortChange(sortInfo: {column: string, direction: 'asc' | 'desc'}): void {
    this.sortColumn.set(sortInfo.column);
    this.sortDirection.set(sortInfo.direction);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  clearFilters(): void {
    this.selectedEmployee.set(null);
    this.selectedStatus.set(null);
    this.startDate.set(null);
    this.endDate.set(null);
    this.currentPage.set(1);
    this.first.set(0);
    this.loadTimeoffRequests();
  }

  viewRequest(request: TimeoffRequest): void {
    console.log('View request:', request);
    // Note: Approvals are handled in BambooHR, this is a read-only view
    // Implement view modal functionality here if needed
  }


  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
