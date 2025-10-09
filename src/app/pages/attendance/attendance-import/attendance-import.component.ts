import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Design System Components
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

// Services
import { AttendanceService, AttendanceImportResponse } from '../../../shared/services/attendance.service';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-attendance-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './attendance-import.component.html',
  styleUrls: ['./attendance-import.component.scss']
})
export class AttendanceImportComponent {
  // Signals for reactive state
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  uploadProgress = signal(0);
  importResult = signal<AttendanceImportResponse | null>(null);
  showResult = signal(false);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly notificationService: NotificationService
  ) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.attendanceService.validateFile(file);
      if (validation.valid) {
        this.selectedFile.set(file);
        this.showResult.set(false);
        this.importResult.set(null);
      } else {
        this.notificationService.showError('Invalid File', validation.message || 'Invalid file format');
        event.target.value = '';
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile()) {
      this.notificationService.showError('No File Selected', 'Please select a file to upload');
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.showResult.set(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress() < 90) {
        this.uploadProgress.set(this.uploadProgress() + 10);
      }
    }, 200);

    this.attendanceService.importAttendance(this.selectedFile()!).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress.set(100);
        this.isUploading.set(false);
        this.importResult.set(response);
        this.showResult.set(true);

        if (response.success) {
          let message = `Processed ${response.data?.processed_count} records successfully`;
          if (response.data?.new_employees_count && response.data.new_employees_count > 0) {
            message += ` and created ${response.data.new_employees_count} new employee(s)`;
          }
          this.notificationService.showSuccess('Import Successful', message);
        } else {
          this.notificationService.showError('Import Failed', response.message);
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading.set(false);
        this.uploadProgress.set(0);
        
        this.notificationService.showError('Upload Failed', 'An error occurred while uploading the file');
        console.error('Upload error:', error);
      }
    });
  }

  onDownloadTemplate(): void {
    this.attendanceService.downloadTemplate();
  }

  onClearFile(): void {
    this.selectedFile.set(null);
    this.showResult.set(false);
    this.importResult.set(null);
    this.uploadProgress.set(0);
    
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get hasErrors(): boolean {
    const result = this.importResult();
    return !!(result?.data?.errors && result.data.errors.length > 0);
  }

  get errorList(): string[] {
    const result = this.importResult();
    return result?.data?.errors || [];
  }

  get newEmployees(): any[] {
    const result = this.importResult();
    return result?.data?.new_employees || [];
  }

  get hasNewEmployees(): boolean {
    const result = this.importResult();
    return !!(result?.data?.new_employees && result.data.new_employees.length > 0);
  }

}
