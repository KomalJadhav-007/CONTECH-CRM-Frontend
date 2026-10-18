import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';

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

  buyerId!: number;
  buyer: any = null;
  loading = true;

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

