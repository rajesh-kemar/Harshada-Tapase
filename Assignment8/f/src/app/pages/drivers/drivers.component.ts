// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DriverService } from '../../services/driver.service';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';
// import { DriverCreate } from '../../models';
// import { Driver } from '../../models';

// @Component({
//   selector: 'app-drivers',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FormsModule],
//   templateUrl: './drivers.component.html',
//   styleUrls: ['./drivers.component.css']
// })

// export class DriversComponent implements OnInit {
//   drivers: any[] = [];
//   form: FormGroup;
//   error = '';
//   success = '';

// currentUserRole: string | undefined;

//   constructor(private ds: DriverService, private fb: FormBuilder, private auth: AuthService) {
//     this.form = this.fb.group({
//       userId: ['', Validators.required],
//       driverName: ['', Validators.required],
//       experience: [0, [Validators.required, Validators.min(0)]],
//       licenceNumber: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(15)]]
//     });
//   }
  

//   ngOnInit() {
//     this.currentUserRole = this.auth.getUserMeta()?.role; // Get the user's role
//     this.load();
//   }

  
//   load() {
//     this.drivers = []; 

//     if (this.currentUserRole === 'Dispatcher') {
//       this.ds.getDrivers().subscribe({
//         next: (res: any) => this.drivers = res,
//         error: (err) => console.error(err)
//       });
//     } else if (this.currentUserRole === 'Driver') {
//       this.ds.getMyDriver().subscribe({
//         next: (res: any) => {
//           if (res) this.drivers = [res]; 
//         },
//         error: (err) => console.error(err)
//       });
//     }
//   }
  
  

//   create() {
//     if (this.currentUserRole !== 'Dispatcher') return;
//     this.error = this.success = '';
//     if (this.form.invalid) return;
//     const payload: DriverCreate = this.form.value;
//     this.ds.createDriver(payload).subscribe({
//       next: () => { this.success = 'Driver created'; this.load(); this.form.reset(); },
//       error: (e) => this.error = e?.error || 'Create driver failed'
//     });
//   }

//   delete(id: number) {
//      if (this.currentUserRole !== 'Dispatcher') return;
//     if (!confirm('Delete driver?')) return;
//     this.ds.deleteDriver(id).subscribe({
//       next: () => this.load(),
//       error: (e) => this.error = e?.error || 'Delete failed'
//     });
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Driver, DriverCreate, DriverUpdatePayload } from '../../models';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class DriversComponent implements OnInit {

  drivers: Driver[] = [];
  form: FormGroup;
  editForm: FormGroup;

  isEditing = false;
  editingDriverId: number | null = null;
  currentUserRole: string | undefined;

  error = '';
  success = '';

  constructor(
    private ds: DriverService,
    private fb: FormBuilder,
    private auth: AuthService
  ) {

    // ✅ Create form (for Dispatcher to create new driver)
    this.form = this.fb.group({
      userId: ['', Validators.required],
      driverName: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      licenceNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]]
    });

    // ✅ Edit form (UserId is locked)
    this.editForm = this.fb.group({
      driverName: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      licenceNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]],
      userId: [{ value: null, disabled: true }]
    });
  }

  ngOnInit() {
    this.currentUserRole = this.auth.getUserMeta()?.role;
    this.load();
  }

  load() {
    this.drivers = [];

    if (this.currentUserRole === 'Dispatcher') {
      this.ds.getDrivers().subscribe({
        next: (res: any) => (this.drivers = res),
        error: (err) => console.error("🚨 Load Error:", err)
      });
    }

    if (this.currentUserRole === 'Driver') {
      this.ds.getMyDriver().subscribe({
        next: (res: any) => (this.drivers = [res]),
        error: (err) => console.error("🚨 Driver Profile Error:", err)
      });
    }
  }

  create() {
    if (this.form.invalid) return;

    const payload: DriverCreate = this.form.value;

    this.ds.createDriver(payload).subscribe({
      next: () => {
        this.success = "✅ Driver created successfully";
        this.form.reset();
        this.load();
      },
      error: (e) => this.error = e?.error || "Create failed"
    });
  }

  startEdit(driver: Driver) {
    this.isEditing = true;
    this.editingDriverId = driver.driverId;

    this.editForm.patchValue({
      driverName: driver.driverName,
      experience: driver.experience,
      licenceNumber: driver.licenceNumber,
      userId: driver.userId,
    });
  }

  saveEdit() {
    if (!this.editingDriverId || this.editForm.invalid) return;
const payload: any = {
  driverId: this.editingDriverId,   // ✅ REQUIRED for backend ID match
  driverName: this.editForm.get('driverName')?.value,
  experience: this.editForm.get('experience')?.value,
  licenceNumber: this.editForm.get('licenceNumber')?.value,
};

    this.ds.updateDriver(this.editingDriverId, payload).subscribe({
      next: () => {
        this.success = "✅ Driver updated successfully";
        this.isEditing = false;
        this.editForm.reset();
        this.editingDriverId = null;
        this.load();
      },
      error: (err) => {
        this.error = err?.error || "Update failed";
        console.error("🚨 Update Error:", err);
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.editingDriverId = null;
    this.editForm.reset();
  }

  delete(id: number) {
    if (this.currentUserRole !== "Dispatcher") return;

    if (confirm("Are you sure you want to delete this driver?")) {
      this.ds.deleteDriver(id).subscribe({
        next: () => this.load(),
        error: (e) => this.error = e?.error || "Delete failed"
      });
    }
  }
}
