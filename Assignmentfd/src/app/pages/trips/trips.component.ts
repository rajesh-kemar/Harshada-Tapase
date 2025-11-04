import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Trip, TripCreate } from '../../models';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripComponent implements OnInit {
  trips: Trip[] = [];

  newTrip: Partial<Trip> = {
    destination: '',
    driverId: 0,
    vehicleId: 0,
    status: 'Pending',
    startTime: '',
    endTime: ''
  };

  selectedTrip: Trip | null = null;

  constructor(private tripService: TripService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripService.getTrips().subscribe({
      next: (data) => {
        this.trips = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading trips:', err);
      }
    });
  }

  addTrip(): void {
    if (
      !this.newTrip.destination ||
      !this.newTrip.driverId ||
      !this.newTrip.vehicleId ||
      !this.newTrip.startTime
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    const tripPayload: TripCreate = {
      destination: this.newTrip.destination!,
      driverId: this.newTrip.driverId!,
      vehicleId: this.newTrip.vehicleId!,
      status: this.newTrip.status || 'Pending',
      startTime: this.newTrip.startTime!,
      endTime: this.newTrip.endTime || this.newTrip.startTime
    };

    this.tripService.createTrip(tripPayload).subscribe({
      next: () => {
        this.loadTrips();
        this.newTrip = {
          destination: '',
          driverId: 0,
          vehicleId: 0,
          status: 'Pending',
          startTime: '',
          endTime: ''
        };
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding trip:', err);
      }
    });
  }

  editTrip(trip: Trip): void {
    this.selectedTrip = { ...trip };
  }

  
updateTrip(): void {
  if (!this.selectedTrip) return;

 
  const payload = {
    tripId: this.selectedTrip.tripId,        
    destination: this.selectedTrip.destination,
    driverId: this.selectedTrip.driverId,
    vehicleId: this.selectedTrip.vehicleId,
    status: this.selectedTrip.status,
    startTime: this.selectedTrip.startTime,
    endTime: this.selectedTrip.endTime
  };

  this.tripService.updateTrip(this.selectedTrip.tripId, payload).subscribe({
    next: () => {
      this.selectedTrip = null;
      this.loadTrips();
    },
    error: (err) => {
      console.error('Error updating trip:', err);
      alert('Update failed — see console for details.');
    }
  });
}


  deleteTrip(id: number): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => this.loadTrips(),
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting trip:', err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.selectedTrip = null;
  }
}
