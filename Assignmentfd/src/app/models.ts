export interface Trip {
  tripId: number;
  destination: string;
  driverId: number;
  vehicleId: number;
  status: string;
  startTime: string;
  endTime: string;
}
export type TripCreate = Omit<Trip, 'tripId'>;


export interface Driver {
  driverId: number;
  name: string;
  isAvailable: boolean;
}
export type DriverCreate = Omit<Driver, 'driverId'>;

export interface Vehicle {
  vehicleId: number;
  model: string;
  licensePlate: string;
  isAvailable: boolean;
}
export type VehicleCreate = Omit<Vehicle, 'vehicleId'>;

