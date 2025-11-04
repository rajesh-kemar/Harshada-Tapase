import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, TripCreate } from '../models'; // or adjust the path if needed

@Injectable({ providedIn: 'root' })
export class TripService {
  private baseUrl = 'http://localhost:5204/api/trips';

  constructor(private http: HttpClient) {}

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  createTrip(trip: TripCreate): Observable<any> {
    return this.http.post(this.baseUrl, trip);
  }

  
  updateTrip(tripId: number, tripPayload: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/${tripId}`, tripPayload);
}


  deleteTrip(tripId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${tripId}`);
  }

  getActiveTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/active`);
  }

  getCompletedTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/completed`);
  }

  getLongTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/long`);
  }
}
