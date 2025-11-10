// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DriverSummary } from '../models';


@Injectable({ providedIn: 'root' })
export class TripService {
  private apiUrl = `${environment.apiUrl}/trip`; 

  constructor(private http: HttpClient) {}

  // ✅ Create Trip (POST /api/trip)
  createTrip(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  // ✅ Dispatcher: Edit a trip (PUT /api/trip/{tripId}) - Sends full Trip model
  editTrip(tripId: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${tripId}`, payload);
  }
  
  // ✅ Dispatcher: Delete a trip (DELETE /api/trip/{tripId})
  deleteTrip(tripId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${tripId}`);
  }

  getAllTrips(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMyTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-trips`);
  }

  // Driver: Update Status (PUT /api/trip/update-status/{tripId})
  updateStatus(tripId: number, status: string): Observable<any> {
    // Send the status string in the request body with application/json header
    return this.http.put(`${this.apiUrl}/update-status/${tripId}`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  

  getActiveTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/trip/active`);
  }

  getCompletedTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/trip/completed`);
  }

  getLongTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/trip/long-trips`);
  }
  getDriverSummary(driverId: number): Observable<DriverSummary> {
    return this.http.get<DriverSummary>(`${this.apiUrl}/driver-summary/${driverId}`);
  }
}