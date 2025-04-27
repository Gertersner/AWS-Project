import { Component, OnInit } from '@angular/core';
import { S3UploadService, S3File } from '../services/s3-upload.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  files: S3File[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  constructor(private s3Service: S3UploadService) {
  }
  
  ngOnInit(): void {
    this.loadFiles();
  }
  
  loadFiles(): void {
    this.loading = true;
    this.error = null;
    
    this.s3Service.listFiles().subscribe({
      next: (files) => {
        this.files = files;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load files', err);
        this.error = 'Failed to load files from S3';
        this.loading = false;
      }
    });
  }
  
  async downloadFile(file: S3File): Promise<void> {
    try {
      await this.s3Service.downloadFile(file.key, file.fileName);
    } catch (error) {
      console.error('Download failed', error);
      // Show error message to user
      alert('Failed to download file');
    }
  }
  
  deleteFile(file: S3File): void {
    if (confirm(`Are you sure you want to delete ${file.fileName}?`)) {
      this.s3Service.deleteFile(file.key).subscribe({
        next: () => {
          // Remove file from the list
          this.files = this.files.filter(f => f.key !== file.key);
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert('Failed to delete file');
        }
      });
    }
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
