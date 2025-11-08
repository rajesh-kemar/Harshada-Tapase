// import { Component, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatCardModule } from '@angular/material/card';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
// import { BaseChartDirective } from 'ng2-charts';
// import { ChartData, ChartType, Chart, registerables } from 'chart.js';
// import { TripService  } from '../../services/trip.service';
// import { combineLatest, Observable } from 'rxjs';
// import { AuthService } from '../../services/auth.service'; // Import AuthService

// Chart.register(...registerables);

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, BaseChartDirective],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css']
// })
// export class DashboardComponent implements OnInit {

//   @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

//   loading = true; 
//   currentUserRole: string | undefined;
//   currentUsername: string | undefined; // Property to hold the username

//   stats = [
//     { title: 'Active Trips', value: 0 },
//     { title: 'Completed Trips', value: 0 },
//     { title: 'Total Trips', value: 0 },
//     { title: 'Long Trips (>8 hours)', value: 0 }
//   ];

//   public tripChartType: ChartType = 'doughnut';

//   public tripChartData: ChartData<'doughnut', number[], string> = {
//     labels: ['Active', 'Completed'],
//     datasets: [
//       {
//         data: [0, 0],
//         borderWidth: 1,
//         hoverOffset: 10,
//       }
//     ]
//   };

//   // Inject AuthService in the constructor
//   constructor(private tripService: TripService, private auth: AuthService) {} 

//   ngOnInit(): void {
//     const userMeta = this.auth.getUserMeta();
//     this.currentUserRole = userMeta?.role;
//     this.currentUsername = userMeta?.username; // Get the username from meta (assuming auth service provides it)

//     if (this.currentUserRole === 'Dispatcher') {
//       this.loadDispatcherDashboard();
//     } else if (this.currentUserRole === 'Driver') {
//       this.loadDriverDashboard();
//     } else {
//         // Handle unauthenticated state or error
//         this.loading = false;
//     }
//   }

//   loadDispatcherDashboard(): void {
//     combineLatest([
//       this.tripService.getActiveTrips(),     
//       this.tripService.getCompletedTrips(),  
//       this.tripService.getLongTrips(),       
//       this.tripService.getAllTrips()         
//     ])
//     .subscribe(([activeTrips, completedTrips, longTrips, allTrips]) => {

//       this.stats[0].value = activeTrips.length;
//       this.stats[1].value = completedTrips.length;
//       this.stats[2].value = allTrips.length;
//       this.stats[3].value = longTrips.length;

//       this.tripChartData.datasets[0].data = [
//         activeTrips.length,
//         completedTrips.length
//       ];

//       this.loading = false;
//       if (this.chart) this.chart.update();
//     }, error => {
//         console.error('Failed to load dispatcher dashboard data', error);
//         this.loading = false;
//     });
//   }

//   loadDriverDashboard(): void {
//     // Implement logic to fetch only driver-specific data
//     this.tripService.getMyTrips().subscribe(myTrips => {
//         // Customize stats for the driver's view
//         this.stats = [
//             { title: 'My Active Trips', value: myTrips.filter(t => t.status === 'Ongoing' || t.status === 'Planned' || t.status === 'Pending').length },
//             { title: 'My Completed Trips', value: myTrips.filter(t => t.status === 'Completed').length },
//             { title: 'My Total Trips', value: myTrips.length },
//         ];
        
//         // Update chart data for driver
//         this.tripChartData.labels = ['Active/Planned', 'Completed'];
//         this.tripChartData.datasets[0].data = [
//             this.stats[0].value,
//             this.stats[1].value
//         ];

//         this.loading = false;
//         if (this.chart) this.chart.update();
//     }, error => {
//         console.error('Failed to load driver dashboard data', error);
//         this.loading = false;
//     });
//   }

// }



import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
// 💡 Import the DriverSummary interface alongside TripService
import { TripService } from '../../services/trip.service';
import { combineLatest } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DriverSummary } from '../../models';
Chart.register(...registerables);

// Define a simple structure for the stat cards
interface StatCard {
  title: string;
  value: number;
  color?: string; // Optional color for styling
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  loading = true; 
  currentUserRole: string | undefined;
  currentUsername: string | undefined;
  
