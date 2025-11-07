import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private http: HttpClient) {}

  getVehicles() {
    return this.http.get(`${environment.apiUrl}/vehicle`);
  }

  createVehicle(payload: any) {
    return this.http.post(`${environment.apiUrl}/vehicle`, payload);
  }

  deleteVehicle(id: number) {
    return this.http.delete(`${environment.apiUrl}/vehicle/${id}`);
  }
}
