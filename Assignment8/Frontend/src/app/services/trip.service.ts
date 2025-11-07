// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../app.config';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TripService {
  constructor(private http: HttpClient) {}

  createTrip(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/trip`, payload);
  }

  // NEW: Method for Dispatcher to edit a trip
  editTrip(tripId: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/trip/${tripId}`, payload);
  }

  getAllTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/trip`);
  }

  getMyTrips(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/trip/my-trips`);
  }

  updateStatus(tripId: number, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/trip/update-status/${tripId}`, status, {
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
}