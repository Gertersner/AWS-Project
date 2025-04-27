import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { MockS3Service } from './app/services/mock-s3.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    // Globally provide the mock service
    { provide: 'S3Service', useClass: MockS3Service }
  ]
})
.catch(err => console.error(err));