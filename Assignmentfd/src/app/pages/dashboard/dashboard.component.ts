import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType, Chart, registerables } from 'chart.js';
import { TripService } from '../../services/trip.service';
import { VehicleService } from '../../services/vehicle.service';
import { combineLatest } from 'rxjs';



Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  stats = [
    { title: 'Active Trips', value: 0 },
    { title: 'Completed Trips', value: 0 },
    { title: 'Vehicles Available', value: 0 },
    { title: 'Long Trips (>8 hrs)', value: 0 },
  ];

  public tripChartType: ChartType = 'doughnut';

  public tripChartData: ChartData<'doughnut', number[], string> = {
    labels: ['Active', 'Completed'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#3B82F6', '#10B981'],
        hoverBackgroundColor: ['#60A5FA', '#34D399'],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  constructor(
    private tripService: TripService,
    private vehicleService: VehicleService
  ) {}

  ngOnInit() {
    combineLatest([
      this.tripService.getActiveTrips(),
      this.tripService.getCompletedTrips()
    ]).subscribe(([activeTrips, completedTrips]) => {
      this.stats[0].value = activeTrips.length;
      this.stats[1].value = completedTrips.length;

      this.tripChartData.datasets[0].data = [activeTrips.length, completedTrips.length];

      if (this.chart) this.chart.update();
    });

    this.vehicleService.getVehicles().subscribe(vs => {
      this.stats[2].value = vs.filter(v => v.isAvailable).length;
    });

    this.tripService.getLongTrips().subscribe(l => {
      this.stats[3].value = l.length;
    });
  }
}
