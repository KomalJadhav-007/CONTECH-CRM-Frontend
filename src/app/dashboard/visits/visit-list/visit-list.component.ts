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

  ngOnInit(): void {
    this.loadVisits();
    const waSent = this.route.snapshot.queryParamMap.get('whatsapp_sent');
    const driver = this.route.snapshot.queryParamMap.get('driver') || 'assigned driver';
    if (waSent === 'true') {
      this.feedbackMessage = `✓ Site visit confirmed! WhatsApp notification dispatched directly to ${driver} with pickup location, client details & contact number.`;
      setTimeout(() => this.feedbackMessage = '', 7000);
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

  // SOW Sec 12: Cancellation & No-Show Recovery Modal State
  showCancelModal = false;
  selectedVisitForCancel: any = null;
  cancelForm: any = {
    status: 'CANCELLED',
    reason: 'Buyer requested reschedule due to urgent work conflict',
    notes: 'Attempt recovery call within 2 hours to offer priority Saturday slot.'
  };
  cancelling = false;
  cancelError = '';
  feedbackMessage = '';
  waSendingId: number | null = null;

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

  openCancelModal(visit: any, isNoShow: boolean = false): void {
    this.selectedVisitForCancel = visit;
    this.showCancelModal = true;
    this.cancelError = '';
    this.cancelForm = {
      status: isNoShow ? 'NO_SHOW' : 'CANCELLED',
      reason: isNoShow ? 'Buyer did not arrive at pickup point / unresponsive' : 'Buyer requested reschedule due to work conflict',
      notes: isNoShow ? 'Trigger immediate 30-minute recovery SLA follow-up task.' : 'Trigger 2-hour recovery SLA follow-up task.'
    };
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.selectedVisitForCancel = null;
  }

  submitCancellationRecovery(): void {
    if (!this.selectedVisitForCancel) return;
    this.cancelling = true;
    this.cancelError = '';

    const visitId = this.selectedVisitForCancel.site_visit_id || this.selectedVisitForCancel.id;
    const payload = {
      status: this.cancelForm.status,
      reason: this.cancelForm.reason,
      notes: this.cancelForm.notes
    };

    this.visitService.updateSiteVisit(visitId, payload).subscribe({
      next: (res) => {
        this.cancelling = false;
        if (res.success) {
          this.selectedVisitForCancel.status = this.cancelForm.status;
          this.feedbackMessage = `Visit #${visitId} marked as ${this.cancelForm.status}. Recovery SLA task initiated!`;
          this.closeCancelModal();
          this.loadVisits();
          setTimeout(() => this.feedbackMessage = '', 4000);
        } else {
          this.cancelError = res.message || 'Failed to update visit status';
        }
      },
      error: (err) => {
        this.cancelling = false;
        this.cancelError = err.error?.message || 'Failed to update visit';
      }
    });
  }
}

