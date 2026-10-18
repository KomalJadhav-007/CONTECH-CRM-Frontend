import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';
import { BuyerService } from '../../buyers/buyer.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-visit-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './visit-booking.component.html',
  styleUrl: './visit-booking.component.css'
})
export class VisitBookingComponent implements OnInit {
  private visitService = inject(VisitService);
  private buyerService = inject(BuyerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  buyers: any[] = [
    { id: 1, full_name: 'Sneha Kulkarni', phone: '+91 98765 43211', preferred_bhk: '3 BHK' },
    { id: 2, full_name: 'Anand Bhagat', phone: '+91 98765 43212', preferred_bhk: '4 BHK' },
    { id: 3, full_name: 'Deepa Sharma', phone: '+91 98765 43218', preferred_bhk: '3 BHK' },
    { id: 4, full_name: 'Rahul Deshmukh', phone: '+91 98765 43210', preferred_bhk: '3 BHK' },
    { id: 5, full_name: 'Neha Agarwal', phone: '+91 98765 43215', preferred_bhk: '4 BHK' },
    { id: 6, full_name: 'Harish Menon', phone: '+91 98765 43239', preferred_bhk: '4 BHK' }
  ];

  vehicles: any[] = [];
  selectedVehicleId: number | null = 1;

  bookingData: any = {
    buyer_id: 1,
    project_id: 1,
    sales_rep_id: 3,
    driver_id: 5,
    vehicle_id: 1,
    scheduled_date: new Date().toISOString().split('T')[0],
    time_slot: '11:00 AM - 12:30 PM (Peak Slot)',
    cab_required: true,
    cab_number: 'KA-01-MJ-8822',
    pickup_address: 'Customer Residence / Office',
    notes: 'Confirm buyer preferred floor plan copies ready in sales lounge.'
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadBuyers();
    this.loadVehicles();
  }

  loadBuyers(): void {
    this.buyerService.getBuyers().subscribe({
      next: (res) => {
        if (res.success && res.buyers && res.buyers.length > 0) {
          this.buyers = res.buyers;
        }
        const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
        if (qBuyerId) {
          this.bookingData.buyer_id = parseInt(qBuyerId, 10);
        } else if (this.buyers.length > 0) {
          this.bookingData.buyer_id = this.buyers[0].buyer_id || this.buyers[0].id;
        }
      },
      error: () => {
        const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
        if (qBuyerId) {
          this.bookingData.buyer_id = parseInt(qBuyerId, 10);
        }
      }
    });
  }

  loadVehicles(): void {
    this.visitService.getVehicles().subscribe({
      next: (res) => {
        if (res.success && res.vehicles && res.vehicles.length > 0) {
          this.vehicles = res.vehicles;
          if (!this.selectedVehicleId && this.vehicles.length > 0) {
            this.onVehicleSelect(this.vehicles[0].vehicle_id || this.vehicles[0].id);
          }
        }
      },
      error: () => {
        // Fallback default fleet
        this.vehicles = [
          { id: 1, vehicle_id: 1, registration_number: 'KA-01-MJ-8822', model: 'Innova Crysta Luxury', seating_capacity: 6, fuel_type: 'Diesel', assigned_driver_id: 5, assignedDriver: { name: 'Ramesh Gowda' } },
          { id: 2, vehicle_id: 2, registration_number: 'KA-03-EA-1090', model: 'Honda City ZX', seating_capacity: 4, fuel_type: 'Petrol', assigned_driver_id: null, assignedDriver: null }
        ];
      }
    });
  }

  onVehicleSelect(vId: any): void {
    this.selectedVehicleId = vId ? parseInt(vId, 10) : null;
    if (this.selectedVehicleId) {
      const found = this.vehicles.find(v => (v.vehicle_id || v.id) === this.selectedVehicleId);
      if (found) {
        this.bookingData.vehicle_id = found.vehicle_id || found.id;
        this.bookingData.cab_number = found.registration_number;
        if (found.assigned_driver_id) {
          this.bookingData.driver_id = found.assigned_driver_id;
        }
        this.bookingData.cab_required = true;
      }
    } else {
      this.bookingData.vehicle_id = null;
    }
  }


  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.visitService.bookSiteVisit(this.bookingData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/visits']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to book site visit. Capacity limit or conflict.';
      }
    });
  }
}
