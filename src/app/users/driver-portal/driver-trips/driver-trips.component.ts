import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DriverTripService } from '../driver-trip.service';

@Component({
  selector: 'app-driver-trips',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatProgressBarModule],
  templateUrl: './driver-trips.component.html',
  styleUrl: './driver-trips.component.css'
})

export class DriverTripsComponent implements OnInit {
  private tripService = inject(DriverTripService);

  loading = true;
  trips: any[] = [];
  filterStatus = '';
  updatingId: number | null = null;
  statusMessage = '';

  get filteredTrips(): any[] {
    if (!this.filterStatus) return this.trips;
    if (this.filterStatus === 'ACTIVE') {
      return this.trips.filter(t => t.trip_status !== 'COMPLETED');
    }
    if (this.filterStatus === 'COMPLETED') {
      return this.trips.filter(t => t.trip_status === 'COMPLETED' || t.trip_status === 'DROPPED_AT_SITE');
    }
    return this.trips;
  }

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

  getPassengerWhatsAppUrl(trip: any): string {
    const raw = String(trip.passenger_phone || '7058533669').replace(/\D/g, '');
    const clean = raw.length === 10 ? '91' + raw : raw;
    const msg = `Hello ${trip.passenger_name || 'Sir/Madam'}, this is your Contech CRM executive driver. I am assigned for your scheduled site visit pickup at ${trip.pickup_address || 'your location'}.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  }

  updateStatus(trip: any, nextStatus: string): void {
    const id = trip.id || trip.driver_trip_id;
    this.updatingId = id;
    this.tripService.updateTripStatus(id, nextStatus).subscribe({
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
