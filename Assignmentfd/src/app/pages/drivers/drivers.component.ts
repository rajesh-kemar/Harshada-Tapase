
import { Component, OnInit } from '@angular/core';
import { Driver , DriverCreate} from '../../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class DriverComponent implements OnInit {
  drivers: Driver[] = [];
  newDriver: Partial<Driver> = { name: '', isAvailable: true };
  selectedDriver: Driver | null = null;

  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe((data) => {
      this.drivers = data;
    });
  }

  addDriver(): void {
    const driverPayload = { name: this.newDriver.name, isAvailable: this.newDriver.isAvailable };
    this.driverService.createDriver(driverPayload as Driver).subscribe({
      next: () => {
        this.loadDrivers();
        this.newDriver = { name: '', isAvailable: true };
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding driver:', err);
        if (err.error) {
          console.error('Backend validation error:', err.error);
        }
      }
    });
  }

  editDriver(driver: Driver): void {
    this.selectedDriver = { ...driver };
  }

  updateDriver(): void {
    if (this.selectedDriver) {
      console.log("Attempting to update driver ID:", this.selectedDriver.driverId, "Availability:", this.selectedDriver.isAvailable);

     
      this.driverService
        .updateDriverAvailability(this.selectedDriver.driverId, this.selectedDriver.isAvailable)
        .subscribe({
          next: () => {
            console.log("Driver availability updated successfully.");
            this.loadDrivers();
            this.selectedDriver = null;
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error updating driver availability:', err);
            if (err.error) {
              console.error('Backend validation error details:', err.error);
            }
          }
        });
    } else {
      console.warn("No driver selected for update.");
    }
  }


  deleteDriver(driverId: number): void {
    this.driverService.deleteDriver(driverId).subscribe({
      next: () => {
        this.loadDrivers();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error deleting driver:', err);
        if (err.error) {
          console.error('Backend error:', err.error);
        }
      }
    });
  }
}

