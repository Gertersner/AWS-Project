// // interfaces/s3-service.interface.ts
// import { Observable } from 'rxjs';
// import { S3File } from '../services/mock-s3.service';

// export interface IS3Service {
//   uploadFile(file: File): Observable<number>;
//   listFiles(): Observable<S3File[]>;
//   getDownloadUrl(key: string): Promise<string>;
//   downloadFile(key: string, fileName: string): Promise<void>;
//   deleteFile(key: string): Observable<boolean>;
// }