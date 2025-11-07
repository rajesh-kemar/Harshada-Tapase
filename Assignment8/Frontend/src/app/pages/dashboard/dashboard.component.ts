import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
import { TripService } from '../../services/trip.service';
import { combineLatest, Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // Import AuthService

Chart.register(...registerables);

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
  currentUsername: string | undefined; // Property to hold the username

  stats = [
    { title: 'Active Trips', value: 0 },
    { title: 'Completed Trips', value: 0 },
    { title: 'Total Trips', value: 0 },
    { title: 'Long Trips (>8 hours)', value: 0 }
  ];

  public tripChartType: ChartType = 'doughnut';

  public tripChartData: ChartData<'doughnut', number[], string> = {
    labels: ['Active', 'Completed'],
    datasets: [
      {
        data: [0, 0],
        borderWidth: 1,
        hoverOffset: 10,
      }
    ]
  };

  // Inject AuthService in the constructor
  constructor(private tripService: TripService, private auth: AuthService) {} 

  ngOnInit(): void {
    const userMeta = this.auth.getUserMeta();
    this.currentUserRole = userMeta?.role;
    this.currentUsername = userMeta?.username; // Get the username from meta (assuming auth service provides it)

    if (this.currentUserRole === 'Dispatcher') {
      this.loadDispatcherDashboard();
    } else if (this.currentUserRole === 'Driver') {
      this.loadDriverDashboard();
    } else {
        // Handle unauthenticated state or error
        this.loading = false;
    }
  }

  loadDispatcherDashboard(): void {
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

  loadDriverDashboard(): void {
    // Implement logic to fetch only driver-specific data
    this.tripService.getMyTrips().subscribe(myTrips => {
        // Customize stats for the driver's view
        this.stats = [
            { title: 'My Active Trips', value: myTrips.filter(t => t.status === 'Ongoing' || t.status === 'Planned' || t.status === 'Pending').length },
            { title: 'My Completed Trips', value: myTrips.filter(t => t.status === 'Completed').length },
            { title: 'My Total Trips', value: myTrips.length },
        ];
        
        // Update chart data for driver
        this.tripChartData.labels = ['Active/Planned', 'Completed'];
        this.tripChartData.datasets[0].data = [
            this.stats[0].value,
            this.stats[1].value
        ];

        this.loading = false;
        if (this.chart) this.chart.update();
    }, error => {
        console.error('Failed to load driver dashboard data', error);
        this.loading = false;
    });
  }
}
