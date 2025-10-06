import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { UnifiedEmployeeService } from '../../shared/services/unified-employee.service';
import { BambooHRService } from '../../shared/services/bamboohr.service';
import { InatechEmployeeService, InatechEmployee } from '../../shared/services/inatech-employee.service';
import { LayoutComponent } from '../../shared/components/layout/layout.component';
import { TabComponent, TabItem } from '../../shared/components/tab/tab.component';
import { TabPanelComponent } from '../../shared/components/tab/tab-panel.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ClientGridComponent, GridColumn, GridAction } from '../../shared/components/client-grid/client-grid.component';

// Bulk mapping interfaces
interface BulkMappingBambooHREmployee {
  id: number;
  name: string;
  email: string;
  department: string;
  job_title: string;
  hire_date: string;
}

interface BulkMappingInatechEmployee {
  id: number;
  name: string;
  ina_emp_id: string;
  department: string;
  job_title: string;
}

interface BulkMappingMatch {
  bamboohr_employee: BulkMappingBambooHREmployee;
  similarity_percentage: number;
  match_type: string;
  confidence: number;
}

interface BulkMappingSuggestion {
  inatech_employee: BulkMappingInatechEmployee;
  suggestions: BulkMappingMatch[];
}

interface SelectedMapping {
  inatech_employee: BulkMappingInatechEmployee;
  bamboohr_employee: BulkMappingBambooHREmployee;
  similarity_percentage?: number;
  match_type?: string;
  confidence?: number;
}

