import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(payload: any) {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  login(username: string, password: string) {
    return this.http.post(`${environment.apiUrl}/auth/login`, { username, password });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveUserMeta(meta: any) {
    localStorage.setItem('userMeta', JSON.stringify(meta));
  }

  getUserMeta() {
    const s = localStorage.getItem('userMeta');
    return s ? JSON.parse(s) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userMeta');
  }
}
