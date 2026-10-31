import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';
import { BuyerService } from '../../buyers/buyer.service';
import { UserService } from '../../../users/user.service';

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
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  buyers: any[] = [
    { id: 1, full_name: 'Sneha Kulkarni', phone: '7058533669', preferred_bhk: '3 BHK' },
    { id: 2, full_name: 'Anand Bhagat', phone: '7058533669', preferred_bhk: '4 BHK' },
    { id: 3, full_name: 'Deepa Sharma', phone: '7058533669', preferred_bhk: '3 BHK' },
    { id: 4, full_name: 'Rahul Deshmukh', phone: '7058533669', preferred_bhk: '3 BHK' },
    { id: 5, full_name: 'Neha Agarwal', phone: '7058533669', preferred_bhk: '4 BHK' },
    { id: 6, full_name: 'Harish Menon', phone: '7058533669', preferred_bhk: '4 BHK' }
  ];

  salesExecutives: any[] = [
    { id: 4, name: 'Amit Verma (Account Executive)' },
    { id: 2, name: 'Arun Bhatia (Sales Head / VP)' },
    { id: 3, name: 'Priya Nair (Sales Manager)' }
  ];

  drivers: any[] = [
    { id: 7, name: 'Ramesh Gowda (Company Driver)' },
    { id: 6, name: 'Suresh Kumar (Site Visit Coordinator)' }
  ];

  vehicles: any[] = [];
  selectedVehicleId: number | null = 1;

  bookingData: any = {
    buyer_id: 1,
    project_id: 1,
    sales_rep_id: 4,
    driver_id: 7,
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
    this.loadUsers();
    this.loadBuyers();
    this.loadVehicles();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.success && res.users) {
          const active = res.users.filter((u: any) => u.is_active !== false);
          const execs = active.filter((u: any) => {
            const r = (u.role?.name || u.role_name || u.role || '').toLowerCase();
            return !r.includes('driver');
          });
          const drvs = active.filter((u: any) => {
            const r = (u.role?.name || u.role_name || u.role || '').toLowerCase();
            return r.includes('driver');
          });
          if (execs.length > 0) this.salesExecutives = execs;
          if (drvs.length > 0) this.drivers = drvs;
        }
      }
    });
  }

  formatBhk(bhk: string): string {
    if (!bhk) return '3 BHK';
    return String(bhk).replace(/(\d+)\.5/g, '$1').trim();
  }

  loadBuyers(): void {
    this.buyerService.getBuyers().subscribe({
      next: (res) => {
        if (res.success && res.buyers && res.buyers.length > 0) {
          this.buyers = res.buyers.map((b: any) => ({
            ...b,
            preferred_bhk: this.formatBhk(b.preferred_bhk)
          }));
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
            this.selectedVehicleId = this.vehicles[0].vehicle_id || this.vehicles[0].id;
            this.bookingData.vehicle_id = this.selectedVehicleId;
            this.bookingData.cab_number = this.vehicles[0].registration_number;
          }
        }
      },
      error: () => {
        // Fallback default fleet
        this.vehicles = [
          { id: 1, vehicle_id: 1, registration_number: 'KA-01-MJ-8822', make_model: 'Toyota Innova Crysta Luxury', seating_capacity: 6, vehicle_type: 'SUV', fuel_type: 'Diesel' },
          { id: 2, vehicle_id: 2, registration_number: 'KA-05-NB-4411', make_model: 'Honda City ZX', seating_capacity: 4, vehicle_type: 'SEDAN', fuel_type: 'Petrol' },
          { id: 3, vehicle_id: 3, registration_number: 'KA-03-EX-9900', make_model: 'Mercedes-Benz E-Class VIP', seating_capacity: 4, vehicle_type: 'LUXURY', fuel_type: 'Diesel' }
        ];
      }
    });
  }

  onVehicleSelect(vId: any): void {
    if (vId === 'custom') {
      this.selectedVehicleId = 'custom' as any;
      this.bookingData.vehicle_id = null;
      this.bookingData.cab_number = '';
      return;
    }

    this.selectedVehicleId = vId ? parseInt(vId, 10) : null;
    if (this.selectedVehicleId) {
      const found = this.vehicles.find(v => (v.vehicle_id || v.id) === this.selectedVehicleId);
      if (found) {
        this.bookingData.vehicle_id = found.vehicle_id || found.id;
        this.bookingData.cab_number = found.registration_number;
        // Keep currently assigned driver! Do NOT overwrite or clear the driver:
        // Only if no driver has been selected yet, assign default driver if available:
        if (!this.bookingData.driver_id && found.assigned_driver_id) {
          this.bookingData.driver_id = found.assigned_driver_id;
        }
        this.bookingData.cab_required = true;
      }
    } else {
      this.bookingData.vehicle_id = null;
    }
  }

  onDriverSelect(driverId: any): void {
    this.bookingData.driver_id = driverId ? parseInt(driverId, 10) : null;
    if (this.bookingData.driver_id) {
      const selectedDriver = this.drivers.find(d => (d.user_id || d.id) === this.bookingData.driver_id);
      // If driver has a default vehicle in profile and no cab number is set yet:
      if (!this.bookingData.cab_number && selectedDriver?.vehicle_number) {
        this.bookingData.cab_number = selectedDriver.vehicle_number;
        const matchingVeh = this.vehicles.find(v => v.registration_number === selectedDriver.vehicle_number);
        if (matchingVeh) {
          this.selectedVehicleId = matchingVeh.vehicle_id || matchingVeh.id;
          this.bookingData.vehicle_id = matchingVeh.vehicle_id || matchingVeh.id;
        }
      }
    }
  }

  onCabNumberChange(cabNum: string): void {
    if (!cabNum) {
      this.selectedVehicleId = null;
      this.bookingData.vehicle_id = null;
      return;
    }
    const cleanNum = cabNum.trim().toUpperCase();
    const matchingVeh = this.vehicles.find(v => v.registration_number?.toUpperCase() === cleanNum);
    if (matchingVeh) {
      this.selectedVehicleId = matchingVeh.vehicle_id || matchingVeh.id;
      this.bookingData.vehicle_id = matchingVeh.vehicle_id || matchingVeh.id;
    } else {
      this.selectedVehicleId = 'custom' as any;
      this.bookingData.vehicle_id = null;
    }
  }

  whatsappSuccessDispatch: any = null;

  getSelectedDriverName(): string {
    if (!this.bookingData.driver_id) return 'Unassigned';
    const found = this.drivers.find(d => (d.user_id || d.id) === this.bookingData.driver_id);
    return found ? found.name : 'Driver #' + this.bookingData.driver_id;
  }

  getSelectedBuyerName(): string {
    const found = this.buyers.find(b => (b.buyer_id || b.id) == this.bookingData.buyer_id);
    return found ? found.full_name : 'Selected Buyer';
  }

  getSelectedBuyerPhone(): string {
    const found = this.buyers.find(b => (b.buyer_id || b.id) == this.bookingData.buyer_id);
    return found ? (found.phone || '7058533669') : '7058533669';
  }

  buildDriverWhatsAppUrl(): string {
    const driverPhone = '917058533669';
    const driverName = this.getSelectedDriverName();
    const buyerName = this.getSelectedBuyerName();
    const buyerPhone = this.getSelectedBuyerPhone();
    const pickup = this.bookingData.pickup_address || 'Customer Residence / Office';
    const timeSlot = this.bookingData.time_slot || '04:00 PM - 05:30 PM';
    const date = this.bookingData.scheduled_date || 'Today';
    const cab = this.bookingData.cab_number || 'KA-05-NB-4411';

    const lines = [
      '🚗 *CONTECH CRM - DRIVER TRIP ASSIGNMENT* 🚗',
      '',
      `Hello *${driverName}*,`,
      'You have been assigned for a client site visit pickup with the following details:',
      '',
      `👤 *Passenger / Client:* ${buyerName}`,
      `📞 *Client Contact:* ${buyerPhone}`,
      `📍 *Pickup Location:* ${pickup}`,
      `🏢 *Destination:* Contech Sales Gallery, ITPL Main Road, Whitefield`,
      `📅 *Date:* ${date}`,
      `⏰ *Time Slot:* ${timeSlot}`,
      `🚘 *Vehicle:* ${cab}`,
      '',
      '⚡ _Please call the passenger 30 minutes in advance to confirm pickup coordination._'
    ];
    return `https://api.whatsapp.com/send?phone=${driverPhone}&text=${encodeURIComponent(lines.join('\n'))}`;
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.visitService.bookSiteVisit(this.bookingData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const driverName = this.getSelectedDriverName();
          const dispatch = res.whatsapp_dispatch;
          const waUrl = dispatch?.web_whatsapp_url ||
                        dispatch?.whatsapp_url ||
                        this.buildDriverWhatsAppUrl();

          // Automatically send WhatsApp message to driver in background/browser
          if (this.bookingData.cab_required && this.bookingData.driver_id && waUrl) {
            try {
              window.open(waUrl, '_blank');
            } catch (e) {
              console.warn('Auto window.open intercepted:', e);
            }
          }

          // Navigate to visits with dispatch details
          this.router.navigate(['/visits'], {
            queryParams: {
              whatsapp_sent: 'true',
              driver: driverName,
              wa_url: encodeURIComponent(waUrl || '')
            }
          });
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to book site visit. Capacity limit or conflict.';
      }
    });
  }
}
