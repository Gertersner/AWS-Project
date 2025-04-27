// src/app/services/mock-s3.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { S3Service } from './s3.service';

@Injectable({
  providedIn: 'root'
})
export class MockS3Service implements S3Service {
  // In-memory storage for files
  private files: Map<string, Blob> = new Map();

  constructor() {
    // Pre-populate with some test files
    this.files.set('test-file-1.csv', new Blob(['id,name,value\n1,test1,100\n2,test2,200'], { type: 'text/csv' }));
    this.files.set('test-file-2.csv', new Blob(['id,name,value\n3,test3,300\n4,test4,400'], { type: 'text/csv' }));
  }

  uploadFile(file: File): Observable<HttpEvent<any>> {
    // Store the file in our map
    this.files.set(file.name, file);
    
    // Simulate upload progress and completion
    return new Observable(observer => {
      // Simulate 50% progress
      setTimeout(() => {
        observer.next({
          type: HttpEventType.UploadProgress,
          loaded: 50,
          total: 100
        } as HttpEvent<any>);
      }, 500);
      
      // Simulate 100% progress and completion
      setTimeout(() => {
        observer.next({
          type: HttpEventType.UploadProgress,
          loaded: 100,
          total: 100
        } as HttpEvent<any>);
        
        observer.next(new HttpResponse({ status: 200, body: { message: 'Upload successful' } }));
        observer.complete();
      }, 1000);
    });
  }

  listFiles(): Observable<any[]> {
    const fileList = Array.from(this.files.keys()).map(filename => ({
      name: filename,
      size: this.files.get(filename)?.size || 0,
      lastModified: new Date().toISOString()
    }));
    
    return of(fileList);
  }

  downloadFile(fileName: string): Observable<Blob> {
    const file = this.files.get(fileName);
    if (file) {
      return of(file);
    }
    return of(new Blob([])); // Return empty blob if file not found
  }
}