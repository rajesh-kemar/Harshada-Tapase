import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DriverCreate } from '../../models';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})

export class DriversComponent implements OnInit {
  drivers: any[] = [];
  form: FormGroup;
  error = '';
  success = '';

currentUserRole: string | undefined;

  constructor(private ds: DriverService, private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      userId: ['', Validators.required],
      driverName: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      licenceNumber: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(15)]]
    });
  }

  ngOnInit() {
    this.currentUserRole = this.auth.getUserMeta()?.role; // Get the user's role
    this.load();
  }

  
  load() {
    this.drivers = []; 

    if (this.currentUserRole === 'Dispatcher') {
      this.ds.getDrivers().subscribe({
        next: (res: any) => this.drivers = res,
        error: (err) => console.error(err)
      });
    } else if (this.currentUserRole === 'Driver') {
      this.ds.getMyDriver().subscribe({
        next: (res: any) => {
          if (res) this.drivers = [res]; 
        },
        error: (err) => console.error(err)
      });
    }
  }
  
  

  create() {
    if (this.currentUserRole !== 'Dispatcher') return;
    this.error = this.success = '';
    if (this.form.invalid) return;
    const payload: DriverCreate = this.form.value;
    this.ds.createDriver(payload).subscribe({
      next: () => { this.success = 'Driver created'; this.load(); this.form.reset(); },
      error: (e) => this.error = e?.error || 'Create driver failed'
    });
  }

  delete(id: number) {
     if (this.currentUserRole !== 'Dispatcher') return;
    if (!confirm('Delete driver?')) return;
    this.ds.deleteDriver(id).subscribe({
      next: () => this.load(),
      error: (e) => this.error = e?.error || 'Delete failed'
    });
  }
}