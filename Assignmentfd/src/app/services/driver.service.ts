import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver, DriverCreate} from '../models';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  private baseUrl = 'http://localhost:5204/api/drivers';

  constructor(private http: HttpClient) {}

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(this.baseUrl);
  }


  createDriver(driver: Partial<Driver>): Observable<Driver> {
    return this.http.post<Driver>(this.baseUrl, driver);
  }

  
  updateDriver(driverId: number, driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${this.baseUrl}/${driverId}`, driver);
  }

   updateDriverAvailability(driverId: number, isAvailable: boolean): Observable<any> {
     return this.http.patch(`${this.baseUrl}/${driverId}/availability`, { isAvailable });
  }
  
  deleteDriver(driverId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${driverId}`);
  }
   getAvailableDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.baseUrl}/available`);
  }
}
