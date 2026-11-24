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

  getTodayDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTomorrowDateString(): string {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    const year = tmrw.getFullYear();
    const month = String(tmrw.getMonth() + 1).padStart(2, '0');
    const day = String(tmrw.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  todayDateString: string = this.getTodayDateString();
  minBookingDate: string = this.getTodayDateString();

  bookingData: any = {
    buyer_id: null,
    project_id: null,
    sales_rep_id: null,
    driver_id: null,
    vehicle_id: null,
    driver_phone: '',
    scheduled_date: this.getTodayDateString(),
    time_slot: '11:00 AM - 12:30 PM',
    cab_required: true,
    cab_number: '',
    pickup_address: 'Customer Residence / Office',
    notes: 'Confirm buyer preferred floor plan copies ready in sales lounge.'
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.todayDateString = this.getTodayDateString();
    this.minBookingDate = this.todayDateString;
    this.loadTimeSlots();
    this.ensureValidDateAndSlot();
    this.loadProjects();
    this.loadUsers();
    this.loadBuyers();
    this.loadVehicles();
    this.loadDateVisits();
  }

  ensureValidDateAndSlot(): void {
    const today = this.getTodayDateString();
    if (!this.bookingData.scheduled_date) {
      this.bookingData.scheduled_date = today;
    }

    if (this.bookingData.scheduled_date === today) {
      if (this.isSlotEnded(this.bookingData.time_slot)) {
        const nextAvail = this.timeSlots.find(s => !this.isSlotEnded(s));
        if (nextAvail) {
          this.bookingData.time_slot = nextAvail;
          this.previousTimeSlot = nextAvail;
        }
      }
    }
  }

  dateVisits: any[] = [];

  loadDateVisits(): void {
    if (!this.bookingData.scheduled_date) return;
    this.visitService.getSiteVisits({ date: this.bookingData.scheduled_date }).subscribe({
      next: (res: any) => {
        if (res && res.success && Array.isArray(res.visits)) {
          this.dateVisits = res.visits;
        } else {
          this.dateVisits = [];
        }
        this.validateAndAdjustExecutiveSelection();
      },
      error: () => {
        this.dateVisits = [];
      }
    });
  }

  onDateChange(): void {
    const today = this.getTodayDateString();
    if (this.bookingData.scheduled_date === today && this.isSlotEnded(this.bookingData.time_slot)) {
      const nextAvail = this.timeSlots.find(s => !this.isSlotEnded(s));
      if (nextAvail) {
        this.bookingData.time_slot = nextAvail;
        this.previousTimeSlot = nextAvail;
      }
    }

    this.loadDateVisits();
  }

  // Check if a time slot on today has ended in wall-clock time (past dates allow all slots)
  isSlotEnded(slot: string): boolean {
    if (!slot || !this.bookingData.scheduled_date) return false;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Past dates and future dates allow any slot for historical or scheduled bookings
    if (this.bookingData.scheduled_date < todayStr) return false;
    if (this.bookingData.scheduled_date > todayStr) return false;

    let endTimePart = slot;
    if (slot.includes('-')) {
      endTimePart = slot.split('-')[1].trim();
    }
    const match = endTimePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return false;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = (match[3] || '').toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const slotEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    return now.getTime() >= slotEndTime.getTime();
  }

  // Normalize time slot strings (handles en-dashes, hyphens, and whitespace differences)
  normalizeSlot(slot: string | null | undefined): string {
    if (!slot) return '';
    return String(slot).replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  // Bug 9 & 13 Fix: Check if sales executive is busy in chosen slot
  isRepBusyInSelectedSlot(repId: any): boolean {
    if (!repId || !this.bookingData.time_slot) return false;
    const targetId = Number(repId);
    const curSlot = this.normalizeSlot(this.bookingData.time_slot);
    return this.dateVisits.some(v =>
      (v.sales_rep_id === targetId || v.salesRep?.user_id === targetId) &&
      this.normalizeSlot(v.time_slot) === curSlot &&
      v.status !== 'CANCELLED' &&
      v.status !== 'COMPLETED' &&
      v.status !== 'DROPPED_AT_SITE'
    );
  }

  // Bug 11 Fix: Check if driver is busy in chosen slot
  isDriverBusyInSelectedSlot(driverId: any): boolean {
    if (!driverId || !this.bookingData.time_slot) return false;
    const targetId = Number(driverId);
    const curSlot = this.normalizeSlot(this.bookingData.time_slot);
    return this.dateVisits.some(v =>
      (v.driver_id === targetId || v.driver?.user_id === targetId) &&
      this.normalizeSlot(v.time_slot) === curSlot &&
      v.status !== 'CANCELLED' &&
      v.status !== 'COMPLETED' &&
      v.trip?.trip_status !== 'COMPLETED' &&
      v.status !== 'DROPPED_AT_SITE'
    );
  }

  // Bug 11 Fix: Check if vehicle is busy in chosen slot
  isVehicleBusyInSelectedSlot(vehicleId: any, cabNumber?: string): boolean {
    if (!this.bookingData.time_slot) return false;
    const vId = vehicleId ? Number(vehicleId) : null;
    const cleanCab = cabNumber ? cabNumber.trim().toUpperCase() : null;
    const curSlot = this.normalizeSlot(this.bookingData.time_slot);
    return this.dateVisits.some(v => {
      if (
        v.status === 'CANCELLED' ||
        v.status === 'COMPLETED' ||
        v.trip?.trip_status === 'COMPLETED' ||
        v.status === 'DROPPED_AT_SITE' ||
        this.normalizeSlot(v.time_slot) !== curSlot
      ) return false;
      if (vId && v.vehicle_id === vId) return true;
      if (cleanCab && v.cab_number && v.cab_number.trim().toUpperCase() === cleanCab) return true;
      return false;
    });
  }

  // Bug 9 & 13 Fix: Auto-adjust executive selection when time slot or date changes
  validateAndAdjustExecutiveSelection(): void {
    if (!this.salesExecutives || this.salesExecutives.length === 0) return;
    const currentRepBusy = this.bookingData.sales_rep_id && this.isRepBusyInSelectedSlot(this.bookingData.sales_rep_id);
    if (currentRepBusy || !this.bookingData.sales_rep_id) {
      const availableRep = this.salesExecutives.find(s => !this.isRepBusyInSelectedSlot(s.user_id || s.id));
      if (availableRep) {
        this.bookingData.sales_rep_id = availableRep.user_id || availableRep.id;
      } else {
        this.bookingData.sales_rep_id = null;
      }
    }
  }

  getDriverSlotStatusText(driver: any): string {
    const dId = driver.user_id || driver.id;
    const currentSlot = this.normalizeSlot(this.bookingData.time_slot);
    const sameSlotVisit = this.dateVisits.find(v => (v.driver_id === dId || v.driver?.user_id === dId) && this.normalizeSlot(v.time_slot) === currentSlot);

    if (sameSlotVisit) {
      const isCompleted = sameSlotVisit.status === 'COMPLETED' || sameSlotVisit.trip?.trip_status === 'COMPLETED' || sameSlotVisit.status === 'DROPPED_AT_SITE';
      if (isCompleted) {
        return 'Available (Trip Completed)';
      }
      if (sameSlotVisit.status === 'CANCELLED') {
        return 'Available';
      }
      return 'Busy (In Slot)';
    }

    const hasCompletedTrip = this.dateVisits.some(v => (v.driver_id === dId || v.driver?.user_id === dId) && (v.status === 'COMPLETED' || v.trip?.trip_status === 'COMPLETED' || v.status === 'DROPPED_AT_SITE'));
    if (hasCompletedTrip) {
      return 'Available (Trip Completed)';
    }

    return 'Available';
  }

  getDriverSlotStatusClass(driver: any): string {
    const text = this.getDriverSlotStatusText(driver);
    if (text.includes('Busy')) return 'status-busy';
    if (text.includes('Trip Completed')) return 'status-available-completed';
    return 'status-available';
  }

  getVehicleSlotStatusText(vehicleId: any, cabNumber?: string): string {
    if (!this.bookingData.time_slot) return 'Available';
    const vId = vehicleId ? Number(vehicleId) : null;
    const cleanCab = cabNumber ? cabNumber.trim().toUpperCase() : null;
    const curSlot = this.normalizeSlot(this.bookingData.time_slot);

    const sameSlotVisit = this.dateVisits.find(v => {
      if (this.normalizeSlot(v.time_slot) !== curSlot) return false;
      if (vId && v.vehicle_id === vId) return true;
      if (cleanCab && v.cab_number && v.cab_number.trim().toUpperCase() === cleanCab) return true;
      return false;
    });

    if (sameSlotVisit) {
      const isCompleted = sameSlotVisit.status === 'COMPLETED' || sameSlotVisit.trip?.trip_status === 'COMPLETED' || sameSlotVisit.status === 'DROPPED_AT_SITE';
      if (isCompleted) {
        return 'Available (Trip Completed)';
      }
      if (sameSlotVisit.status === 'CANCELLED') {
        return 'Available';
      }
      return 'Busy (In Slot)';
    }

    const hasCompletedTrip = this.dateVisits.some(v => {
      const matchVehicle = (vId && v.vehicle_id === vId) || (cleanCab && v.cab_number && v.cab_number.trim().toUpperCase() === cleanCab);
      return matchVehicle && (v.status === 'COMPLETED' || v.trip?.trip_status === 'COMPLETED' || v.status === 'DROPPED_AT_SITE');
    });
    if (hasCompletedTrip) {
      return 'Available (Trip Completed)';
    }

    return 'Available';
  }

  getVehicleSlotStatusClass(vehicleId: any, cabNumber?: string): string {
    const text = this.getVehicleSlotStatusText(vehicleId, cabNumber);
    if (text.includes('Busy')) return 'status-busy';
    if (text.includes('Trip Completed')) return 'status-available-completed';
    return 'status-available';
  }

  getVehicleAvailabilitySummary(vehicleId: any, cabNumber?: string): string {
    const cab = cabNumber || 'selected vehicle';
    const text = this.getVehicleSlotStatusText(vehicleId, cabNumber);
    if (text.includes('Trip Completed')) {
      return `Vehicle ${cab} is AVAILABLE (Previous trip completed; released for new bookings).`;
    }
    if (text.includes('Busy')) {
      return `Vehicle ${cab} is currently assigned to an active site visit in slot ${this.bookingData.time_slot}.`;
    }
    return `Vehicle ${cab} is AVAILABLE for this slot.`;
  }

  getRepSlotStatusText(rep: any): string {
    const rId = rep.user_id || rep.id;
    const currentSlot = this.bookingData.time_slot;
    const sameSlotVisit = this.dateVisits.find(v => (v.sales_rep_id === rId || v.salesRep?.user_id === rId) && v.time_slot === currentSlot);

    if (sameSlotVisit) {
      const isCompleted = sameSlotVisit.status === 'COMPLETED' || sameSlotVisit.status === 'DROPPED_AT_SITE';
      if (isCompleted) {
        return 'Available (Visit Completed)';
      }
      if (sameSlotVisit.status === 'CANCELLED') {
        return 'Available';
      }
      return 'Busy (In Slot)';
    }

    const hasCompletedVisit = this.dateVisits.some(v => (v.sales_rep_id === rId || v.salesRep?.user_id === rId) && (v.status === 'COMPLETED' || v.status === 'DROPPED_AT_SITE'));
    if (hasCompletedVisit) {
      return 'Available (Visit Completed)';
    }

    return 'Available';
  }

  getRepSlotStatusClass(rep: any): string {
    const text = this.getRepSlotStatusText(rep);
    if (text.includes('Busy')) return 'status-busy';
    if (text.includes('Completed')) return 'status-available-completed';
    return 'status-available';
  }

  getSelectedDriverAvailabilitySummary(): string {
    const driver = this.getSelectedDriver();
    if (!driver) return 'No driver assigned';
    const status = this.getDriverSlotStatusText(driver);
    if (status.includes('Trip Completed')) {
      return `Driver ${driver.name} is AVAILABLE (Previous trip completed; released for new bookings).`;
    }
    if (status.includes('Busy')) {
      return `Driver ${driver.name} is assigned to an active trip in slot ${this.bookingData.time_slot}.`;
    }
    return `Driver ${driver.name} is AVAILABLE for this slot.`;
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
      this.validateAndAdjustExecutiveSelection();
    }
  }

  saveCustomTimeSlot(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.customSlotStartTime || !this.customSlotEndTime) {
      this.errorMessage = 'Please specify both start and end time for the custom time slot.';
      return;
    }

    if (this.customSlotStartTime >= this.customSlotEndTime) {
      this.errorMessage = 'End time must be later than start time.';
      return;
    }

    const start = this.formatTime12h(this.customSlotStartTime);
    const end = this.formatTime12h(this.customSlotEndTime);
    const slotStr = `${start} - ${end}`;

    // If date is today, check if this custom time slot has already ended in real time
    if (this.bookingData.scheduled_date === this.getTodayDateString()) {
      const now = new Date();
      const [endH, endM] = this.customSlotEndTime.split(':').map(Number);
      const slotEndDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM, 0);
      if (now.getTime() >= slotEndDateTime.getTime()) {
        this.errorMessage = `Cannot add custom time slot "${slotStr}": The end time has already passed for today. Please select a future time.`;
        return;
      }
    }

    const trimmed = slotStr.trim();
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
    this.errorMessage = '';
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
            const r = ((u.role?.name || '') + ' ' + (u.role_name || '') + ' ' + (u.role || '') + ' ' + (u.role_code || '')).toLowerCase();
            return !r.includes('driver');
          });
          let drvs = active.filter((u: any) => {
            const r = ((u.role?.name || '') + ' ' + (u.role_name || '') + ' ' + (u.role || '') + ' ' + (u.role_code || '')).toLowerCase();
            return r.includes('driver');
          });

          // Bug 8 Fix: Fallback to all driver candidates if drvs is empty
          if (drvs.length === 0) {
            drvs = res.users.filter((u: any) => {
              const str = ((u.role?.name || '') + ' ' + (u.role_code || '') + ' ' + (u.name || '')).toLowerCase();
              return str.includes('driver');
            });
          }

          this.salesExecutives = execs;
          this.drivers = drvs;

          // Bug 9 & 13 Fix: Auto-select an available (non-busy) sales executive
          this.validateAndAdjustExecutiveSelection();

          if (this.drivers.length > 0 && !this.bookingData.driver_id) {
            const availDrv = this.drivers.find(d => !this.isDriverBusyInSelectedSlot(d.user_id || d.id)) || this.drivers[0];
            this.bookingData.driver_id = availDrv.user_id || availDrv.id;
            if (!this.bookingData.driver_phone && availDrv.phone) {
              this.bookingData.driver_phone = String(availDrv.phone).trim();
            }
          }
          if (this.bookingData.driver_id) {
            if (!this.bookingData.driver_phone) {
              const curDrv = this.drivers.find(d => (d.user_id || d.id) === this.bookingData.driver_id);
              if (curDrv?.phone) this.bookingData.driver_phone = String(curDrv.phone).trim();
            }
            this.evaluateDriverWhatsApp(this.bookingData.driver_phone || this.bookingData.driver_id);
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
    if (this.bookingData.driver_id) {
      const selectedDriver = this.drivers.find(d => (d.user_id || d.id) === this.bookingData.driver_id);
      if (selectedDriver) {
        this.bookingData.driver_phone = selectedDriver.phone ? String(selectedDriver.phone).trim() : '';
        // If driver has a default vehicle in profile and no cab number is set yet:
        if (!this.bookingData.cab_number && selectedDriver.vehicle_number) {
          this.bookingData.cab_number = selectedDriver.vehicle_number;
          const matchingVeh = this.vehicles.find(v => v.registration_number === selectedDriver.vehicle_number);
          if (matchingVeh) {
            this.selectedVehicleId = matchingVeh.vehicle_id || matchingVeh.id;
            this.bookingData.vehicle_id = matchingVeh.vehicle_id || matchingVeh.id;
          }
        }
      }
    } else {
      this.bookingData.driver_phone = '';
    }
    this.evaluateDriverWhatsApp(this.bookingData.driver_phone || this.bookingData.driver_id);
  }

  onDriverPhoneChange(phone: string): void {
    this.bookingData.driver_phone = phone;
    this.evaluateDriverWhatsApp(phone);
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
    if (this.bookingData.driver_phone && String(this.bookingData.driver_phone).trim()) {
      return String(this.bookingData.driver_phone).trim();
    }
    const driver = this.getSelectedDriver();
    return driver?.phone ? String(driver.phone).trim() : '';
  }

  getSelectedDriverPhone(): string {
    return this.getSelectedDriverRawPhone();
  }

  getSelectedDriverCleanPhone(): string {
    const raw = this.getSelectedDriverRawPhone();
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return digits;
    return digits || raw;
  }

  evaluateDriverWhatsApp(phoneOrDriverId?: any): void {
    let rawPhone = '';
    if (typeof phoneOrDriverId === 'string') {
      rawPhone = phoneOrDriverId.trim();
    } else if (typeof phoneOrDriverId === 'number' || (phoneOrDriverId && !isNaN(phoneOrDriverId))) {
      const driver = this.drivers.find(d => (d.user_id || d.id) == phoneOrDriverId);
      rawPhone = driver?.phone ? String(driver.phone).trim() : '';
    } else {
      rawPhone = this.bookingData.driver_phone ? String(this.bookingData.driver_phone).trim() : '';
      if (!rawPhone && this.bookingData.driver_id) {
        const driver = this.getSelectedDriver();
        rawPhone = driver?.phone ? String(driver.phone).trim() : '';
      }
    }

    if (!rawPhone) {
      if (this.bookingData.driver_id) {
        this.driverWhatsAppStatus = {
          present: false,
          phone: 'no phone specified',
          message: 'Enter driver WhatsApp number'
        };
        this.driverWhatsAppWarning = 'No phone number specified for assigned driver. Enter a valid mobile number to enable direct backend WhatsApp dispatch.';
      } else {
        this.driverWhatsAppStatus = null;
        this.driverWhatsAppWarning = '';
      }
      return;
    }

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
    } else if (digits.length >= 12 && digits.startsWith('91')) {
      const local = digits.slice(2);
      if (/^[6-9]\d{9}$/.test(local)) {
        cleanPhone = digits;
        isValid = true;
      }
    } else if (digits.length >= 10 && digits.length <= 15) {
      cleanPhone = digits;
      isValid = true;
    }

    if (!isValid) {
      this.driverWhatsAppStatus = {
        present: false,
        phone: rawPhone,
        message: `WhatsApp not present for this number (${rawPhone})`
      };
      this.driverWhatsAppWarning = `WhatsApp is not present for this number (${rawPhone}). Please enter a valid 10-digit mobile number.`;
    } else {
      this.driverWhatsAppStatus = {
        present: true,
        phone: cleanPhone,
        message: `Direct WhatsApp active (+${cleanPhone})`
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
    return found?.phone ? found.phone : '';
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

  // WhatsApp Direct Frontend Popup Modal State
  showWhatsAppModal = false;
  whatsAppModalType: 'NOT_PRESENT' | 'SUCCESS' = 'SUCCESS';
  whatsAppModalTitle = '';
  whatsAppModalMessage = '';
  whatsAppModalPhone = '';
  whatsAppModalDriverName = '';
  whatsAppModalWaUrl = '';

  openWhatsAppPopup(
    type: 'NOT_PRESENT' | 'SUCCESS',
    title: string,
    message: string,
    phone: string,
    driverName?: string,
    waUrl?: string
  ): void {
    this.whatsAppModalType = type;
    this.whatsAppModalTitle = title;
    this.whatsAppModalMessage = message;
    this.whatsAppModalPhone = phone;
    this.whatsAppModalDriverName = driverName || this.getSelectedDriverName();
    this.whatsAppModalWaUrl = waUrl || '';
    this.showWhatsAppModal = true;
  }

  closeWhatsAppPopup(): void {
    this.showWhatsAppModal = false;
    this.router.navigate(['/visits']);
  }

  sendViaDirectWhatsApp(): void {
    if (this.whatsAppModalWaUrl) {
      window.open(this.whatsAppModalWaUrl, '_blank');
    }
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

    if (!this.bookingData.scheduled_date) {
      this.errorMessage = 'Please select a visit date.';
      return;
    }

    // Bug 10 Fix: Reject submission if slot has already ended
    if (this.isSlotEnded(this.bookingData.time_slot)) {
      this.errorMessage = `Time slot "${this.bookingData.time_slot}" has already ended. Please select an upcoming slot or future date.`;
      return;
    }

    // Bug 9 & 13 Fix: Reject submission if assigned sales executive is busy
    if (!this.bookingData.sales_rep_id) {
      this.errorMessage = 'Please select an available sales executive for this visit slot.';
      return;
    }
    if (this.isRepBusyInSelectedSlot(this.bookingData.sales_rep_id)) {
      const busyRep = this.salesExecutives.find(s => (s.user_id || s.id) == this.bookingData.sales_rep_id);
      this.errorMessage = `Sales executive ${busyRep ? busyRep.name : 'assigned'} is already booked for another site visit in slot ${this.bookingData.time_slot}. Please choose an available executive.`;
      return;
    }

    // Bug 11 Fix: Reject overlapping vehicle assignment
    if (this.bookingData.cab_required && this.isVehicleBusyInSelectedSlot(this.bookingData.vehicle_id, this.bookingData.cab_number)) {
      this.errorMessage = `Vehicle "${this.bookingData.cab_number || 'selected'}" is already scheduled for another site visit in slot ${this.bookingData.time_slot}. Please assign an available vehicle.`;
      return;
    }

    // Bug 11 Fix: Reject overlapping driver assignment
    if (this.bookingData.cab_required && this.bookingData.driver_id && this.isDriverBusyInSelectedSlot(this.bookingData.driver_id)) {
      const busyDrv = this.drivers.find(d => (d.user_id || d.id) == this.bookingData.driver_id);
      this.errorMessage = `Driver ${busyDrv ? busyDrv.name : 'assigned'} is already booked for an active trip in slot ${this.bookingData.time_slot}. Please assign an available driver.`;
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
          const driverPhone = this.getSelectedDriverCleanPhone();

          if (this.bookingData.cab_required && this.bookingData.driver_id) {
            // Direct Frontend WhatsApp Dispatch (No backend processing)
            const tripMsg = this.buildDriverTripMessage();
            const directWaUrl = `https://api.whatsapp.com/send?phone=${driverPhone}&text=${encodeURIComponent(tripMsg)}`;

            try {
              window.open(directWaUrl, '_blank');
            } catch (e) {
              console.warn('Browser blocked popup, available via dialog button', e);
            }

            this.openWhatsAppPopup(
              'SUCCESS',
              'Trip Dispatched to Driver on WhatsApp',
              `Site visit booked! Trip details have been dispatched directly to driver ${driverName} (+${driverPhone}) on WhatsApp.`,
              driverPhone,
              driverName,
              directWaUrl
            );
            return;
          }

          // Non-cab visit booking success
          this.openWhatsAppPopup(
            'SUCCESS',
            'Site Visit Booked Successfully',
            'Site visit has been scheduled. Customer confirmation sent.',
            driverPhone,
            driverName
          );
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
