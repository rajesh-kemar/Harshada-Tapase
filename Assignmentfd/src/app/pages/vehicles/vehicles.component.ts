// import { Component, OnInit } from '@angular/core';
// import { Vehicle } from '../../models';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { VehicleService } from '../../services/vehicle.service';
// import { HttpErrorResponse } from '@angular/common/http';

// @Component({
//   selector: 'app-vehicle',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './vehicles.component.html',
//   styleUrls: ['./vehicles.component.css']
// })
// export class VehicleComponent implements OnInit {
//   newVehicle: Vehicle = { vehicleId: 0, model: '', licensePlate: '', isAvailable: true };
//   vehicles: Vehicle[] = [];
//   selectedVehicle: Vehicle | null = null;

//   constructor(private vehicleService: VehicleService) {}

//   ngOnInit(): void {
//     this.loadVehicles();
//   }

//   loadVehicles(): void {
//     this.vehicleService.getVehicles().subscribe((data) => {
//       this.vehicles = data;
//     });
//   }

//   addVehicle(): void {
//     const vehiclePayload = {
//       model: this.newVehicle.model,
//       licensePlate: this.newVehicle.licensePlate,
//       isAvailable: this.newVehicle.isAvailable
//     };

//     this.vehicleService.createVehicle(vehiclePayload).subscribe({
//       next: () => {
//         this.loadVehicles();
//         this.newVehicle = { vehicleId: 0, model: '', licensePlate: '', isAvailable: true };
//       },
//       error: (err: HttpErrorResponse) => {
//         console.error('Error adding vehicle:', err);
//       }
//     });
//   }

//   editVehicle(vehicle: Vehicle): void {
//     this.selectedVehicle = { ...vehicle };
//   }

//   updateVehicle(): void {
//     if (this.selectedVehicle) {
//       const updatePayload = {
//         model: this.selectedVehicle.model,
//         licensePlate: this.selectedVehicle.licensePlate,
//         isAvailable: this.selectedVehicle.isAvailable
//       };

//       this.vehicleService.updateVehicle(this.selectedVehicle.vehicleId, updatePayload).subscribe({
//         next: () => {
//           this.selectedVehicle = null;
//           this.loadVehicles();
//         },
//         error: (err: HttpErrorResponse) => {
//           console.error('Error updating vehicle:', err);
//         }
//       });
//     }
//   }

//   deleteVehicle(id: number): void {
//     this.vehicleService.deleteVehicle(id).subscribe({
//       next: () => this.loadVehicles(),
//       error: (err: HttpErrorResponse) => console.error('Error deleting vehicle:', err)
//     });
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Vehicle, VehicleCreate } from '../../models'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehicleComponent implements OnInit {
  vehicles: Vehicle[] = [];
  newVehicle: VehicleCreate = { model: '', licensePlate: '', isAvailable: true }; 
  selectedVehicle: Vehicle | null = null;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (data) => (this.vehicles = data),
      error: (err) => console.error('Error loading vehicles:', err)
    });
  }

  addVehicle(): void {
    if (!this.newVehicle.model || !this.newVehicle.licensePlate) {
      alert('Please fill in all fields.');
      return;
    }

    this.vehicleService.createVehicle(this.newVehicle).subscribe({
      next: () => {
        this.newVehicle = { model: '', licensePlate: '', isAvailable: true };
        this.loadVehicles();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error adding vehicle:', err);
      }
    });
  }

  editVehicle(vehicle: Vehicle): void {
    this.selectedVehicle = { ...vehicle }; // make a copy to edit
  }

  updateVehicle(): void {
    if (!this.selectedVehicle) return;

    this.vehicleService
      .updateVehicle(this.selectedVehicle.vehicleId, this.selectedVehicle)
      .subscribe({
        next: () => {
          this.selectedVehicle = null;
          this.loadVehicles();
          alert('Vehicle updated successfully!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error updating vehicle:', err);
          alert('Failed to update vehicle.');
        }
      });
  }

  deleteVehicle(vehicleId: number): void {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    this.vehicleService.deleteVehicle(vehicleId).subscribe({
      next: () => this.loadVehicles(),
      error: (err: HttpErrorResponse) =>
        console.error('Error deleting vehicle:', err)
    });
  }
}
