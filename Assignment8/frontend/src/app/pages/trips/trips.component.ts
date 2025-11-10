
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

  isEditing = false;
  currentTripId: number | null = null;
  isCompleteChecked: boolean = false;

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
      remarks: ['', Validators.maxLength(500)],
      status: ['Planned']  // used internally for update logic
    });

    this.currentUser = this.auth.getUserMeta();
  }

  ngOnInit() {
    this.loadLists();
    this.loadTrips();
  }

  // LOAD Drivers + Vehicles
  loadLists() {
    this.ds.getDrivers().subscribe({
      next: (r: any) => (this.drivers = r || []),
      error: () => (this.drivers = [])
    });

    this.vs.getVehicles().subscribe({
      next: (r: any) => (this.vehicles = r || []),
      error: () => (this.vehicles = [])
    });
  }

  // LOAD Trips by role
  loadTrips() {
    if (this.currentUser?.role === 'Dispatcher') {
      this.ts.getAllTrips().subscribe({
        next: (r: any) => (this.trips = r || []),
        error: () => (this.trips = [])
      });
    } else {
      this.ts.getMyTrips().subscribe({
        next: (r: any) => (this.trips = r || []),
        error: () => (this.trips = [])
      });
    }
  }

  // CREATE OR UPDATE trigger
  submitForm() {
    this.error = this.success = '';

    if (this.form.invalid) {
      this.error = 'Please fill out required fields.';
      return;
    }

    this.isEditing && this.currentTripId
      ? this.updateTrip()
      : this.createTrip();
  }

  // ✅ CREATE TRIP
  createTrip() {
    const payload = {
      driverId: Number(this.form.value.driverId),
      vehicleId: Number(this.form.value.vehicleId),
      source: this.form.value.source,
      destination: this.form.value.destination,
      startTime: new Date(this.form.value.startTime).toISOString(),
      endTime: null,
      remarks: this.form.value.remarks,
      status: "Planned"
    };

    this.ts.createTrip(payload).subscribe({
      next: () => {
        this.success = 'Trip created successfully!';
        this.resetForm();
        this.loadTrips();
      },
      error: (e) => this.error = e?.error?.title || 'Failed to create trip'
    });
  }

  // ✅ UPDATE TRIP
  updateTrip() {
    if (!this.currentTripId) return;

    let status = this.form.value.status || "Planned";
    let endTimeValue = this.form.value.endTime || null;

    if (this.isCompleteChecked) {
      status = "Completed";
      if (!endTimeValue) endTimeValue = new Date().toISOString();
    }

    const payload = {
      tripId: this.currentTripId,
      driverId: Number(this.form.value.driverId),
      vehicleId: Number(this.form.value.vehicleId),
      source: this.form.value.source,
      destination: this.form.value.destination,
      startTime: new Date(this.form.value.startTime).toISOString(),
      endTime: endTimeValue ? new Date(endTimeValue).toISOString() : null,
      remarks: this.form.value.remarks,
      status
    };

    this.ts.editTrip(this.currentTripId, payload).subscribe({
      next: () => {
        this.success = 'Trip updated successfully!';
        this.resetForm();
        this.loadTrips();
      },
      error: (e) => this.error = e?.error?.title || 'Failed to update trip'
    });
  }

  // ✅ PATCH FORM VALUES into Edit Form
  edit(trip: any) {
    this.isEditing = true;
    this.currentTripId = trip.tripId;
    this.isCompleteChecked = trip.status === "Completed";

    this.form.patchValue({
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      source: trip.source,
      destination: trip.destination,
      startTime: trip.startTime ? new Date(trip.startTime).toISOString().slice(0, 16) : "",
      endTime: trip.endTime ? new Date(trip.endTime).toISOString().slice(0, 16) : "",
      remarks: trip.remarks,
      status: trip.status
    });
  }

  // ✅ START TRIP (Driver)
  start(tripId: number) {
    this.ts.updateStatus(tripId, "Active").subscribe({
      next: () => {
        this.success = "Trip started (Active)";
        this.loadTrips();
      },
      error: (e) => this.error = e?.error || "Failed to start trip"
    });
  }

  // ✅ COMPLETE TRIP (Driver)
  complete(tripId: number) {
    this.ts.updateStatus(tripId, "Completed").subscribe({
      next: () => {
        this.success = "Trip marked as Completed";
        this.loadTrips();
      },
      error: (e) => this.error = e?.error || "Failed to complete trip"
    });
  }

  // ✅ DELETE TRIP
  deleteTrip(tripId: number) {
    if (!confirm(`Delete Trip #${tripId}?`)) return;

    this.ts.deleteTrip(tripId).subscribe({
      next: () => {
        this.success = "Trip deleted successfully.";
        this.loadTrips();
      },
      error: (e) => this.error = e?.error || "Failed to delete trip"
    });
  }

  // ✅ Complete checkbox toggle
  onCompleteCheck(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isCompleteChecked = checked;

    if (checked) {
      if (!this.form.value.endTime) {
        this.form.get("endTime")?.setValue(new Date().toISOString().slice(0, 16));
      }
      this.form.get("status")?.setValue("Completed");
    } else {
      this.form.get("endTime")?.setValue("");
      this.form.get("status")?.setValue("Active");
    }
  }

  // RESET FORM
  resetForm() {
    this.form.reset({
      status: "Planned",
      driverId: "",
      vehicleId: ""
    });

    this.isEditing = false;
    this.currentTripId = null;
    this.isCompleteChecked = false;
  }
}




