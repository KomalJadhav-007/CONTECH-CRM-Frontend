import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';
import { TaskService } from '../../tasks/task.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-buyer-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './buyer-details.component.html',
  styleUrl: './buyer-details.component.css'
})
export class BuyerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private buyerService = inject(BuyerService);
  private taskService = inject(TaskService);

  buyerId!: number;
  buyer: any = null;
  loading = true;

  // Follow-up Task Modal State
  showFollowUpModal = false;
  savingFollowUp = false;
  followUpForm: any = {
    title: '',
    description: '',
    priority: 'HIGH',
    countdown_hours: 4,
    due_at: '',
    manual_intent_score: 95,
    manual_intent_delta: 5,
    manual_intent_band: 'HIGH'
  };

  // Booking Modal State (SOW Sec 13)
  showBookingModal = false;
  bookingForm: any = {
    project_id: 1,
    unit_number: '',
    unit_configuration: '3 BHK',
    booking_value_lacs: 180,
    token_amount_lacs: 5.0,
    booking_date: new Date().toISOString().split('T')[0],
    notes: ''
  };
  savingBooking = false;
  bookingError = '';
  bookingSuccess = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.buyerId = parseInt(id, 10);
      this.loadBuyerDossier();
    }
  }

  loadBuyerDossier(): void {
    this.loading = true;
    this.buyerService.getBuyer360(this.buyerId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.buyer = res.buyer;
          if (this.buyer.preferred_bhk) {
            this.bookingForm.unit_configuration = this.buyer.preferred_bhk;
          }
          if (this.buyer.budget_max_lacs) {
            this.bookingForm.booking_value_lacs = this.buyer.budget_max_lacs;
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openAddFollowUpModal(): void {
    const fourHoursLater = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const curScore = this.buyer?.intent_score !== undefined ? this.buyer.intent_score : 95;
    const curDelta = this.buyer?.intent_delta !== undefined ? this.buyer.intent_delta : 5;
    this.followUpForm = {
      title: `Follow-up Strategy Call with ${this.buyer?.full_name || 'Buyer'}`,
      description: 'Discuss requirement milestones, quote pricing revisions, and schedule next site visit.',
      priority: 'HIGH',
      countdown_hours: 4,
      due_at: fourHoursLater.toISOString().slice(0, 16),
      manual_intent_score: curScore,
      manual_intent_delta: curDelta,
      manual_intent_band: curScore >= 80 ? 'HIGH' : (curScore >= 50 ? 'MEDIUM' : 'LOW')
    };
    this.showFollowUpModal = true;
  }

  closeAddFollowUpModal(): void {
    this.showFollowUpModal = false;
  }

  setFollowUpIntentPreset(score: number, delta: number): void {
    this.followUpForm.manual_intent_score = score;
    this.followUpForm.manual_intent_delta = delta;
    this.followUpForm.manual_intent_band = score >= 80 ? 'HIGH' : (score >= 50 ? 'MEDIUM' : 'LOW');
  }

  submitAddFollowUp(): void {
    if (!this.followUpForm.title) {
      alert('Please enter a follow-up task title');
      return;
    }

    this.savingFollowUp = true;
    const payload = {
      buyer_id: this.buyer.buyer_id || this.buyer.id,
      assigned_to_id: this.buyer.assigned_rep_id || (this.buyer.assignedRep?.user_id || 1),
      title: this.followUpForm.title,
      description: this.followUpForm.description,
      priority: this.followUpForm.priority,
      countdown_hours: this.followUpForm.countdown_hours,
      due_at: this.followUpForm.due_at,
      manual_intent_score: this.followUpForm.manual_intent_score,
      manual_intent_delta: this.followUpForm.manual_intent_delta,
      manual_intent_band: this.followUpForm.manual_intent_band
    };

    this.taskService.createTask(payload).subscribe({
      next: (res) => {
        this.savingFollowUp = false;
        if (res.success) {
          this.closeAddFollowUpModal();
          this.loadBuyerDossier();
        }
      },
      error: (err) => {
        this.savingFollowUp = false;
        alert('Failed to create follow-up: ' + (err.error?.message || err.message));
      }
    });
  }

  openBookingModal(): void {
    this.showBookingModal = true;
    this.bookingError = '';
    this.bookingSuccess = '';
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.bookingError = '';
  }

  submitBooking(): void {
    if (!this.bookingForm.unit_number || !this.bookingForm.booking_value_lacs) {
      this.bookingError = 'Unit number and booking value are required.';
      return;
    }

    this.savingBooking = true;
    this.bookingError = '';

    const payload = {
      buyer_id: this.buyer.buyer_id || this.buyer.id,
      project_id: this.bookingForm.project_id,
      unit_number: this.bookingForm.unit_number,
      unit_configuration: this.bookingForm.unit_configuration,
      booking_value_lacs: this.bookingForm.booking_value_lacs,
      token_amount_lacs: this.bookingForm.token_amount_lacs,
      booking_date: this.bookingForm.booking_date,
      notes: this.bookingForm.notes
    };

    this.buyerService.recordBooking(payload).subscribe({
      next: (res) => {
        this.savingBooking = false;
        if (res.success) {
          this.bookingSuccess = `Booking ${res.booking.booking_reference} confirmed successfully!`;
          setTimeout(() => {
            this.closeBookingModal();
            this.loadBuyerDossier();
          }, 1200);
        } else {
          this.bookingError = res.message || 'Failed to record booking';
        }
      },
      error: (err) => {
        this.savingBooking = false;
        this.bookingError = err.error?.message || 'Failed to record sales booking';
      }
    });
  }

  getDimensionPercent(score: number | undefined, max: number): number {
    if (!score) return 0;
    return Math.min(100, Math.round((score / max) * 100));
  }
}

