import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  loading = true;
  visits: any[] = [];
  filterStatus = '';

  ngOnInit(): void {
    this.loadVisits();
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

