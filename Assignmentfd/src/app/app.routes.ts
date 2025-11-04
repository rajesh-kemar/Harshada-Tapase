import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DriverComponent } from './pages/drivers/drivers.component';
import { VehicleComponent } from './pages/vehicles/vehicles.component';
import { TripComponent } from './pages/trips/trips.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'drivers', component: DriverComponent },
  { path: 'vehicles', component: VehicleComponent },
  { path: 'trips', component: TripComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
