import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DriverTripService } from '../driver-trip.service';

@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './driver-trips.component.html',
  styleUrl: './driver-trips.component.css'
})
export class DriverTripsComponent implements OnInit {
  private tripService = inject(DriverTripService);

  loading = true;
  trips: any[] = [];
  updatingId: number | null = null;
  statusMessage = '';

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getMyTrips().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.trips = res.trips;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateStatus(trip: any, nextStatus: string): void {
    this.updatingId = trip.id;
    this.tripService.updateTripStatus(trip.id, nextStatus).subscribe({
      next: (res) => {
        this.updatingId = null;
        if (res.success) {
          trip.trip_status = nextStatus;
          this.statusMessage = `Journey status updated to: ${nextStatus}`;
          setTimeout(() => this.statusMessage = '', 3000);
        }
      },
      error: () => {
        this.updatingId = null;
      }
    });
  }
}
