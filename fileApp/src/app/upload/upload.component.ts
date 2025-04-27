import { Component } from '@angular/core';
import { S3UploadService } from '../services/s3-upload.service';
@Component({
  selector: 'app-upload',
  imports: [],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  file: File | null = null;
  uploadSuccess = false;

  constructor(private s3Service: S3UploadService) {}

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  onUpload(): void {
    if (this.file) {
      this.s3Service.uploadFile(this.file).subscribe({
        next: () => this.uploadSuccess = true,
        error: err => console.error('Upload failed:', err)
      });
    }
  }
  
}
