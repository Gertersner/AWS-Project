// src/app/app.component.ts
import { Component, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpEventType } from '@angular/common/http';
import { UploadComponent } from './upload/upload.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { S3Service } from './services/s3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HttpClientModule, 
    UploadComponent, 
    FileUploadComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  files: any[] = [];

  constructor(@Inject('S3Service') private s3Service: S3Service) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.s3Service.uploadFile(this.selectedFile).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      } else if (event.type === HttpEventType.Response) {
        alert('Upload successful');
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

  ngOnInit(): void {
    this.loadFiles();
  }
}