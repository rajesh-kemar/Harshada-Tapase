import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class VehicleService {
  private apiUrl = 'api/Vehicle';
  constructor(private http: HttpClient) {}

  getVehicles() {
    return this.http.get(`${environment.apiUrl}/vehicle`);
  }

  createVehicle(payload: any) {
    return this.http.post(`${environment.apiUrl}/vehicle`, payload);
  }

   updateVehicle(vehicleId: number, vehicleData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/vehicle/${vehicleId}`, vehicleData);
  }

  deleteVehicle(id: number) {
    return this.http.delete(`${environment.apiUrl}/vehicle/${id}`);
  }
}
