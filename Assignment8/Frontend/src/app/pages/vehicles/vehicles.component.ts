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
  form: FormGroup;
  error = '';
  success = '';
  currentUserRole: string | undefined; // ✅ Add role property

  readonly VEHICLE_REGEXP = /^[A-Z]{2}\d{2}-[A-Z]{2}-\d{4}$/;

  constructor(private vs: VehicleService, private fb: FormBuilder, private auth: AuthService) { // ✅ Inject AuthService
    this.form = this.fb.group({
      vehicleName: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehicleNumber: ['', [
          Validators.required, 
          Validators.minLength(12), // Note: Your C# regex enforces 13 chars, this frontend validator should match that.
          Validators.maxLength(12), // Note: Your C# regex enforces 13 chars, this frontend validator should match that.
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
      error: (e: HttpErrorResponse)=> this.error = e?.error || 'Create failed' // ✅ Type the error
    });
  }

  delete(id:number) {
    if (this.currentUserRole !== 'Dispatcher') return; // ✅ Role check
    if(!confirm('Delete vehicle?')) return;
    this.vs.deleteVehicle(id).subscribe({ 
      next: ()=> this.load(), 
      error: (e: HttpErrorResponse)=> this.error = e?.error || 'Delete failed' // ✅ Type the error
    });
  }
}
