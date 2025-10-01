import { Injectable, signal, computed } from '@angular/core';
import { Observable, combineLatest, map, catchError } from 'rxjs';
import { BambooHRService, Employee } from './bamboohr.service';
import { InatechEmployeeService, InatechEmployee } from './inatech-employee.service';

export interface UnifiedEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  status: string;
  source: 'bamboohr' | 'inatech';
  originalData: Employee | InatechEmployee;
  mapping?: {
    bamboohrId?: string;
    inatechId?: string;
    mappedAt?: Date;
    confidence?: number;
  };
}

export interface EmployeeMapping {
  id: string;
  bamboohrEmployee: Employee;
  inatechEmployee: InatechEmployee;
  confidence: number;
  mappedAt: Date;
}

export interface MappingStats {
  totalBambooHREmployees: number;
  totalInatechEmployees: number;
  mappedEmployees: number;
  unmappedBambooHR: number;
  unmappedInatech: number;
  mappingCoverage: number;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedEmployeeService {
  // Signals for reactive state management
  private readonly bambooHREmployeesSignal = signal<Employee[]>([]);
  private readonly inatechEmployeesSignal = signal<InatechEmployee[]>([]);
  private readonly mappingsSignal = signal<EmployeeMapping[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Computed values
  public bambooHREmployees = computed(() => this.bambooHREmployeesSignal());
  public inatechEmployees = computed(() => this.inatechEmployeesSignal());
  public mappings = computed(() => this.mappingsSignal());
  public loading = computed(() => this.loadingSignal());
  public error = computed(() => this.errorSignal());

  // Computed unified employees
  public unifiedEmployees = computed(() => {
    const bambooEmployees = this.bambooHREmployees();
    const inatechEmployees = this.inatechEmployees();
    const mappings = this.mappings();

    const unified: UnifiedEmployee[] = [];

    // Add BambooHR employees
    bambooEmployees.forEach(emp => {
      const mapping = mappings.find(m => m.bamboohrEmployee.id === emp.id);
      unified.push({
        id: `bamboohr-${emp.id}`,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.work_email || emp.email || '',
        department: typeof emp.department === 'string' ? emp.department : emp.department?.name || 'N/A',
        jobTitle: emp.job_title || 'N/A',
        status: emp.status || 'Unknown',
        source: 'bamboohr',
        originalData: emp,
        mapping: mapping ? {
          bamboohrId: emp.id.toString(),
          inatechId: mapping.inatechEmployee.id.toString(),
          mappedAt: mapping.mappedAt,
          confidence: mapping.confidence
        } : undefined
      });
    });

    // Add Inatech employees
    inatechEmployees.forEach(emp => {
      const mapping = mappings.find(m => m.inatechEmployee.id === emp.id);
      unified.push({
        id: `inatech-${emp.id}`,
        name: emp.employee_name,
        email: '', // Inatech employees don't have email in our current model
        department: 'N/A', // Inatech employees don't have department in our current model
        jobTitle: 'N/A', // Inatech employees don't have job title in our current model
        status: emp.status,
        source: 'inatech',
        originalData: emp,
        mapping: mapping ? {
          bamboohrId: mapping.bamboohrEmployee.id.toString(),
          inatechId: emp.id.toString(),
          mappedAt: mapping.mappedAt,
          confidence: mapping.confidence
        } : undefined
      });
    });

    return unified;
  });

  // Computed mapping statistics
  public mappingStats = computed(() => {
    const bambooEmployees = this.bambooHREmployees();
    const inatechEmployees = this.inatechEmployees();
    const mappings = this.mappings();

    const totalBambooHR = bambooEmployees.length;
    const totalInatech = inatechEmployees.length;
    const mapped = mappings.length;
    const unmappedBambooHR = totalBambooHR - mapped;
    const unmappedInatech = totalInatech - mapped;
    const coverage = totalBambooHR > 0 ? (mapped / totalBambooHR) * 100 : 0;

    return {
      totalBambooHREmployees: totalBambooHR,
      totalInatechEmployees: totalInatech,
      mappedEmployees: mapped,
      unmappedBambooHR,
      unmappedInatech,
      mappingCoverage: Math.round(coverage * 100) / 100
    };
  });

  constructor(
    private readonly bambooHRService: BambooHRService,
    private readonly inatechEmployeeService: InatechEmployeeService
  ) {}

  /**
   * Load all employees from both sources
   */
  loadAllEmployees(): Observable<{ bambooHR: Employee[], inatech: InatechEmployee[] }> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return combineLatest([
      this.bambooHRService.getAllEmployees({}),
      this.inatechEmployeeService.getEmployees()
    ]).pipe(
      map(([bambooResponse, inatechResponse]) => {
        this.loadingSignal.set(false);
        
        const bambooEmployees = bambooResponse.success ? bambooResponse.data.data || [] : [];
        const inatechEmployees = inatechResponse.success ? inatechResponse.data.data || [] : [];
        
        this.bambooHREmployeesSignal.set(bambooEmployees);
        this.inatechEmployeesSignal.set(inatechEmployees);
        
        return { bambooHR: bambooEmployees, inatech: inatechEmployees };
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        this.errorSignal.set('Failed to load employees');
        throw error;
      })
    );
  }

  /**
   * Get mapping suggestions for an employee
   */
  getMappingSuggestions(employeeId: string, source: 'bamboohr' | 'inatech'): Observable<any> {
    if (source === 'inatech') {
      return this.inatechEmployeeService.getMappingSuggestions(parseInt(employeeId));
    } else {
      // For BambooHR employees, get reverse mapping suggestions
      return this.getBambooHRMappingSuggestions(parseInt(employeeId));
    }
  }

  /**
   * Get mapping suggestions for a BambooHR employee (reverse mapping)
   */
  private getBambooHRMappingSuggestions(bamboohrId: number): Observable<any> {
    console.log('Getting mapping suggestions for BambooHR employee ID:', bamboohrId);
    
    // Get the BambooHR employee
    const bambooEmployee = this.bambooHREmployeesSignal().find(emp => emp.id === bamboohrId);
    console.log('Found BambooHR employee:', bambooEmployee);
    
    if (!bambooEmployee) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'BambooHR employee not found' });
        observer.complete();
      });
    }

    // Get all Inatech employees
    const inatechEmployees = this.inatechEmployeesSignal();
    console.log('Available Inatech employees:', inatechEmployees.length);
    
    const suggestions: Array<{
      inatech_employee: any;
      similarity_percentage: number;
      is_already_mapped: boolean;
    }> = [];

    for (const inatechEmployee of inatechEmployees) {
      const similarity = this.calculateNameSimilarity(
        `${bambooEmployee.first_name} ${bambooEmployee.last_name}`,
        inatechEmployee.employee_name
      );

      console.log(`Comparing "${bambooEmployee.first_name} ${bambooEmployee.last_name}" with "${inatechEmployee.employee_name}" - similarity: ${similarity}%`);

      // Only include suggestions with at least 30% similarity
      if (similarity >= 30) {
        // Check if this Inatech employee is already mapped
        const isAlreadyMapped = this.mappingsSignal().some(mapping => 
          mapping.inatechEmployee?.id === inatechEmployee.id
        );
        
        suggestions.push({
          inatech_employee: inatechEmployee,
          similarity_percentage: Math.round(similarity * 100) / 100,
          is_already_mapped: isAlreadyMapped
        });
      }
    }

    // Sort by similarity percentage (highest first)
    suggestions.sort((a, b) => b.similarity_percentage - a.similarity_percentage);

    console.log('Generated suggestions:', suggestions.length);

    return new Observable(observer => {
      observer.next({
        success: true,
        data: {
          bamboo_employee: bambooEmployee,
          suggestions: suggestions
        }
      });
      observer.complete();
    });
  }

  /**
   * Calculate name similarity using Levenshtein distance
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const maxLength = Math.max(name1.length, name2.length);
    if (maxLength === 0) return 0;
    
    const distance = this.levenshteinDistance(name1.toLowerCase(), name2.toLowerCase());
    return ((maxLength - distance) / maxLength) * 100;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Create employee mapping
   */
  createMapping(bamboohrId: string, inatechId: string): Observable<any> {
    return this.inatechEmployeeService.createMapping({
      ina_emp_id: parseInt(inatechId),
      bamboohr_id: parseInt(bamboohrId)
    });
  }

  /**
   * Load all mappings
   */
  loadMappings(): Observable<any> {
    // This would typically call an API to get all mappings
    // For now, we'll return an empty array since mappings are loaded with employees
    return new Observable(observer => {
      observer.next({ success: true, data: [] });
      observer.complete();
    });
  }

  /**
   * Refresh mappings data
   */
  refreshMappings(): void {
    // Clear current mappings - they will be reloaded when loadAllEmployees is called
    this.mappingsSignal.set([]);
  }

  /**
   * Remove employee mapping
   */
  removeMapping(inatechId: string): Observable<any> {
    return this.inatechEmployeeService.removeMapping(parseInt(inatechId));
  }

  /**
   * Bulk mapping operations
   */
  bulkCreateMappings(mappings: { bamboohrId: string, inatechId: string }[]): Observable<any[]> {
    const mappingObservables = mappings.map(mapping => 
      this.createMapping(mapping.bamboohrId, mapping.inatechId)
    );
    
    return combineLatest(mappingObservables);
  }

  /**
   * Search employees across both sources
   */
  searchEmployees(searchTerm: string, source?: 'bamboohr' | 'inatech' | 'all'): UnifiedEmployee[] {
    const employees = this.unifiedEmployees();
    const search = searchTerm.toLowerCase();
    
    if (!search) return employees;
    
    let filteredEmployees = employees;
    
    if (source && source !== 'all') {
      filteredEmployees = employees.filter(emp => emp.source === source);
    }
    
    return filteredEmployees.filter(employee => {
      return employee.name.toLowerCase().includes(search) ||
             employee.email.toLowerCase().includes(search) ||
             employee.department.toLowerCase().includes(search) ||
             employee.jobTitle.toLowerCase().includes(search);
    });
  }

  /**
   * Get employees by mapping status
   */
  getEmployeesByMappingStatus(status: 'mapped' | 'unmapped'): UnifiedEmployee[] {
    const employees = this.unifiedEmployees();
    
    if (status === 'mapped') {
      return employees.filter(emp => emp.mapping);
    } else {
      return employees.filter(emp => !emp.mapping);
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Reset all signals
   */
  reset(): void {
    this.bambooHREmployeesSignal.set([]);
    this.inatechEmployeesSignal.set([]);
    this.mappingsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}
