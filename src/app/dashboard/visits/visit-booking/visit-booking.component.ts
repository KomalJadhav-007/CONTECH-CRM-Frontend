import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';
import { BuyerService } from '../../buyers/buyer.service';
import { UserService } from '../../../users/user.service';
import { SettingsService } from '../../../settings/settings.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatProgressBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './visit-booking.component.html',
  styleUrl: './visit-booking.component.css'
})
export class VisitBookingComponent implements OnInit {
  private visitService = inject(VisitService);
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  buyers: any[] = [];
  projects: any[] = [];
  salesExecutives: any[] = [];
  drivers: any[] = [];
  vehicles: any[] = [];
  selectedVehicleId: number | null = null;

  defaultTimeSlots: string[] = [
    '09:30 AM - 11:00 AM',
    '11:00 AM - 12:30 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM'
  ];
  timeSlots: string[] = [];
  isCreatingCustomTimeSlot = false;
  newCustomTimeSlot = '';
  customSlotStartTime = '10:00';
  customSlotEndTime = '11:30';
  previousTimeSlot = '11:00 AM - 12:30 PM';

  bookingData: any = {
    buyer_id: null,
    project_id: null,
    sales_rep_id: null,
    driver_id: null,
    vehicle_id: null,
    scheduled_date: new Date().toISOString().split('T')[0],
    time_slot: '11:00 AM - 12:30 PM',
    cab_required: true,
    cab_number: '',
    pickup_address: 'Customer Residence / Office',
    notes: 'Confirm buyer preferred floor plan copies ready in sales lounge.'
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTimeSlots();
    this.loadProjects();
    this.loadUsers();
    this.loadBuyers();
    this.loadVehicles();
  }

  openDateTimePicker(inputEl: HTMLInputElement): void {
    if (inputEl && typeof (inputEl as any).showPicker === 'function') {
      try {
        (inputEl as any).showPicker();
      } catch (_) {}
    }
  }

  loadTimeSlots(): void {
    const saved = localStorage.getItem('contech_custom_time_slots');
    let customList: string[] = [];
    if (saved) {
      try {
        customList = JSON.parse(saved);
      } catch {
        customList = [];
      }
    }
    this.timeSlots = [...this.defaultTimeSlots];
    for (const slot of customList) {
      if (slot && !this.timeSlots.some(s => s.toLowerCase() === slot.toLowerCase())) {
        this.timeSlots.push(slot);
      }
    }
  }

  formatTime12h(time24: string): string {
    if (!time24 || !time24.includes(':')) return time24;
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
  }

  updateCustomSlotPreview(): void {
    const start = this.formatTime12h(this.customSlotStartTime);
    const end = this.formatTime12h(this.customSlotEndTime);
    if (start && end) {
      this.newCustomTimeSlot = `${start} - ${end}`;
    } else if (start) {
      this.newCustomTimeSlot = start;
    }
  }

  onTimeSlotChange(value: string): void {
    if (value === '__create_new_slot__') {
      this.isCreatingCustomTimeSlot = true;
      this.updateCustomSlotPreview();
      setTimeout(() => {
        this.bookingData.time_slot = this.previousTimeSlot;
      });
    } else {
      this.previousTimeSlot = value;
      this.isCreatingCustomTimeSlot = false;
    }
  }

  saveCustomTimeSlot(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const trimmed = this.newCustomTimeSlot.trim();
    if (!trimmed) return;

    const existing = this.timeSlots.find(s => s.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      this.bookingData.time_slot = existing;
      this.previousTimeSlot = existing;
    } else {
      this.timeSlots.push(trimmed);
      this.bookingData.time_slot = trimmed;
      this.previousTimeSlot = trimmed;

      const saved = localStorage.getItem('contech_custom_time_slots');
      let customList: string[] = [];
      if (saved) {
        try {
          customList = JSON.parse(saved);
        } catch {
          customList = [];
        }
      }
      if (!customList.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        customList.push(trimmed);
        localStorage.setItem('contech_custom_time_slots', JSON.stringify(customList));
      }
    }

    this.isCreatingCustomTimeSlot = false;
    this.newCustomTimeSlot = '';
  }

