import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';

import { 
  ListObjectsV2Command, 
  GetObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3File {
  key: string;
  lastModified: Date;
  size: number;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class S3UploadService {
  private s3Client: S3Client;
  
  constructor() {
    // Initialize the S3 client
    this.s3Client = new S3Client({
      region: environment.aws.region,
      credentials: {
        accessKeyId: environment.aws.accessKeyId,
        secretAccessKey: environment.aws.secretAccessKey
      }
    });
  }
  
  uploadFile(file: File): Observable<number> {
    const progress$ = new Subject<number>();
    
    // Generate a unique file name to prevent overwriting existing files
    const fileName = `${uuidv4()}-${file.name}`;
    
    // Convert the file to ArrayBuffer
    const reader = new FileReader();
    
    reader.onload = async (event: any) => {
      try {
        // Create the upload parameters with binary data
        const params = {
          Bucket: environment.aws.bucketName,
          Key: fileName,
          Body: event.target.result, // ArrayBuffer from FileReader
          ContentType: file.type
        };
        
        // Simulate initial progress
        progress$.next(50);
        
        // Upload the file
        const command = new PutObjectCommand(params);
        await this.s3Client.send(command);
        
        // Upload complete
        progress$.next(100);
        progress$.complete();
      } catch (error) {
        console.error('S3 upload error:', error);
        progress$.error(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      progress$.error(error);
    };
    
    // Simulate initial progress
    progress$.next(10);
    
    // Start reading the file as ArrayBuffer
    reader.readAsArrayBuffer(file);
    
    return progress$.asObservable();
  }

  // List files in the S3 bucket
  listFiles(): Observable<S3File[]> {
    const command = new ListObjectsV2Command({
      Bucket: environment.aws.bucketName
    });

    return from(
      this.s3Client.send(command)
        .then(response => {
          if (!response.Contents) {
            return [];
          }
          
          return response.Contents.map(item => {
            // Extract original filename from the UUID-prefixed name
            const fullKey = item.Key || '';
            const fileName = fullKey.includes('-') ? 
              fullKey.substring(fullKey.indexOf('-') + 1) : 
              fullKey;
            
            return {
              key: item.Key || '',
              lastModified: item.LastModified || new Date(),
              size: item.Size || 0,
              fileName: fileName
            };
          });
        })
    );
  }

  // Generate a pre-signed URL for downloading a file
  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: environment.aws.bucketName,
      Key: key
    });

    // URL expires in 15 minutes (900 seconds)
    return getSignedUrl(this.s3Client, command, { expiresIn: 900 });
  }

  // Download a file directly
  async downloadFile(key: string, fileName: string): Promise<void> {
    try {
      const url = await this.getDownloadUrl(key);
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || key;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // Delete a file from S3
  deleteFile(key: string): Observable<boolean> {
    const command = new DeleteObjectCommand({
      Bucket: environment.aws.bucketName,
      Key: key
    });

    return from(
      this.s3Client.send(command)
        .then(() => true)
        .catch(error => {
          console.error('Error deleting file:', error);
          throw error;
        })
    );
  }
}