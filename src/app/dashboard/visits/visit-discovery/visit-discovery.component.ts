import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-visit-discovery',
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
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './visit-discovery.component.html',
  styleUrl: './visit-discovery.component.css'
})
export class VisitDiscoveryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private visitService = inject(VisitService);

  visitId!: number;
  
  fallbackVisit: any = {
    visit_id: 1,
    scheduled_date: 'Today',
    time_slot: '11:00 AM - 12:30 PM (Peak Slot)',
    buyer: {
      full_name: 'Deepa Sharma',
      phone: '+91 98765 43218',
      preferred_bhk: '3 BHK'
    },
    project: {
      name: 'Contech Crown Heights (Whitefield)'
    },
    salesRep: {
      name: 'Amit Verma (Account Executive)'
    }
  };

  visit: any = { ...this.fallbackVisit };
  loading = true;
  saving = false;
  successMessage = '';

  discoveryData = {
    outcome: 'HOT_NEGOTIATION',
    shortlisted_units: 'Tower B - Unit 402 (3BHK East Facing)',
    objection_category: 'VAASTU',
    objection_severity: 'MEDIUM',
    objection_notes: 'Buyer requested special payment plan waiver on floor rise charges.',
    buyer_sentiment: 'POSITIVE',
    recommended_action: 'Offer 10:90 subvention scheme before 5 PM today.',
    follow_up_title: 'Dispatch customized milestone pricing draft for Unit 402'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitId = parseInt(id, 10);
      this.loadVisit();
    } else {
      this.loading = false;
    }
  }

  loadVisit(): void {
    this.loading = true;
    this.visitService.getSiteVisitById(this.visitId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.visit) {
          this.visit = res.visit;
          if (this.visit.discovery) {
            Object.assign(this.discoveryData, this.visit.discovery);
          }
        }
      },
      error: () => {
        this.loading = false;
        if (!this.visit || !this.visit.buyer) {
          this.visit = { ...this.fallbackVisit };
        }
      }
    });
  }

  onSubmit(): void {
    this.saving = true;
    this.visitService.recordDiscovery(this.visitId, this.discoveryData).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.successMessage = 'In-visit discovery recorded and 4-hour countdown task created!';
          setTimeout(() => {
            this.router.navigate(['/visits']);
          }, 1500);
        }
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
