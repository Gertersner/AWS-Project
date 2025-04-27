// src/app/services/s3.service.ts
import { Observable } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

export interface S3Service {
  uploadFile(file: File): Observable<HttpEvent<any>>;
  listFiles(): Observable<any[]>;
  downloadFile(fileName: string): Observable<Blob>;
}