import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators, FormsModule } from '@angular/forms';

import { TripService } from '../../services/trip.service';
import { VehicleService } from '../../services/vehicle.service';
import { DriverService } from '../../services/driver.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css']
})
export class TripsComponent implements OnInit {
  trips: any[] = [];
  drivers: any[] = [];
  vehicles: any[] = [];
  form: FormGroup;
  error = '';
  success = '';
  currentUser: any;

  // State for editing functionality
  isEditing = false;
  currentTripId: number | null = null;
  isCompleteChecked: boolean = false; // State for Dispatcher's completion checkbox

  constructor(
    private ts: TripService,
    private vs: VehicleService,
    private ds: DriverService,
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      driverId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      source: ['', [Validators.required, Validators.maxLength(100)]], 
      destination: ['', [Validators.required, Validators.maxLength(100)]], 
      startTime: ['', Validators.required], 
      endTime: [''], 
      remarks: ['', Validators.maxLength(500)] 
    });
    this.currentUser = this.auth.getUserMeta();
  }

  ngOnInit() {
    this.loadLists();
    this.loadTrips();
  }

  loadLists() {
    this.ds.getDrivers().subscribe({ next: (r:any)=> this.drivers = r, error: ()=> this.drivers = [] });
    this.vs.getVehicles().subscribe({ next: (r:any)=> this.vehicles = r, error: ()=> this.vehicles = [] });
  }

  loadTrips() {
    if (this.currentUser?.role === 'Dispatcher') {
      this.ts.getAllTrips().subscribe({ next: (r:any)=> this.trips = r, error: ()=> this.trips = [] });
    } else {
      this.ts.getMyTrips().subscribe({ next: (r:any)=> this.trips = r, error: ()=> this.trips = [] });
    }
  }

  submitForm() {
    this.error = this.success = '';
    if (this.form.invalid) {
      this.error = 'Please fill out all required fields correctly.';
      return;
    }
    
    if (this.isEditing && this.currentTripId) {
      this.update();
    } else {
      this.create();
    }
  }

  create() {
    const payload = { ...this.form.value, status: 'Planned' };
    this.ts.createTrip(payload).subscribe({
      next: ()=> { this.success = 'Trip created successfully'; this.loadTrips(); this.resetForm(); },
      error: (e: any)=> this.error = e?.error?.title || e?.error || 'Create trip failed'
    });
  }

  update() {
    let statusToUpdate = this.form.value.status;
    let endTimeValue = this.form.value.endTime;
    
    // 1. Dispatcher explicitly sets to Completed
    if (this.isCompleteChecked) {
        statusToUpdate = 'Completed';
        endTimeValue = endTimeValue || new Date().toISOString(); 
    } 
    // 2. Dispatcher reverts from Completed or status is InProgress
    else if (statusToUpdate === 'Completed' || statusToUpdate === 'InProgress') {
        // If unchecked OR if the status is InProgress, EndTime must be null
        statusToUpdate = 'InProgress';
        endTimeValue = null;
    } 
    // 3. Status remains Planned/Cancelled
    else {
        statusToUpdate = statusToUpdate || 'Planned';
    }

    const payload = { 
        tripId: this.currentTripId, 
        ...this.form.value,
        status: statusToUpdate, 
        endTime: endTimeValue 
    };

    delete payload.status; // Remove the temporary status control value from the payload

    this.ts.editTrip(this.currentTripId!, payload).subscribe({
      next: ()=> { this.success = 'Trip updated successfully'; this.loadTrips(); this.resetForm(); },
      error: (e: any)=> this.error = e?.error?.title || e?.error || 'Update trip failed'
    });
  }


  edit(trip: any) {
    this.isEditing = true;
    this.currentTripId = trip.tripId;
    this.success = ''; 
    this.error = '';

    this.isCompleteChecked = trip.status === 'Completed';

    const formattedStartTime = new Date(trip.startTime).toISOString().slice(0, 16);
    const formattedEndTime = trip.endTime ? new Date(trip.endTime).toISOString().slice(0, 16) : '';
    
    this.form.patchValue({
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      source: trip.source,
      destination: trip.destination,
      startTime: formattedStartTime,
      endTime: formattedEndTime, 
      remarks: trip.remarks
    });
    // Add the current status to the form value temporarily to help update() logic
    this.form.patchValue({ status: trip.status }); 
  }

  // NOTE: Argument type MUST be Event to match ($event) passed from HTML
  onCompleteCheck(event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    
    this.isCompleteChecked = checked;
    if (!checked) {
        this.form.get('endTime')?.setValue('');
    } else {
        if (!this.form.get('endTime')?.value) {
            this.form.get('endTime')?.setValue(new Date().toISOString().slice(0, 16));
        }
    }
  }
  
  resetForm() {
    this.form.reset();
    this.isEditing = false;
    this.currentTripId = null;
    this.isCompleteChecked = false;
    this.form.get('driverId')?.setValue('');
    this.form.get('vehicleId')?.setValue('');
  }

  start(tripId: number) {
    this.ts.updateStatus(tripId, 'InProgress').subscribe({
      next: ()=> { this.success = 'Trip started (Status: InProgress)'; this.loadTrips(); },
      error: (e: any)=> this.error = e?.error || 'Start failed'
    });
  }

  complete(tripId: number) {
    this.ts.updateStatus(tripId, 'Completed').subscribe({
      next: ()=> { this.success = 'Trip completed'; this.loadTrips(); },
      error: (e: any)=> this.error = e?.error || 'Complete failed'
    });
  }
}