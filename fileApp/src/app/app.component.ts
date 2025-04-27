import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpEventType } from '@angular/common/http';
import { UploadComponent } from './upload/upload.component';
import { FileUploadComponent } from './file-upload/file-upload.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    HttpClientModule, UploadComponent, FileUploadComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
    selectedFile: File | null = null;
  uploadProgress: number = 0;
  files: any[] = [];

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('/api/upload', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe(event => {
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
    this.http.get<any[]>('/api/files').subscribe(data => {
      this.files = data;
    });
  }

  downloadFile(fileName: string): void {
    this.http.get(`/api/files/${fileName}`, { responseType: 'blob' })
      .subscribe(blob => {
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

