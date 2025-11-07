// ✅ USER REGISTRATION MODEL
export interface User {
  userId: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string; // Dispatcher or Driver
}

export type UserCreate = Omit<User, 'userId'>;

// ✅ DRIVER MODEL
export interface Driver {
  driverId: number;
  userId: number;
  driverName: string;
  experience: number;
  licenceNumber: string; // Format MH12-ER-1234 (Length 15)
}

export type DriverCreate = Omit<Driver, 'driverId'>;

// ✅ VEHICLE MODEL
export interface Vehicle {
  vehicleId: number;
  vehicleName: string;
  vehicleType: string;
  vehicleNumber: string;
  capacity: number;
}

export type VehicleCreate = Omit<Vehicle, 'vehicleId'>;

// ✅ TRIP MODEL
export interface Trip {
  tripId: number;
  driverId: number;
  vehicleId: number;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string | null;
  status: string; // Planned | InProgress | Completed
}

export type TripCreate = Omit<Trip, 'tripId' | 'status' | 'endTime'>;
