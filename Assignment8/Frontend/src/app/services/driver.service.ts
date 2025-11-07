import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DriverService {
  constructor(private http: HttpClient) {}

  getDrivers() {
    return this.http.get(`${environment.apiUrl}/driver`);
  }

  createDriver(payload: any) {
    return this.http.post(`${environment.apiUrl}/driver`, payload);
  }

  deleteDriver(id: number) {
    return this.http.delete(`${environment.apiUrl}/driver/${id}`);
  }

  getMyDriver(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/driver/me`);
  }
}