  // 💡 New property to hold the Driver ID
  currentDriverId: number | undefined;

  // Initialize stats to an empty array or a minimal set
  stats: StatCard[] = [];

  // Default chart type, will be changed in loadDriverDashboard
  public tripChartType: ChartType = 'doughnut'; 

  public tripChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: [
      {
        data: [0],
        borderWidth: 1,
        hoverOffset: 10,
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#E91E63']
      }
    ]
  };

  constructor(private tripService: TripService, private auth: AuthService) {} 

  ngOnInit(): void {
    const userMeta = this.auth.getUserMeta();
    this.currentUserRole = userMeta?.role;
    this.currentUsername = userMeta?.username;
    
    // 💡 Fetch driverId from auth service meta (assuming it's available)
    this.currentDriverId = userMeta?.driverId; 

    if (this.currentUserRole === 'Dispatcher') {
      this.loadDispatcherDashboard();
    } else if (this.currentUserRole === 'Driver' && this.currentDriverId) {
      // 💡 Pass the driver ID to the new loading method
      this.loadDriverDashboard(this.currentDriverId);
    } else {
        // Handle unauthenticated state or error/missing ID
        this.loading = false;
        if (this.currentUserRole === 'Driver' && !this.currentDriverId) {
            console.error('Driver role detected but Driver ID is missing.');
        }
    }
  }

  loadDispatcherDashboard(): void {
    // Set initial stats array for Dispatcher
    this.stats = [
      { title: 'Active Trips', value: 0, color: 'blue' },
      { title: 'Completed Trips', value: 0, color: 'green' },
      { title: 'Total Trips', value: 0, color: 'purple' },
      { title: 'Long Trips (>8 hours)', value: 0, color: 'orange' }
    ];

    combineLatest([
      this.tripService.getActiveTrips(),     
      this.tripService.getCompletedTrips(),  
      this.tripService.getLongTrips(),       
      this.tripService.getAllTrips()         
    ])
    .subscribe(([activeTrips, completedTrips, longTrips, allTrips]) => {

      this.stats[0].value = activeTrips.length;
      this.stats[1].value = completedTrips.length;
      this.stats[2].value = allTrips.length;
      this.stats[3].value = longTrips.length;
      
      this.tripChartType = 'doughnut'; // Dispatcher uses doughnut

      this.tripChartData.labels = ['Active', 'Completed'];
      this.tripChartData.datasets[0].data = [
        activeTrips.length,
        completedTrips.length
      ];

      this.loading = false;
      if (this.chart) this.chart.update();
    }, error => {
      console.error('Failed to load dispatcher dashboard data', error);
      this.loading = false;
    });
  }

  // 💡 Updated to use the new efficient API endpoint
  loadDriverDashboard(driverId: number): void {
    this.tripService.getDriverSummary(driverId).subscribe((summary: DriverSummary) => {
        const completedTrips = summary.totalCompletedTrips;
        const totalHours = summary.totalHoursDriven;

        // 💡 Update stats array to only reflect the data available from the new API
        this.stats = [
            { title: 'Completed Trips', value: completedTrips, color: 'green' },
            { title: 'Total Hours Driven', value: totalHours, color: 'blue' },
            // Keeping two empty slots to maintain the 4-card grid layout aesthetic, 
            // but you might consider removing them if they look out of place.
            { title: 'Trips in Progress', value: 0, color: 'orange' }, 
            { title: 'Total Distance (km)', value: 0, color: 'purple' } 
        ];

        // 💡 Change chart type for better comparison of two distinct metrics
        this.tripChartType = 'bar'; 
        
        this.tripChartData.labels = ['Trips Completed', 'Hours Driven'];
        this.tripChartData.datasets = [{
          data: [completedTrips, totalHours],
          label: 'Summary Metrics',
           backgroundColor: ['#4CAF50', '#2196F3'],
           borderColor: ['#388E3C', '#1976D2'],
          borderWidth: 1,
          hoverOffset: 10,
        }];

        this.loading = false;
        if (this.chart) this.chart.update();
    }, error => {
        console.error('Failed to load driver dashboard data from summary API', error);
        this.loading = false;
    });
  }
}