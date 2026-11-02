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
    MatInputModule
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

  ngOnInit(): void {
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

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const defaultDateStr = nextDate.toISOString().slice(0, 10);

    this.manageForm = {
      decision: isNoShow ? 'CANCEL' : defaultDecision,
      new_date: visit.scheduled_date || defaultDateStr,
      new_time_slot: visit.time_slot || '02:00 PM - 03:30 PM (Afternoon Slot)',
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

