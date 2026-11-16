import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { VisitService } from '../visit.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './visit-list.component.html',
  styleUrl: './visit-list.component.css'
})
export class VisitListComponent implements OnInit {
  private visitService = inject(VisitService);
  private route = inject(ActivatedRoute);

  loading = true;
  visits: any[] = [];
  filterStatus = '';
  feedbackMessage = '';
  lastWaUrl = '';

  // Pagination & Search State
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';

  get filteredVisits(): any[] {
    let list = this.visits;
    if (this.filterStatus) {
      if (this.filterStatus === 'CANCELLED') {
        list = list.filter((v: any) => v.status === 'CANCELLED' || v.status === 'NO_SHOW');
      } else {
        list = list.filter((v: any) => v.status === this.filterStatus);
      }
    }
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter((v: any) => {
        const name = (v.buyer?.full_name || '').toLowerCase();
        const project = (v.project?.name || '').toLowerCase();
        const rep = (v.salesRep?.name || '').toLowerCase();
        const driver = (v.driver?.name || v.cab_number || '').toLowerCase();
        return name.includes(q) || project.includes(q) || rep.includes(q) || driver.includes(q);
      });
    }
    return list;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVisits.length / this.pageSize) || 1;
  }

  get pagedVisits(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVisits.slice(start, start + this.pageSize);
  }

  setFilterStatus(status: string): void {
    this.filterStatus = status;
    this.currentPage = 1;
    this.loadVisits();
  }

  ngOnInit(): void {
    this.loadTimeSlots();
    this.loadVisits();
    const waSent = this.route.snapshot.queryParamMap.get('whatsapp_sent');
    const driver = this.route.snapshot.queryParamMap.get('driver') || 'assigned driver';
    const waUrlParam = this.route.snapshot.queryParamMap.get('wa_url');
    if (waSent === 'true') {
      this.lastWaUrl = waUrlParam ? decodeURIComponent(waUrlParam) : '';
      this.feedbackMessage = `✓ Site visit confirmed! WhatsApp dispatch notification sent to driver ${driver} (7058533669).`;
      setTimeout(() => this.feedbackMessage = '', 9000);
    }
  }

  loadVisits(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;

    this.visitService.getSiteVisits(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.visits = res.visits;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleConfirmation(visit: any, type: string): void {
    const visitId = visit.site_visit_id || visit.id;
    const payload: any = {};
    payload[type] = !visit[type];

    this.visitService.updateConfirmations(visitId, payload).subscribe({
      next: (res) => {
        if (res.success) {
          visit[type] = !visit[type];
        }
      }
    });
  }

  // Site Visit Management Modal: Reschedule vs Permanent Cancellation
  showCancelModal = false;
  selectedVisitForCancel: any = null;
  todayDateStr: string = new Date().toISOString().slice(0, 10);
  rescheduleDateTime: string = `${new Date().toISOString().slice(0, 10)}T14:00`;

  defaultTimeSlots: string[] = [
    '09:30 AM - 11:00 AM (Morning Slot)',
    '11:00 AM - 12:30 PM (Peak Slot)',
    '02:00 PM - 03:30 PM (Afternoon Slot)',
    '04:00 PM - 05:30 PM (Evening Sunset Slot)'
  ];
  timeSlots: string[] = [];
  isCreatingCustomTimeSlot = false;
  newCustomTimeSlot = '';
  customSlotStartTime = '10:00';
  customSlotEndTime = '11:30';
  customSlotLabel = 'Custom Slot';
  previousTimeSlot = '02:00 PM - 03:30 PM (Afternoon Slot)';

  manageForm: {
    decision: 'RESCHEDULE' | 'CANCEL';
    new_date: string;
    new_time_slot: string;
    cancel_type: 'CANCELLED' | 'NO_SHOW';
    reschedule_reason: string;
    cancel_reason: string;
    notes: string;
  } = {
    decision: 'RESCHEDULE',
    new_date: '',
    new_time_slot: '02:00 PM - 03:30 PM (Afternoon Slot)',
    cancel_type: 'CANCELLED',
    reschedule_reason: 'Buyer requested reschedule due to work conflict',
    cancel_reason: 'Buyer lost interest / dropped inquiry',
    notes: ''
  };
  cancelling = false;
  cancelError = '';
  waSendingId: number | null = null;

  openDateTimePicker(inputEl: HTMLInputElement): void {
    if (inputEl && typeof (inputEl as any).showPicker === 'function') {
      try {
        (inputEl as any).showPicker();
      } catch (_) {}
    }
  }

  onRescheduleDateTimeChange(val: string): void {
    this.rescheduleDateTime = val;
    if (val) {
      this.manageForm.new_date = val.split('T')[0];
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
    const label = this.customSlotLabel.trim();
    if (start && end) {
      this.newCustomTimeSlot = label ? `${start} - ${end} (${label})` : `${start} - ${end}`;
    }
  }

  onTimeSlotChange(value: string): void {
    if (value === '__create_new_slot__') {
      this.isCreatingCustomTimeSlot = true;
      this.updateCustomSlotPreview();
      setTimeout(() => {
        this.manageForm.new_time_slot = this.previousTimeSlot;
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
      this.manageForm.new_time_slot = existing;
      this.previousTimeSlot = existing;
    } else {
      this.timeSlots.push(trimmed);
      this.manageForm.new_time_slot = trimmed;
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
    this.manageForm.new_time_slot = this.previousTimeSlot;
  }

  setDecision(decision: 'RESCHEDULE' | 'CANCEL'): void {
    this.manageForm.decision = decision;
    if (decision === 'RESCHEDULE' && !this.manageForm.reschedule_reason) {
      this.manageForm.reschedule_reason = 'Buyer requested reschedule due to work conflict';
    } else if (decision === 'CANCEL' && !this.manageForm.cancel_reason) {
      this.manageForm.cancel_reason = 'Buyer lost interest / dropped inquiry';
    }
  }

  sendDriverWhatsApp(visit: any): void {
    const vId = visit.site_visit_id || visit.id;
    this.waSendingId = vId;
    this.visitService.notifyDriverWhatsApp(vId).subscribe({
      next: (res) => {
        this.waSendingId = null;
        if (res.success && res.whatsapp_dispatch?.whatsapp_url) {
          window.open(res.whatsapp_dispatch.whatsapp_url, '_blank');
          this.feedbackMessage = `WhatsApp notification generated for driver ${visit.driver?.name || ''}!`;
          setTimeout(() => this.feedbackMessage = '', 4000);
        }
      },
      error: () => {
        this.waSendingId = null;
        const driverPhone = String(visit.driver?.phone || '7058533669').replace(/\D/g, '');
        const clean = driverPhone.length === 10 ? '91' + driverPhone : driverPhone;
        const msg = `🚗 CONTECH CRM - TRIP ASSIGNMENT\nPassenger: ${visit.buyer?.full_name || 'Client'}\nContact: ${visit.buyer?.phone || '7058533669'}\nPickup: ${visit.pickup_address || 'Customer Residence'}\nSite: ${visit.project?.name || 'Project Site'}\nDate: ${visit.scheduled_date} (${visit.time_slot})\nCab: ${visit.cab_number || 'KA-01-MJ-8822'}`;
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    });
  }

  openManageModal(visit: any, defaultDecision: 'RESCHEDULE' | 'CANCEL' = 'RESCHEDULE', isNoShow: boolean = false): void {
    this.selectedVisitForCancel = visit;
    this.showCancelModal = true;
    this.cancelError = '';
    this.isCreatingCustomTimeSlot = false;
    this.loadTimeSlots();

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const defaultDateStr = nextDate.toISOString().slice(0, 10);
    const chosenDate = visit.scheduled_date ? String(visit.scheduled_date).split('T')[0] : defaultDateStr;
    this.rescheduleDateTime = `${chosenDate}T14:00`;

    const chosenSlot = visit.time_slot || '02:00 PM - 03:30 PM (Afternoon Slot)';
    if (chosenSlot && !this.timeSlots.some(s => s.toLowerCase() === chosenSlot.toLowerCase())) {
      this.timeSlots.push(chosenSlot);
    }
    this.previousTimeSlot = chosenSlot;

    this.manageForm = {
      decision: isNoShow ? 'CANCEL' : defaultDecision,
      new_date: chosenDate,
      new_time_slot: chosenSlot,
      cancel_type: isNoShow ? 'NO_SHOW' : 'CANCELLED',
      reschedule_reason: 'Buyer requested reschedule due to work conflict',
      cancel_reason: isNoShow ? 'Buyer unresponsive at scheduled pickup time' : 'Buyer lost interest / dropped inquiry',
      notes: ''
    };
  }

  openCancelModal(visit: any, isNoShow: boolean = false): void {
    this.openManageModal(visit, 'CANCEL', isNoShow);
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedVisitForCancel = null;
  }

  submitManageVisit(): void {
    if (!this.selectedVisitForCancel) return;
    this.cancelling = true;
    this.cancelError = '';

    const visitId = this.selectedVisitForCancel.site_visit_id || this.selectedVisitForCancel.id;

    let payload: any = {};
    if (this.manageForm.decision === 'RESCHEDULE') {
      if (!this.manageForm.new_date || !this.manageForm.new_time_slot) {
        this.cancelling = false;
        this.cancelError = 'Please select both a new scheduled date and time slot for the reschedule.';
        return;
      }
      payload = {
        decision: 'RESCHEDULE',
        status: 'SCHEDULED',
        scheduled_date: this.manageForm.new_date,
        time_slot: this.manageForm.new_time_slot,
        reason: this.manageForm.reschedule_reason || 'Buyer requested reschedule due to work conflict',
        notes: this.manageForm.notes
      };
    } else {
      payload = {
        decision: 'CANCEL',
        status: this.manageForm.cancel_type,
        reason: this.manageForm.cancel_reason || 'Buyer cancelled visit',
        notes: this.manageForm.notes
      };
    }

    this.visitService.updateSiteVisit(visitId, payload).subscribe({
      next: (res) => {
        this.cancelling = false;
        if (res.success) {
          if (this.manageForm.decision === 'RESCHEDULE') {
            this.feedbackMessage = `Visit #${visitId} successfully rescheduled to ${this.manageForm.new_date} (${this.manageForm.new_time_slot})! Driver updated via WhatsApp.`;
          } else {
            this.feedbackMessage = `Visit #${visitId} marked as ${this.manageForm.cancel_type}. Recovery SLA initiated!`;
          }
          this.closeCancelModal();
          this.loadVisits();
          setTimeout(() => this.feedbackMessage = '', 4500);
        } else {
          this.cancelError = res.message || 'Failed to update visit';
        }
      },
      error: (err) => {
        this.cancelling = false;
        this.cancelError = err.error?.message || 'Failed to update visit';
      }
    });
  }

  submitCancellationRecovery(): void {
    this.submitManageVisit();
  }
}

