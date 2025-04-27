// src/app/file-upload/file-upload.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { S3Service } from '../services/s3.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styles: [`
    .file-upload-container {
      margin: 20px;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      margin: 5px;
      padding: 5px 10px;
    }
  `]
})
export class FileUploadComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  files: any[] = [];

  constructor(@Inject('S3Service') private s3Service: S3Service) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.s3Service.uploadFile(this.selectedFile).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        alert('Upload successful from file-upload component');
        this.loadFiles();
      }
    }, error => {
      console.error('Upload failed', error);
    });
  }

  loadFiles(): void {
    this.s3Service.listFiles().subscribe(data => {
      this.files = data;
    });
  }

  downloadFile(fileName: string): void {
    this.s3Service.downloadFile(fileName).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    });
  }
}