@Component({
  selector: 'app-employees-unified',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LayoutComponent, 
    TabComponent, 
    TabPanelComponent,
    CardComponent, 
    ButtonComponent, 
    InputComponent, 
    ModalComponent,
    ClientGridComponent
  ],
  template: `
    <app-layout>
      <!-- Page header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-heading text-gray-900 dark:text-white mb-2">Employee Management</h1>
            <p class="text-body text-gray-600 dark:text-gray-300">Manage employees from BambooHR and Inatech systems</p>
          </div>
          <div class="flex space-x-3">
            <app-button
              [variant]="'primary'"
              (click)="loadAllEmployees()"
              [loading]="loading()">
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh All
            </app-button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ mappingStats().totalBambooHREmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">BambooHR Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ mappingStats().totalInatechEmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Inatech Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ mappingStats().mappedEmployees }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Mapped Employees</div>
            </div>
          </app-card>
          <app-card>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ mappingStats().mappingCoverage }}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Mapping Coverage</div>
            </div>
          </app-card>
        </div>

        <!-- Tab Navigation -->
        <app-tab
          [tabs]="tabs"
          [activeTab]="activeTab"
          (tabChange)="onTabChange($event)">
          
          <!-- BambooHR Employees Tab -->
          <app-tab-panel [id]="'bamboohr'" [isActive]="activeTab === 'bamboohr'">
            <div class="space-y-6">
              <!-- Search and Filters -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search BambooHR Employees"
                      placeholder="Search by name, email, department..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadBambooHREmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- BambooHR Employees Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="bambooHREmployees"
                  [columns]="bambooHRGridColumns"
                  [actions]="bambooHRGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['name', 'email', 'department', 'jobTitle']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading BambooHR employees..."
                  emptyMessage="No BambooHR employees found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>

          <!-- Inatech Employees Tab -->
          <app-tab-panel [id]="'inatech'" [isActive]="activeTab === 'inatech'">
            <div class="space-y-6">
              <!-- Search and Filters -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search Inatech Employees"
                      placeholder="Search by name or ID..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'primary'"
                      (click)="showCreateInatechEmployeeModal()">
                      <i class="fas fa-plus mr-2"></i>
                      Add Employee
                    </app-button>
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadInatechEmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- Inatech Employees Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="inatechEmployees"
                  [columns]="inatechGridColumns"
                  [actions]="inatechGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['name', 'ina_emp_id']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading Inatech employees..."
                  emptyMessage="No Inatech employees found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>

          <!-- Mappings Tab -->
          <app-tab-panel [id]="'mappings'" [isActive]="activeTab === 'mappings'">
            <div class="space-y-6">
              <!-- Mapping Controls -->
              <app-card>
                <div class="flex flex-col md:flex-row gap-4">
                  <div class="flex-1">
                    <app-input
                      label="Search Mappings"
                      placeholder="Search by employee name..."
                      [(ngModel)]="searchTerm"
                      (input)="onSearchChange($any($event.target).value)"
                      icon="fas fa-search">
                    </app-input>
                  </div>
                  <div class="flex gap-2">
                    <app-button
                      [variant]="'primary'"
                      (click)="openBulkMappingModal()">
                      <i class="fas fa-link mr-2"></i>
                      Bulk Mapping
                    </app-button>
                    <app-button
                      [variant]="'secondary'"
                      (click)="loadAllEmployees()"
                      [loading]="loading()">
                      <i class="fas fa-sync-alt mr-2"></i>
                      Refresh
                    </app-button>
                  </div>
                </div>
              </app-card>

              <!-- Mapping Statistics -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ mappingStats().mappedEmployees }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Mapped</div>
                  </div>
                </app-card>
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ mappingStats().unmappedBambooHR }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Unmapped BambooHR</div>
                  </div>
                </app-card>
                <app-card>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ mappingStats().unmappedInatech }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">Unmapped Inatech</div>
                  </div>
                </app-card>
              </div>

              <!-- Mappings Grid -->
              <app-card *ngIf="!loading()">
                <app-client-grid
                  [data]="mappedEmployees"
                  [columns]="mappingGridColumns"
                  [actions]="mappingGridActions"
                  [loading]="loading()"
                  [searchTerm]="searchTerm"
                  [searchFields]="['bambooName', 'inatechName']"
                  [itemsPerPage]="20"
                  loadingMessage="Loading mappings..."
                  emptyMessage="No mappings found">
                </app-client-grid>
              </app-card>
            </div>
          </app-tab-panel>
        </app-tab>

        <!-- Modals -->
        <!-- Create Inatech Employee Modal -->
        <app-modal
          [isOpen]="showCreateModal"
          [title]="'Create Inatech Employee'"
          [size]="'md'"
          (closeEvent)="closeCreateModal()">
          <form (ngSubmit)="createInatechEmployee()">
            <div class="space-y-4">
              <app-input
                label="INA Employee ID"
                [(ngModel)]="newEmployee.ina_emp_id"
                name="ina_emp_id"
                [required]="true"
                placeholder="Enter INA Employee ID">
              </app-input>
              <app-input
                label="Employee Name"
                [(ngModel)]="newEmployee.employee_name"
                name="employee_name"
                [required]="true"
                placeholder="Enter employee name">
              </app-input>
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  id="status"
                  [(ngModel)]="newEmployee.status"
                  name="status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6" modal-footer>
              <app-button
                [variant]="'secondary'"
                type="button"
                (click)="closeCreateModal()">
                Cancel
              </app-button>
              <app-button
                [variant]="'primary'"
                type="submit">
                <i class="fas fa-plus mr-2"></i>
                Create Employee
              </app-button>
            </div>
          </form>
        </app-modal>

        <!-- Bulk Mapping Modal -->
        <app-modal
          [isOpen]="showBulkMappingModal"
          [title]="'Bulk Employee Mapping'"
          [size]="'xl'"
          (closeEvent)="closeBulkMappingModal()">
          <div class="space-y-6">
            <!-- Instructions -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-1 mr-3"></i>
                <div>
                  <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Bulk Mapping Instructions</h4>
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    Select employees from both systems to create mappings. Use the suggestions tab for intelligent matching, or manually select pairs.
                  </p>
            </div>
          </div>
            </div>

            <!-- Tab Navigation for Bulk Mapping -->
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="-mb-px flex space-x-8">
                <button
                  (click)="bulkMappingActiveTab = 'suggestions'"
                  [class]="bulkMappingActiveTab === 'suggestions' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  <i class="fas fa-lightbulb mr-2"></i>
                  Smart Suggestions
                </button>
                <button
                  (click)="bulkMappingActiveTab = 'manual'"
                  [class]="bulkMappingActiveTab === 'manual' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  <i class="fas fa-hand-paper mr-2"></i>
                  Manual Selection
                </button>
                <button
                  (click)="bulkMappingActiveTab = 'preview'"
                  [class]="bulkMappingActiveTab === 'preview' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  <i class="fas fa-eye mr-2"></i>
                  Preview ({{ selectedMappings.length }})
                </button>
              </nav>
            </div>

            <!-- Smart Suggestions Tab -->
            <div *ngIf="bulkMappingActiveTab === 'suggestions'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Intelligent Mapping Suggestions</h3>
                <div class="flex space-x-2">
                  <app-button
                    [variant]="'primary'"
                    [size]="'sm'"
                    (click)="mapAllHighConfidenceSuggestions()"
                    [disabled]="bulkMappingSuggestions.length === 0">
                    <i class="fas fa-magic mr-2"></i>
                    Map High Confidence
                  </app-button>
                  <app-button
                    [variant]="'secondary'"
                    [size]="'sm'"
                    (click)="loadBulkMappingSuggestions()"
                    [loading]="loadingBulkSuggestions">
                    <i class="fas fa-sync-alt mr-2"></i>
                    Refresh
                  </app-button>
                </div>
              </div>

              <div *ngIf="bulkMappingSuggestions.length === 0 && !loadingBulkSuggestions" class="text-center py-8">
                <i class="fas fa-lightbulb text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">No mapping suggestions available.</p>
              </div>

              <div *ngIf="bulkMappingSuggestions.length > 0" class="space-y-4 max-h-96 overflow-y-auto">
                <div *ngFor="let suggestion of bulkMappingSuggestions" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-green-600 dark:text-green-400"></i>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-900 dark:text-white">{{ suggestion.inatech_employee.name }}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">INA ID: {{ suggestion.inatech_employee.ina_emp_id }}</p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        (click)="toggleSuggestionSelection(suggestion)"
                        [class]="isSuggestionSelected(suggestion) 
                          ? 'bg-green-600 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'"
                        class="px-3 py-1 rounded-full text-sm font-medium transition-colors">
                        <i class="fas fa-link mr-1"></i>
                        {{ isSuggestionSelected(suggestion) ? 'Mapped' : 'Map Best Match' }}
                      </button>
                      <button
                        *ngIf="isSuggestionSelected(suggestion)"
                        (click)="removeSuggestionMappings(suggestion)"
                        class="px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                        <i class="fas fa-times mr-1"></i>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div *ngFor="let match of suggestion.suggestions" 
                         class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          <i class="fas fa-user text-blue-600 dark:text-blue-400 text-sm"></i>
                        </div>
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ match.bamboohr_employee.name }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{{ match.bamboohr_employee.email }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <div class="flex flex-col items-end">
                          <span class="text-sm font-medium text-green-600 dark:text-green-400">
                            {{ match.similarity_percentage }}% match
                          </span>
                          <span *ngIf="match.match_type" class="text-xs text-gray-500 dark:text-gray-400">
                            {{ getMatchTypeLabel(match.match_type) }}
                          </span>
                          <span *ngIf="match.confidence" class="text-xs text-blue-600 dark:text-blue-400">
                            {{ match.confidence.toFixed(1) }}% confidence
                          </span>
                        </div>
                        <div class="flex space-x-2">
                        <button
                          (click)="selectSuggestionMatch(suggestion, match)"
                          [class]="isSuggestionMatchSelected(suggestion, match) 
                            ? 'bg-green-600 text-white' 
                            : isBambooHREmployeeAlreadyMapped(match.bamboohr_employee.id)
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'"
                          [disabled]="isBambooHREmployeeAlreadyMapped(match.bamboohr_employee.id)"
                          class="px-3 py-1 rounded text-sm font-medium transition-colors">
                          <i class="fas fa-link mr-1"></i>
                          {{ isSuggestionMatchSelected(suggestion, match) ? 'Selected' : 
                             isBambooHREmployeeAlreadyMapped(match.bamboohr_employee.id) ? 'Already Mapped' : 'Map' }}
                        </button>
                          <button
                            *ngIf="isSuggestionMatchSelected(suggestion, match)"
                            (click)="removeSuggestionMapping(suggestion, match)"
                            class="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                            <i class="fas fa-times mr-1"></i>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Manual Selection Tab -->
            <div *ngIf="bulkMappingActiveTab === 'manual'" class="space-y-4">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- BambooHR Employees -->
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">BambooHR Employees</h3>
                  <div class="max-h-80 overflow-y-auto space-y-2">
                    <div *ngFor="let employee of bulkMappingBambooHREmployees" 
                         class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          [checked]="isBambooHREmployeeSelected(employee)"
                          (change)="toggleBambooHREmployeeSelection(employee)"
                          class="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ employee.name }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">{{ employee.email }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Inatech Employees -->
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Inatech Employees</h3>
                  <div class="max-h-80 overflow-y-auto space-y-2">
                    <div *ngFor="let employee of bulkMappingInatechEmployees" 
                         class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          [checked]="isInatechEmployeeSelected(employee)"
                          (change)="toggleInatechEmployeeSelection(employee)"
                          class="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                        <div>
                          <p class="font-medium text-gray-900 dark:text-white">{{ employee.name }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">INA ID: {{ employee.ina_emp_id }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Manual Pairing -->
              <div *ngIf="selectedBambooHREmployees.length > 0 && selectedInatechEmployees.length > 0" class="mt-6">
                <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Create Mappings</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BambooHR Employee</label>
                    <select 
                      [(ngModel)]="manualMappingBambooHR"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Select BambooHR employee</option>
                      <option *ngFor="let emp of selectedBambooHREmployees" [value]="emp.id">{{ emp.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inatech Employee</label>
                    <select 
                      [(ngModel)]="manualMappingInatech"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">Select Inatech employee</option>
                      <option *ngFor="let emp of selectedInatechEmployees" [value]="emp.id">{{ emp.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="mt-4">
                  <app-button
                    [variant]="'primary'"
                    [size]="'sm'"
                    (click)="addManualMapping()"
                    [disabled]="!manualMappingBambooHR || !manualMappingInatech">
                    <i class="fas fa-plus mr-2"></i>
                    Add Mapping
                  </app-button>
                </div>
              </div>
            </div>

            <!-- Preview Tab -->
            <div *ngIf="bulkMappingActiveTab === 'preview'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Mapping Preview</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ selectedMappings.length }} mappings selected</span>
              </div>

              <div *ngIf="selectedMappings.length === 0" class="text-center py-8">
                <i class="fas fa-eye text-4xl text-gray-400 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">No mappings selected. Go to Suggestions or Manual tabs to create mappings.</p>
              </div>

              <div *ngIf="selectedMappings.length > 0" class="space-y-3 max-h-80 overflow-y-auto">
                <div *ngFor="let mapping of selectedMappings; let i = index" 
                     class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-blue-600 dark:text-blue-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ mapping.bamboohr_employee.name }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ mapping.bamboohr_employee.email }}</p>
                      </div>
                    </div>
                    <i class="fas fa-arrow-right text-gray-400"></i>
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-green-600 dark:text-green-400 text-sm"></i>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ mapping.inatech_employee.name }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">INA ID: {{ mapping.inatech_employee.ina_emp_id }}</p>
                      </div>
                    </div>
                    <div class="flex flex-col items-end">
                      <span *ngIf="mapping.similarity_percentage" class="text-sm font-medium text-green-600 dark:text-green-400">
                        {{ mapping.similarity_percentage }}% match
                      </span>
                      <span *ngIf="mapping.match_type" class="text-xs text-gray-500 dark:text-gray-400">
                        {{ getMatchTypeLabel(mapping.match_type) }}
                      </span>
                      <span *ngIf="mapping.confidence" class="text-xs text-blue-600 dark:text-blue-400">
                        {{ mapping.confidence.toFixed(1) }}% confidence
                      </span>
                    </div>
                  </div>
                  <button
                    (click)="removeMapping(i)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center mt-6" modal-footer>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedMappings.length }} mappings ready to create
            </div>
            <div class="flex space-x-3">
            <app-button
              [variant]="'secondary'"
              (click)="closeBulkMappingModal()">
              Cancel
            </app-button>
            <app-button
              [variant]="'primary'"
                (click)="createBulkMappings()"
                [disabled]="selectedMappings.length === 0"
                [loading]="creatingBulkMappings">
              <i class="fas fa-link mr-2"></i>
                Create {{ selectedMappings.length }} Mappings
            </app-button>
            </div>
          </div>
        </app-modal>

        <!-- Mapping Modal -->
        <app-modal
          [isOpen]="showMappingModal"
          [title]="'Map Employee'"
          [size]="'lg'"
          (closeEvent)="closeMappingModal()">
          <div class="space-y-4">
            <div *ngIf="selectedEmployee" class="mb-4">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">BambooHR Employee</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedEmployee.name }}</p>
            </div>
            
            <div *ngIf="mappingSuggestions.length > 0">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Suggested Mappings</h4>
              <div class="space-y-2">
                <div *ngFor="let suggestion of mappingSuggestions" 
                     class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ suggestion.inatech_employee.employee_name }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">INA ID: {{ suggestion.inatech_employee.ina_emp_id }}</p>
                    <p class="text-sm text-blue-600 dark:text-blue-400">{{ suggestion.similarity_percentage }}% match</p>
                  </div>
                  <app-button
                    [variant]="'primary'"
                    [size]="'sm'"
                    (click)="createMapping(selectedEmployee.id, suggestion.inatech_employee.id)">
                    <i class="fas fa-link mr-1"></i>
                    Map
                  </app-button>
                </div>
              </div>
            </div>
            
            <div *ngIf="mappingSuggestions.length === 0" class="text-center py-8 text-gray-500">
              No mapping suggestions found.
            </div>
          </div>
        </app-modal>

        <!-- Error Modal -->
        <app-modal
          [isOpen]="showErrorModal"
          [title]="errorTitle"
          [size]="'md'"
          (closeEvent)="closeErrorModal()">
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6" modal-footer>
            <app-button
              [variant]="'primary'"
              (click)="closeErrorModal()">
              <i class="fas fa-check mr-2"></i>
              OK
            </app-button>
          </div>
        </app-modal>

        <!-- Mapping Status Template -->
        <ng-template #mappingStatusTemplate let-item>
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            [class]="item.mappingStatus === 'Mapped' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'">
            <i 
              [class]="item.mappingStatus === 'Mapped' ? 'fas fa-check-circle mr-1' : 'fas fa-times-circle mr-1'">
            </i>
            {{ item.mappingStatus }}
          </span>
        </ng-template>
    </app-layout>
  `,
  styles: []
})
export class EmployeesUnifiedComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // Component state
  activeTab = 'bamboohr';
  searchTerm = '';
  showCreateModal = false;
  showBulkMappingModal = false;
  showMappingModal = false;
  selectedEmployee: any = null;
  mappingSuggestions: any[] = [];

  // Bulk mapping state
  bulkMappingActiveTab = 'suggestions';
  bulkMappingSuggestions: BulkMappingSuggestion[] = [];
  bulkMappingBambooHREmployees: BulkMappingBambooHREmployee[] = [];
  bulkMappingInatechEmployees: BulkMappingInatechEmployee[] = [];
  selectedMappings: SelectedMapping[] = [];
  selectedBambooHREmployees: BulkMappingBambooHREmployee[] = [];
  selectedInatechEmployees: BulkMappingInatechEmployee[] = [];
  manualMappingBambooHR = '';
  manualMappingInatech = '';
  loadingBulkSuggestions = false;
  creatingBulkMappings = false;

  // Error modal state
  showErrorModal = false;
  errorMessage = '';
  errorTitle = '';

  // Form data
  newEmployee: Partial<InatechEmployee> = {
    ina_emp_id: '',
    employee_name: '',
    status: 'active'
  };

  // Template references
  @ViewChild('mappingStatusTemplate', { static: true }) mappingStatusTemplate!: TemplateRef<any>;

  // Tab configuration
  tabs: TabItem[] = [
    { id: 'bamboohr', label: 'BambooHR Employees', icon: 'fas fa-users' },
    { id: 'inatech', label: 'Inatech Employees', icon: 'fas fa-user-cog' },
    { id: 'mappings', label: 'Employee Mappings', icon: 'fas fa-link' }
  ];

  // Grid configurations
  bambooHRGridColumns: GridColumn[] = [
    { key: 'name', title: 'Employee', width: '300px' },
    { key: 'department', title: 'Department', sortable: true },
    { key: 'jobTitle', title: 'Job Title', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { 
      key: 'mappingStatus', 
      title: 'Mapping', 
      sortable: true,
      template: this.mappingStatusTemplate
    }
  ];

  inatechGridColumns: GridColumn[] = [
    { key: 'name', title: 'Employee', width: '300px' },
    { key: 'ina_emp_id', title: 'INA ID', sortable: true },
    { key: 'status', title: 'Status', sortable: true },
    { 
      key: 'mappingStatus', 
      title: 'Mapping', 
      sortable: true,
      template: this.mappingStatusTemplate
    }
  ];

  mappingGridColumns: GridColumn[] = [
    { key: 'bambooName', title: 'BambooHR Employee', width: '250px' },
    { key: 'inatechName', title: 'Inatech Employee', width: '250px' },
    { key: 'mappedAt', title: 'Mapped At', sortable: true }
  ];

  bambooHRGridActions: GridAction[] = [
    {
      label: 'Map',
      icon: 'fas fa-link',
      class: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300',
      action: (employee: any) => this.mapEmployee(employee)
    }
  ];

  inatechGridActions: GridAction[] = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      class: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300',
      action: (employee: any) => this.editInatechEmployee(employee)
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash',
      class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
      action: (employee: any) => this.deleteInatechEmployee(employee)
    }
  ];

  mappingGridActions: GridAction[] = [
    {
      label: 'Unmap',
      icon: 'fas fa-unlink',
      class: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300',
      action: (mapping: any) => this.unmapEmployee(mapping)
    }
  ];

  constructor(
    private readonly unifiedEmployeeService: UnifiedEmployeeService,
    private readonly bambooHRService: BambooHRService,
    private readonly inatechEmployeeService: InatechEmployeeService
  ) {
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
      });
  }

  ngOnInit(): void {
    this.loadAllEmployees();
    this.loadMappings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
  get loading() {
    return this.unifiedEmployeeService.loading;
  }

  get mappingStats() {
    return this.unifiedEmployeeService.mappingStats;
  }

  // Debug method to check if data is loaded
  get isDataLoaded(): boolean {
    const bambooCount = this.unifiedEmployeeService.bambooHREmployees().length;
    const inatechCount = this.unifiedEmployeeService.inatechEmployees().length;
    console.log('Data loaded check - BambooHR:', bambooCount, 'Inatech:', inatechCount);
    return bambooCount > 0 || inatechCount > 0;
  }

  // Tab management
  onTabChange(tabId: string): void {
    this.activeTab = tabId;
  }

  // Search functionality
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  // Data loading
  loadAllEmployees(): void {
    this.unifiedEmployeeService.loadAllEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Transform and store the data using API mapping status
          this.bambooHREmployees = (data.bambooHR || []).map(emp => {
            return {
              ...emp,
              name: `${emp.first_name} ${emp.last_name}`,
              department: typeof emp.department === 'string' ? emp.department : emp.department?.name || 'N/A',
              jobTitle: emp.job_title || 'N/A',
              mappingStatus: emp.mapping_status || 'Unmapped' // Use API mapping status
            };
          });
          
          this.inatechEmployees = (data.inatech || []).map(emp => {
            return {
              ...emp,
              name: emp.employee_name,
              mappingStatus: emp.mapping_status || 'Unmapped' // Use API mapping status
            };
          });
          
          this.mappedEmployees = this.unifiedEmployeeService.mappings().map(mapping => ({
            id: mapping.id,
            bambooName: (mapping.bamboohrEmployee as any)?.name || '',
            inatechName: (mapping.inatechEmployee as any)?.name || '',
            mappedAt: mapping.mappedAt
          }));
        },
        error: (error) => {
          console.error('Error loading employees:', error);
        }
      });
  }

  loadMappings(): void {
    this.unifiedEmployeeService.loadMappings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Mappings loaded successfully:', response);
        },
        error: (error) => {
          console.error('Error loading mappings:', error);
        }
      });
  }

  loadBambooHREmployees(): void {
    this.bambooHRService.getAllEmployees({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('BambooHR employees loaded');
          }
        },
        error: (error) => {
          console.error('Error loading BambooHR employees:', error);
        }
      });
  }

  loadInatechEmployees(): void {
    this.inatechEmployeeService.getEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Inatech employees loaded');
          }
        },
        error: (error) => {
          console.error('Error loading Inatech employees:', error);
        }
      });
  }

  // Reactive data properties
  bambooHREmployees: any[] = [];
  inatechEmployees: any[] = [];
  mappedEmployees: any[] = [];


  // Modal management
  showCreateInatechEmployeeModal(): void {
    this.newEmployee = {
      ina_emp_id: '',
      employee_name: '',
      status: 'active'
    };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  openBulkMappingModal(): void {
    this.showBulkMappingModal = true;
    this.bulkMappingActiveTab = 'suggestions';
    this.loadBulkMappingData();
  }

  closeBulkMappingModal(): void {
    this.showBulkMappingModal = false;
    this.resetBulkMappingState();
  }

  resetBulkMappingState(): void {
    this.bulkMappingActiveTab = 'suggestions';
    this.bulkMappingSuggestions = [];
    this.bulkMappingBambooHREmployees = [];
    this.bulkMappingInatechEmployees = [];
    this.selectedMappings = [];
    this.selectedBambooHREmployees = [];
    this.selectedInatechEmployees = [];
    this.manualMappingBambooHR = '';
    this.manualMappingInatech = '';
    this.loadingBulkSuggestions = false;
    this.creatingBulkMappings = false;
  }

  loadBulkMappingData(): void {
    this.unifiedEmployeeService.getBulkMappingData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.bulkMappingBambooHREmployees = response.data.bamboohr_employees;
            this.bulkMappingInatechEmployees = response.data.inatech_employees;
            this.loadBulkMappingSuggestions();
          }
        },
        error: (error) => {
          console.error('Error loading bulk mapping data:', error);
        }
      });
  }

  loadBulkMappingSuggestions(): void {
    this.loadingBulkSuggestions = true;
    this.unifiedEmployeeService.getBulkMappingSuggestions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loadingBulkSuggestions = false;
          if (response.success) {
            this.bulkMappingSuggestions = response.data.suggestions;
          }
        },
        error: (error) => {
          this.loadingBulkSuggestions = false;
          console.error('Error loading bulk mapping suggestions:', error);
        }
      });
  }

  // Suggestion selection methods
  toggleSuggestionSelection(suggestion: BulkMappingSuggestion): void {
    const isSelected = this.isSuggestionSelected(suggestion);
    if (isSelected) {
      this.removeSuggestionMappings(suggestion);
    } else if (suggestion.suggestions.length > 0) {
      // Auto-select the best match if available
      this.selectSuggestionMatch(suggestion, suggestion.suggestions[0]);
    }
  }

  isSuggestionSelected(suggestion: BulkMappingSuggestion): boolean {
    return this.selectedMappings.some(mapping => 
      mapping.inatech_employee.id === suggestion.inatech_employee.id
    );
  }

  selectSuggestionMatch(suggestion: BulkMappingSuggestion, match: BulkMappingMatch): void {
    // Check if this BambooHR employee is already mapped to another Inatech employee
    const existingBambooMapping = this.selectedMappings.find(m => 
      m.bamboohr_employee.id === match.bamboohr_employee.id && 
      m.inatech_employee.id !== suggestion.inatech_employee.id
    );
    
    if (existingBambooMapping) {
      this.showError(
        'Mapping Conflict',
        `BambooHR employee "${match.bamboohr_employee.name}" is already mapped to "${existingBambooMapping.inatech_employee.name}". Only one-to-one mappings are allowed.`
      );
      return;
    }

    const mapping: SelectedMapping = {
      inatech_employee: suggestion.inatech_employee,
      bamboohr_employee: match.bamboohr_employee,
      similarity_percentage: match.similarity_percentage,
      match_type: match.match_type,
      confidence: match.confidence
    };

    // Remove any existing mapping for this Inatech employee (one-to-one constraint)
    this.selectedMappings = this.selectedMappings.filter(m => 
      m.inatech_employee.id !== suggestion.inatech_employee.id
    );

    // Add the new mapping
    this.selectedMappings.push(mapping);
  }

  isSuggestionMatchSelected(suggestion: BulkMappingSuggestion, match: BulkMappingMatch): boolean {
    return this.selectedMappings.some(mapping => 
      mapping.inatech_employee.id === suggestion.inatech_employee.id &&
      mapping.bamboohr_employee.id === match.bamboohr_employee.id
    );
  }

  removeSuggestionMappings(suggestion: BulkMappingSuggestion): void {
    this.selectedMappings = this.selectedMappings.filter(mapping => 
      mapping.inatech_employee.id !== suggestion.inatech_employee.id
    );
  }

  removeSuggestionMapping(suggestion: BulkMappingSuggestion, match: BulkMappingMatch): void {
    this.selectedMappings = this.selectedMappings.filter(mapping => 
      !(mapping.inatech_employee.id === suggestion.inatech_employee.id && 
        mapping.bamboohr_employee.id === match.bamboohr_employee.id)
    );
  }

  // Manual selection methods
  toggleBambooHREmployeeSelection(employee: BulkMappingBambooHREmployee): void {
    const index = this.selectedBambooHREmployees.findIndex(emp => emp.id === employee.id);
    if (index > -1) {
      this.selectedBambooHREmployees.splice(index, 1);
    } else {
      this.selectedBambooHREmployees.push(employee);
    }
  }

  toggleInatechEmployeeSelection(employee: BulkMappingInatechEmployee): void {
    const index = this.selectedInatechEmployees.findIndex(emp => emp.id === employee.id);
    if (index > -1) {
      this.selectedInatechEmployees.splice(index, 1);
    } else {
      this.selectedInatechEmployees.push(employee);
    }
  }

  isBambooHREmployeeSelected(employee: BulkMappingBambooHREmployee): boolean {
    return this.selectedBambooHREmployees.some(emp => emp.id === employee.id);
  }

  isInatechEmployeeSelected(employee: BulkMappingInatechEmployee): boolean {
    return this.selectedInatechEmployees.some(emp => emp.id === employee.id);
  }

  addManualMapping(): void {
    if (!this.manualMappingBambooHR || !this.manualMappingInatech) {
      return;
    }

    const bambooEmployee = this.selectedBambooHREmployees.find(emp => emp.id.toString() === this.manualMappingBambooHR);
    const inatechEmployee = this.selectedInatechEmployees.find(emp => emp.id.toString() === this.manualMappingInatech);

    if (bambooEmployee && inatechEmployee) {
      // Check if BambooHR employee is already mapped to another Inatech employee
      const existingBambooMapping = this.selectedMappings.find(m => 
        m.bamboohr_employee.id === bambooEmployee.id && 
        m.inatech_employee.id !== inatechEmployee.id
      );
      
      if (existingBambooMapping) {
        this.showError(
          'Mapping Conflict',
          `BambooHR employee "${bambooEmployee.name}" is already mapped to "${existingBambooMapping.inatech_employee.name}". Only one-to-one mappings are allowed.`
        );
        return;
      }

      // Check if Inatech employee is already mapped to another BambooHR employee
      const existingInatechMapping = this.selectedMappings.find(m => 
        m.inatech_employee.id === inatechEmployee.id && 
        m.bamboohr_employee.id !== bambooEmployee.id
      );
      
      if (existingInatechMapping) {
        this.showError(
          'Mapping Conflict',
          `Inatech employee "${inatechEmployee.name}" is already mapped to "${existingInatechMapping.bamboohr_employee.name}". Only one-to-one mappings are allowed.`
        );
        return;
      }

      const mapping: SelectedMapping = {
        inatech_employee: inatechEmployee,
        bamboohr_employee: bambooEmployee,
        similarity_percentage: undefined
      };

      // Remove any existing mapping for this Inatech employee (one-to-one constraint)
      this.selectedMappings = this.selectedMappings.filter(m => 
        m.inatech_employee.id !== inatechEmployee.id
      );

      this.selectedMappings.push(mapping);
      this.manualMappingBambooHR = '';
      this.manualMappingInatech = '';
    }
  }

  removeMapping(index: number): void {
    this.selectedMappings.splice(index, 1);
  }

  createBulkMappings(): void {
    if (this.selectedMappings.length === 0) {
      return;
    }

    this.creatingBulkMappings = true;
    const mappings = this.selectedMappings.map(mapping => ({
      inatech_id: mapping.inatech_employee.id,
      bamboohr_id: mapping.bamboohr_employee.id
    }));

    this.unifiedEmployeeService.createBulkMappings(mappings)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.creatingBulkMappings = false;
          if (response.success) {
            console.log('Bulk mappings created successfully:', response);
            this.closeBulkMappingModal();
            // Refresh data
            this.loadAllEmployees();
          }
        },
        error: (error) => {
          this.creatingBulkMappings = false;
          console.error('Error creating bulk mappings:', error);
        }
      });
  }

  getMatchTypeLabel(matchType: string): string {
    switch (matchType) {
      case 'email_name':
        return 'Email-based match';
      case 'name':
        return 'Name similarity';
      default:
        return 'Match';
    }
  }

  isBambooHREmployeeAlreadyMapped(bamboohrId: number): boolean {
    return this.selectedMappings.some(mapping => 
      mapping.bamboohr_employee.id === bamboohrId
    );
  }

  showError(title: string, message: string): void {
    this.errorTitle = title;
    this.errorMessage = message;
    this.showErrorModal = true;
  }

  closeErrorModal(): void {
    this.showErrorModal = false;
    this.errorTitle = '';
    this.errorMessage = '';
  }

  mapAllHighConfidenceSuggestions(): void {
    let mappedCount = 0;
    
    this.bulkMappingSuggestions.forEach((suggestion: BulkMappingSuggestion) => {
      // Find the highest confidence suggestion for this Inatech employee
      const bestMatch = suggestion.suggestions
        .filter((match: BulkMappingMatch) => match.confidence >= 80) // Only high confidence matches
        .sort((a: BulkMappingMatch, b: BulkMappingMatch) => b.confidence - a.confidence)[0];
      
      if (bestMatch && !this.isSuggestionMatchSelected(suggestion, bestMatch)) {
        this.selectSuggestionMatch(suggestion, bestMatch);
        mappedCount++;
      }
    });
    
    if (mappedCount > 0) {
      console.log(`Auto-mapped ${mappedCount} high-confidence suggestions`);
    }
  }

  closeMappingModal(): void {
    this.showMappingModal = false;
    this.selectedEmployee = null;
    this.mappingSuggestions = [];
  }

  createMapping(bamboohrId: string, inatechId: string): void {
    this.unifiedEmployeeService.createMapping(bamboohrId, inatechId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Mapping created successfully:', response);
            this.closeMappingModal();
            // Refresh mappings and reload all data to update mapping status
            this.unifiedEmployeeService.refreshMappings();
            this.loadAllEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating mapping:', error);
        }
      });
  }

  // Employee management
  createInatechEmployee(): void {
    if (!this.newEmployee.ina_emp_id || !this.newEmployee.employee_name) {
      return;
    }

    this.inatechEmployeeService.createEmployee(this.newEmployee)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.closeCreateModal();
            this.loadInatechEmployees();
          }
        },
        error: (error) => {
          console.error('Error creating employee:', error);
        }
      });
  }

  editInatechEmployee(employee: any): void {
    // Set the employee data for editing
    this.newEmployee = {
      id: employee.id,
      ina_emp_id: employee.ina_emp_id,
      employee_name: employee.employee_name,
      status: employee.status
    };
    this.showCreateModal = true;
  }

  deleteInatechEmployee(employee: any): void {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      this.inatechEmployeeService.deleteEmployee(employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.loadInatechEmployees();
            }
          },
          error: (error) => {
            console.error('Error deleting employee:', error);
          }
        });
    }
  }

  // Mapping functionality
  mapEmployee(employee: any): void {
    console.log('Opening mapping modal for employee:', employee);
    // Open mapping modal for BambooHR employee
    this.selectedEmployee = employee;
    this.mappingSuggestions = [];
    this.showMappingModal = true;
    
    // Get mapping suggestions
    this.unifiedEmployeeService.getMappingSuggestions(employee.id.toString(), 'bamboohr')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Mapping suggestions response:', response);
          if (response.success) {
            this.mappingSuggestions = response.data.suggestions;
            console.log('Mapping suggestions loaded:', this.mappingSuggestions.length);
          }
        },
        error: (error) => {
          console.error('Error loading mapping suggestions:', error);
        }
      });
  }

  unmapEmployee(mapping: any): void {
    if (confirm(`Are you sure you want to unmap ${mapping.bambooName} and ${mapping.inatechName}?`)) {
      this.unifiedEmployeeService.removeMapping(mapping.inatechId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              console.log('Mapping removed successfully:', response);
              // Refresh mappings and reload all data to update mapping status
              this.unifiedEmployeeService.refreshMappings();
              this.loadAllEmployees();
            }
          },
          error: (error) => {
            console.error('Error unmapping employee:', error);
          }
        });
    }
  }
}
