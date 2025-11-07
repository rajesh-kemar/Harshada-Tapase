// import { ApplicationConfig } from '@angular/core';
// import { provideRouter, withComponentInputBinding } from '@angular/router';
// import { routes } from './app.routes';

// import { provideHttpClient, withInterceptors } from '@angular/common/http';
// import { jwtInterceptor } from './interceptors/jwt.interceptor';


// export const environment = {
//   apiUrl: 'http://localhost:5012/api'
// };

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideRouter(routes, withComponentInputBinding()),
//     provideHttpClient(
//       withInterceptors([
//         jwtInterceptor  // ✅ intercepts token automatically
//       ])
//     )
//   ]
// };


// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
// Import the correct name of your interceptor class (AuthInterceptor is likely the name)
import { AuthInterceptor } from './interceptors/jwt.interceptor'; 

export const environment = {
  apiUrl: 'http://localhost:5012/api'
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi()), // Required for class-based interceptors
    // Add the interceptor here
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
