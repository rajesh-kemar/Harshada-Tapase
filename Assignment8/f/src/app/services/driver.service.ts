import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Observable } from 'rxjs';
import { Driver ,DriverCreate, DriverUpdatePayload} from '../models';

@Injectable({ providedIn: 'root' })
export class DriverService {
    // private apiUrl = "http://localhost:5204/api/drivers";
private apiUrl = `${environment.apiUrl}/driver`;

  constructor(private http: HttpClient) {}

//   getDrivers() {
//     return this.http.get(`${environment.apiUrl}/driver`);
//   }

//   createDriver(payload: DriverCreate) {
//   return this.http.post(`${this.apiUrl}`, payload);
// }

//   deleteDriver(id: number) {
//     return this.http.delete(`${environment.apiUrl}/driver/${id}`);
//   }

//   getMyDriver(): Observable<any> {
//     return this.http.get<any>(`${environment.apiUrl}/driver/me`);
//   }
//     updateDriver(driverId: number, payload: DriverUpdatePayload) {
//   return this.http.put(`${this.apiUrl}/${driverId}`, payload);
// }
getDrivers() {
  return this.http.get(this.apiUrl);
}

createDriver(payload: DriverCreate) {
  return this.http.post(this.apiUrl, payload);
}

deleteDriver(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}

getMyDriver(): Observable<any> {
  return this.http.get(`${this.apiUrl}/me`);
}

updateDriver(driverId: number, payload: DriverUpdatePayload) {
  return this.http.put(`${this.apiUrl}/${driverId}`, payload);
}

}
