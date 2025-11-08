// import { HttpInterceptorFn } from '@angular/common/http';

// export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
//   const token = localStorage.getItem('token');

//   if (token) {
//     req = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });
//   }

//   return next(req);
// };

// src/app/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Make sure this path is correct

@Injectable()
export class AuthInterceptor implements HttpInterceptor { // Ensure this class name matches your import

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken(); // Assume this method retrieves the current JWT from storage (e.g., localStorage)

    if (token) {
      // Add the token to the outgoing request
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` 
        }
      });
    }

    return next.handle(request);
  }
}
