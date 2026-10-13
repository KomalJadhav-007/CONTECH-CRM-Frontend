import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';

@Component({
  selector: 'app-buyer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-form.component.html',
  styleUrl: './buyer-form.component.css'
})
export class BuyerFormComponent {
  private buyerService = inject(BuyerService);
  private router = inject(Router);

  buyerData = {
    full_name: '',
    phone: '',
    email: '',
    current_residence: '',
    workplace_location: '',
    budget_min_lacs: 120,
    budget_max_lacs: 180,
    preferred_bhk: '3 BHK',
    family_size: 4,
    buying_timeframe: '<30 days',
    assigned_rep_id: 3,
    notes: ''
  };

  loading = false;
  errorMessage = '';

  onSubmit() {
    if (!this.buyerData.full_name || !this.buyerData.phone) {
      this.errorMessage = 'Full name and phone number are required.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.buyerService.createBuyer(this.buyerData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.buyer) {
          this.router.navigate(['/buyers', res.buyer.id]);
        } else {
          this.router.navigate(['/buyers']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to save buyer profile.';
      }
    });
  }
}
