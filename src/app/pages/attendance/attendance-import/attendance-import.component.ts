import { Component, OnInit } from '@angular/core';
import { AttendanceService, AttendanceImportResponse } from '../../../shared/services/attendance.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-attendance-import',
  templateUrl: './attendance-import.component.html',
  styleUrls: ['./attendance-import.component.scss']
})
export class AttendanceImportComponent implements OnInit {
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  importResult: AttendanceImportResponse | null = null;
  showResult = false;

  constructor(
    private attendanceService: AttendanceService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.attendanceService.validateFile(file);
      if (validation.valid) {
        this.selectedFile = file;
        this.showResult = false;
        this.importResult = null;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: validation.message
        });
        event.target.value = '';
      }
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No File Selected',
        detail: 'Please select a file to upload'
      });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.showResult = false;

    // Simulate progress
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.attendanceService.importAttendance(this.selectedFile).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;
        this.importResult = response;
        this.showResult = true;

        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Import Successful',
            detail: `Processed ${response.data?.processed_count} records successfully`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: response.message
          });
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'An error occurred while uploading the file'
        });
        
        console.error('Upload error:', error);
      }
    });
  }

  onDownloadTemplate(): void {
    this.attendanceService.downloadTemplate();
  }

  onClearFile(): void {
    this.selectedFile = null;
    this.showResult = false;
    this.importResult = null;
    this.uploadProgress = 0;
    
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
}
