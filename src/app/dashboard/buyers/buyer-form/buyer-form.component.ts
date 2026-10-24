import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';
import { UserService } from '../../../users/user.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-buyer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './buyer-form.component.html',
  styleUrl: './buyer-form.component.css'
})
export class BuyerFormComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private router = inject(Router);

  salesReps: any[] = [];

  buyerData: any = {
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
    lead_source: 'SimpliQualify',
    financing_readiness: 'Pre-approved Loan',
    occupation: 'Salaried IT/Corporate',
    assigned_rep_id: null,
    notes: '',
    allow_duplicate: false,
    duplicate_resolution_notes: ''
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadSalesReps();
  }

  loadSalesReps(): void {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        if (res && res.success && res.users) {
          this.salesReps = res.users.filter((u: any) => u.is_active !== false);
          if (this.salesReps.length > 0 && !this.buyerData.assigned_rep_id) {
            const defaultRep = this.salesReps.find((u: any) => {
              const roleName = (u.role?.name || u.name || '').toLowerCase();
              return roleName.includes('executive') || roleName.includes('sales');
            }) || this.salesReps[0];
            this.buyerData.assigned_rep_id = defaultRep.user_id || defaultRep.id;
          }
        }
      }
    });
  }
  checkingDuplicate = false;
  duplicateInfo: any = null;

  checkDuplicateContact(): void {
    const phone = this.buyerData.phone?.trim();
    const email = this.buyerData.email?.trim();
    if (!phone && !email) return;

    this.checkingDuplicate = true;
    this.buyerService.checkDuplicate(phone, email).subscribe({
      next: (res) => {
        this.checkingDuplicate = false;
        if (res.success && res.is_duplicate) {
          this.duplicateInfo = res.duplicate;
        } else {
          this.duplicateInfo = null;
        }
      },
      error: () => {
        this.checkingDuplicate = false;
      }
    });
  }

  allowDuplicateProceed(): void {
    this.buyerData.allow_duplicate = true;
    this.buyerData.duplicate_resolution_notes = `Co-applicant / duplicate permitted resolution at ${new Date().toLocaleDateString()}`;
    this.duplicateInfo = null;
  }

  dismissDuplicateWarning(): void {
    this.duplicateInfo = null;
  }

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
        if (err.status === 409 && err.error?.is_duplicate) {
          this.duplicateInfo = err.error.existing_buyer;
          this.errorMessage = err.error.message || 'Duplicate prospect detected in database.';
        } else {
          this.errorMessage = err.error?.message || 'Failed to save buyer profile.';
        }
      }
    });
  }
}
