
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {
  vehicles: any[] = [];
  form: FormGroup; // Form for CREATING new vehicles
  error = '';
  success = '';
  currentUserRole: string | undefined;

  // 🆕 NEW: State for editing
  editingVehicleId: number | null = null;
  editForm: FormGroup; // 🆕 NEW: Separate form for editing

  readonly VEHICLE_REGEXP = /^[A-Z]{2}\d{2}-[A-Z]{2}-\d{4}$/;

  constructor(private vs: VehicleService, private fb: FormBuilder, private auth: AuthService) { // ✅ Inject AuthService
    // Form for CREATING new vehicles
    this.form = this.fb.group({
      vehicleName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleNumber: ['', [
          Validators.required, 
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(this.VEHICLE_REGEXP)
      ]],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
    
    // 🆕 NEW: Initialize the EDIT form
    this.editForm = this.fb.group({
      vehicleId: [0, Validators.required], // Required to identify the vehicle being edited
      vehicleName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleNumber: ['', [
          Validators.required, 
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(this.VEHICLE_REGEXP)
      ]],
      capacity: [1, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }


  ngOnInit() { 
    this.currentUserRole = this.auth.getUserMeta()?.role; // ✅ Initialize role
    this.load(); 
  }

  load() {
    this.vs.getVehicles().subscribe({ 
      next: (r:any)=> this.vehicles = r, 
      error: (err: HttpErrorResponse)=> { // ✅ Type the error
        console.error(err);
        this.error = 'Failed to load vehicles.';
        this.vehicles = [];
      } 
    });
  }

  create() {
    if (this.currentUserRole !== 'Dispatcher') return; // ✅ Role check
    this.error = this.success = '';
    if (this.form.invalid) return;
    this.vs.createVehicle(this.form.value).subscribe({
      next: ()=> { this.success='Vehicle created'; this.load(); this.form.reset(); },
      error: (e: HttpErrorResponse)=> this.error = e?.error?.message || e?.error || 'Create failed' // ✅ Handle error messages
    });
  }

  delete(id:number) {
    if (this.currentUserRole !== 'Dispatcher') return; // ✅ Role check
    if(!confirm('Delete vehicle?')) return;
    this.error = this.success = '';
    this.vs.deleteVehicle(id).subscribe({ 
      next: ()=> {
        this.success = 'Vehicle deleted successfully';
        this.load();
      },
      error: (e: HttpErrorResponse)=> this.error = e?.error?.message || e?.error || 'Delete failed' // ✅ Handle error messages
    });
  }
  
  // 🆕 NEW: Start editing a vehicle
  startEdit(vehicle: any) {
    if (this.currentUserRole !== 'Dispatcher') return;
    this.error = this.success = ''; // Clear status messages
    this.editingVehicleId = vehicle.vehicleId;
    this.editForm.patchValue(vehicle); // Populate the edit form with current values
  }

  // 🆕 NEW: Cancel editing
  cancelEdit() {
    this.editingVehicleId = null;
    this.editForm.reset();
  }

  // 🆕 NEW: Save the edited vehicle
  saveEdit() {
    if (this.currentUserRole !== 'Dispatcher') return;
    this.error = this.success = '';
    if (this.editForm.invalid) return;

    const vehicleId = this.editForm.get('vehicleId')?.value;
    const updateData = this.editForm.value;
    
    

    this.vs.updateVehicle(vehicleId, updateData).subscribe({
      next: ()=> { 
        this.success = 'Vehicle updated successfully'; 
        this.load(); // Refresh the list
        this.cancelEdit(); // Close the edit row
      },
      error: (e: HttpErrorResponse)=> {
        this.error = e?.error?.message || e?.error || 'Update failed';
      }
    });
  }
}