  cancelCustomTimeSlot(): void {
    this.isCreatingCustomTimeSlot = false;
    this.newCustomTimeSlot = '';
    this.bookingData.time_slot = this.previousTimeSlot;
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.success && res.projects && res.projects.length > 0) {
          this.projects = res.projects;
          if (!this.bookingData.project_id || !this.projects.some(p => (p.project_id || p.id) == this.bookingData.project_id)) {
            this.bookingData.project_id = this.projects[0].project_id || this.projects[0].id;
          }
        } else {
          this.projects = [];
        }
      },
      error: () => {
        this.projects = [];
      }
    });
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
          this.salesExecutives = execs;
          this.drivers = drvs;

          if (this.salesExecutives.length > 0 && !this.bookingData.sales_rep_id) {
            this.bookingData.sales_rep_id = this.salesExecutives[0].user_id || this.salesExecutives[0].id;
          }
          if (this.drivers.length > 0 && !this.bookingData.driver_id) {
            this.bookingData.driver_id = this.drivers[0].user_id || this.drivers[0].id;
          }
          if (this.bookingData.driver_id) {
            this.evaluateDriverWhatsApp(this.bookingData.driver_id);
          }
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
        if (res && res.success && res.buyers && res.buyers.length > 0) {
          this.buyers = res.buyers.map((b: any) => ({
            ...b,
            id: b.buyer_id || b.id,
            preferred_bhk: this.formatBhk(b.preferred_bhk)
          }));
          const qBuyerId = this.route.snapshot.queryParamMap.get('buyer_id');
          if (qBuyerId) {
            this.bookingData.buyer_id = parseInt(qBuyerId, 10);
          } else if (this.buyers.length > 0) {
            this.bookingData.buyer_id = this.buyers[0].buyer_id || this.buyers[0].id;
          }
        } else {
          this.buyers = [];
        }
      },
      error: () => {
        this.buyers = [];
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
    this.evaluateDriverWhatsApp(this.bookingData.driver_id);
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
  driverWhatsAppStatus: { present: boolean; message: string; phone?: string } | null = null;
  driverWhatsAppWarning: string = '';

  getSelectedDriver(): any {
    if (!this.bookingData.driver_id) return null;
    return this.drivers.find(d => (d.user_id || d.id) == this.bookingData.driver_id) || null;
  }

  getSelectedDriverName(): string {
    const driver = this.getSelectedDriver();
    return driver ? driver.name : (this.bookingData.driver_id ? 'Driver #' + this.bookingData.driver_id : 'Unassigned');
  }

  getSelectedDriverRawPhone(): string {
    const driver = this.getSelectedDriver();
    return driver?.phone ? String(driver.phone).trim() : '';
  }

  getSelectedDriverCleanPhone(): string {
    const raw = this.getSelectedDriverRawPhone();
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits || raw;
  }

  evaluateDriverWhatsApp(driverId: any): void {
    if (!driverId) {
      this.driverWhatsAppStatus = null;
      this.driverWhatsAppWarning = '';
      return;
    }

    const driver = this.drivers.find(d => (d.user_id || d.id) == driverId);
    if (!driver) {
      this.driverWhatsAppStatus = null;
      this.driverWhatsAppWarning = '';
      return;
    }

    const rawPhone = driver.phone ? String(driver.phone).trim() : '';
    const digits = rawPhone.replace(/\D/g, '');

    let isValid = false;
    let cleanPhone = '';

    if (digits.length === 10) {
      if (/^[6-9]\d{9}$/.test(digits)) {
        cleanPhone = '91' + digits;
        isValid = true;
      }
    } else if (digits.length === 11 && digits.startsWith('0')) {
      const local = digits.slice(1);
      if (/^[6-9]\d{9}$/.test(local)) {
        cleanPhone = '91' + local;
        isValid = true;
      }
    } else if (digits.length === 12 && digits.startsWith('91')) {
      const local = digits.slice(2);
      if (/^[6-9]\d{9}$/.test(local)) {
        cleanPhone = digits;
        isValid = true;
      }
    } else if (digits.length >= 10 && digits.length <= 15) {
      cleanPhone = digits;
      isValid = true;
    }

    if (!rawPhone || !isValid) {
      this.driverWhatsAppStatus = {
        present: false,
        phone: rawPhone || 'no phone registered',
        message: `WhatsApp is not present for this number (${rawPhone || 'no phone registered'}).`
      };
      this.driverWhatsAppWarning = `WhatsApp is not present for this number (${rawPhone || 'no phone registered'}). The driver will not receive direct trip WhatsApp notifications.`;
    } else {
      this.driverWhatsAppStatus = {
        present: true,
        phone: cleanPhone,
        message: `Direct WhatsApp active (+${cleanPhone}). Trip details will be sent directly without browser redirection.`
      };
      this.driverWhatsAppWarning = '';
    }
  }

  getSelectedBuyerName(): string {
    const found = this.buyers.find(b => (b.buyer_id || b.id) == this.bookingData.buyer_id);
    return found ? found.full_name : 'Selected Buyer';
  }

  getSelectedBuyerPhone(): string {
    const found = this.buyers.find(b => (b.buyer_id || b.id) == this.bookingData.buyer_id);
    return found ? (found.phone || '7058533669') : '7058533669';
  }

  buildDriverTripMessage(): string {
    const driverName = this.getSelectedDriverName();
    const buyerName = this.getSelectedBuyerName();
    const buyerPhone = this.getSelectedBuyerPhone();
    const pickup = this.bookingData.pickup_address || 'Customer Residence / Office';
    const timeSlot = this.bookingData.time_slot || '04:00 PM - 05:30 PM';
    const date = this.bookingData.scheduled_date || 'Today';
    const cab = this.bookingData.cab_number || 'Company Vehicle';

    const lines = [
      '🚗 *CONTECH CRM - DRIVER TRIP ASSIGNMENT* 🚗',
      '',
      `Hello *${driverName}*,`,
      'You have been assigned for a client site visit pickup with the following details:',
      '',
      `👤 *Passenger / Client:* ${buyerName}`,
      `📞 *Client Contact:* ${buyerPhone}`,
      `📍 *Pickup Location:* ${pickup}`,
      `🏢 *Destination:* Contech Sales Gallery`,
      `📅 *Date:* ${date}`,
      `⏰ *Time Slot:* ${timeSlot}`,
      `🚘 *Vehicle:* ${cab}`,
      '',
      '⚡ _Please call the passenger 30 minutes in advance to confirm pickup coordination._'
    ];
    return lines.join('\n');
  }

  onSubmit(): void {
    if (!this.bookingData.buyer_id) {
      this.errorMessage = 'Please select a registered prospect/buyer first.';
      return;
    }
    if (!this.bookingData.project_id) {
      this.errorMessage = 'Please select a destination project first.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.driverWhatsAppWarning = '';

    this.visitService.bookSiteVisit(this.bookingData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const driverName = this.getSelectedDriverName();
          const dispatch = res.whatsapp_dispatch;

          // DIRECT SERVER DISPATCH: Never redirect user to WhatsApp Web or window.open!

          if (this.bookingData.cab_required && this.bookingData.driver_id) {
            if (dispatch?.status === 'NOT_PRESENT' || (!dispatch?.sent && dispatch?.error_code === 'NOT_PRESENT')) {
              // Highlight message right here on screen as requested by user
              const notPresentMsg = dispatch?.message || `WhatsApp is not present for this number (+${this.getSelectedDriverCleanPhone() || 'unregistered'}).`;
              this.driverWhatsAppWarning = notPresentMsg;
              this.errorMessage = `Site visit scheduled, but ${notPresentMsg} The driver could not receive automated WhatsApp alerts.`;
              return;
            }
          }

          // Direct background dispatch completed without redirection
          const successMsg = this.bookingData.cab_required && this.bookingData.driver_id
            ? `Site visit booked! Trip assignment message dispatched directly to driver ${driverName} on WhatsApp.`
            : 'Site visit booked successfully!';

          this.router.navigate(['/visits'], {
            queryParams: {
              booked: 'true',
              whatsapp_sent: dispatch?.sent ? 'true' : 'false',
              driver: driverName,
              wa_msg: dispatch?.message || successMsg
            }
          });
        }
      },
      error: (err) => {
        this.loading = false;
        const detail = err.error?.error || err.error?.message;
        this.errorMessage = detail ? `Failed to book site visit: ${detail}` : 'Failed to book site visit. Please verify selection.';
      }
    });
  }
}
