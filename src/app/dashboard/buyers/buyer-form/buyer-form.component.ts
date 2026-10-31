import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuyerService } from '../buyer.service';
import { UserService } from '../../../users/user.service';
import { SettingsService } from '../../../settings/settings.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

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
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './buyer-form.component.html',
  styleUrl: './buyer-form.component.css'
})
export class BuyerFormComponent implements OnInit {
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  salesReps: any[] = [];

  projects: any[] = [
    { project_id: 1, id: 1, name: 'Contech Crown Heights', code: 'CCH-BLR', location: 'Whitefield, Bengaluru' },
    { project_id: 2, id: 2, name: 'Contech Skyline Elegance', code: 'CSE-BLR', location: 'Indiranagar, Bengaluru' },
    { project_id: 3, id: 3, name: 'Contech Greenfield Sanctuary', code: 'CGS-BLR', location: 'Sarjapur Road, Bengaluru' },
    { project_id: 4, id: 4, name: 'Contech Emerald Meadows Plotted Layout', code: 'CONTEC-0409', location: 'Devenahalli, Bengaluru' },
    { project_id: 5, id: 5, name: 'Contech Business Square', code: 'CONTEC-0438', location: 'Koramangala, Bengaluru' }
  ];

  defaultOccupations: string[] = [
    'Salaried IT / Tech Corporate',
    'Business Owner / Entrepreneur',
    'Doctor / Healthcare Specialist',
    'Chartered Accountant / Finance',
    'NRI / Overseas Investor',
    'Government / PSU Officer',
    'Lawyer / Legal Professional',
    'Architect / Design Consultant',
    'Retired / Senior Citizen'
  ];
  occupations: string[] = [];
  isCreatingCustomOccupation = false;
  newCustomOccupation = '';
  previousOccupation = 'Salaried IT / Tech Corporate';

  buyerData: any = {
    full_name: '',
    phone: '',
    email: '',
    project_id: 1,
    preferred_project: 'Contech Crown Heights',
    current_residence: '',
    workplace_location: '',
    budget_min_lacs: 120,
    budget_max_lacs: 180,
    preferred_bhk: '3 BHK',
    family_size: 4,
    buying_timeframe: '<30 days',
    lead_source: 'SimpliQualify',
    financing_readiness: 'Pre-approved Loan',
    occupation: 'Salaried IT / Tech Corporate',
    assigned_rep_id: null,
    notes: '',
    allow_duplicate: false,
    duplicate_resolution_notes: ''
  };

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadOccupations();
    this.loadSalesReps();
    this.loadProjects();

    const paramProjectId = this.route.snapshot.queryParams['project_id'];
    if (paramProjectId) {
      this.buyerData.project_id = Number(paramProjectId);
    }
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.projects && res.projects.length > 0) {
          this.projects = res.projects;
          if (!this.buyerData.project_id) {
            this.buyerData.project_id = this.projects[0].project_id || this.projects[0].id;
          }
          const matched = this.projects.find(p => (p.project_id || p.id) == this.buyerData.project_id);
          if (matched) this.buyerData.preferred_project = matched.name;
        }
      },
      error: () => {}
    });
  }

  onProjectSelect(projectId: number): void {
    const matched = this.projects.find(p => (p.project_id || p.id) == projectId);
    if (matched) {
      this.buyerData.preferred_project = matched.name;
    }
  }

  loadOccupations(): void {
    try {
      const stored = localStorage.getItem('contech_custom_occupations');
      const custom: string[] = stored ? JSON.parse(stored) : [];
      this.occupations = Array.from(new Set([...this.defaultOccupations, ...custom]));
    } catch {
      this.occupations = [...this.defaultOccupations];
    }
  }

  onOccupationChange(val: string): void {
    if (val === '__create_new__') {
      this.isCreatingCustomOccupation = true;
      this.newCustomOccupation = '';
      setTimeout(() => {
        this.buyerData.occupation = this.previousOccupation;
      });
    } else {
      this.previousOccupation = val;
      this.isCreatingCustomOccupation = false;
    }
  }

  saveCustomOccupation(event?: Event): void {
    if (event) event.preventDefault();
    const trimmed = this.newCustomOccupation.trim();
    if (!trimmed) return;

    if (!this.occupations.includes(trimmed)) {
      this.occupations.push(trimmed);
      try {
        const stored = localStorage.getItem('contech_custom_occupations');
        const custom = stored ? JSON.parse(stored) : [];
        custom.push(trimmed);
        localStorage.setItem('contech_custom_occupations', JSON.stringify(custom));
      } catch (e) {
        console.error('Failed to cache custom occupation', e);
      }
    }
    this.buyerData.occupation = trimmed;
    this.previousOccupation = trimmed;
    this.isCreatingCustomOccupation = false;
    this.newCustomOccupation = '';
  }

  cancelCustomOccupation(): void {
    this.isCreatingCustomOccupation = false;
    this.buyerData.occupation = this.previousOccupation;
    this.newCustomOccupation = '';
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
