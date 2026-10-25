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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule
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

  availableProjects = [
    { name: 'Contech Skyline Elegance (Hebbal)', badge: 'Luxury 3 & 4 BHK', zone: 'North BLR' },
    { name: 'Contech Greenfield Sanctuary (Sarjapur)', badge: 'Eco-Villas & 3 BHK', zone: 'East BLR' },
    { name: 'Contech Oasis (Electronic City)', badge: 'Smart 2 & 3 BHK', zone: 'South BLR' }
  ];

  flatSpecsQuickChips = [
    'Higher Floor (10-18)',
    '3 BHK East Facing',
    '3.5 BHK Penthouse',
    'Park / Clubhouse View',
    'Corner Unit with Balcony',
    'Lower Floor (Garden View)'
  ];

  discoveryData: any = {
    outcome: 'HOT_NEGOTIATION',
    shortlisted_units: 'Tower B - Unit 402 (3BHK East Facing)',
    // Section 2: Specific Site Booking Decision
    booking_decision: 'CONSIDERING', // 'BOOKED_SPECIFIC' | 'CONSIDERING' | 'NOT_BOOKED'
    booked_unit_number: 'Tower B - Unit 402',
    token_amount_lacs: '5.00',
    token_payment_mode: 'UPI / Immediate Transfer',
    booking_reference_number: 'CON-BK-8492',
    expected_agreement_date: '2026-10-30',
    
    // Section 2: Future Visit & Walkthrough Intent
    future_visit_intent: 'VISIT_DIFFERENT_FLATS', // 'NONE' | 'VISIT_DIFFERENT_FLATS' | 'VISIT_OTHER_SITES' | 'BOTH'
    preferred_alternate_flats: 'Higher floor (10-16), 3BHK East-facing unit with panoramic balcony view',
    alternate_flat_specs: '3 BHK • Floor 10+ • East Facing',
    target_alternate_projects: 'Contech Skyline Elegance (Hebbal)',
    alternate_visit_date: '2026-10-27',
    alternate_visit_time_slot: '02:00 PM - 03:30 PM',
    transport_required: true,
    client_site_notes: 'Client likes project layout & amenities, but requested to check higher floor 3BHK units with uninterrupted view, and also requested a visit pass to Contech Skyline Elegance (Hebbal) for family comparison.',
    
    // Section 3: Objections
    objection_category: 'VAASTU',
    objection_severity: 'MEDIUM',
    objection_notes: 'Buyer requested special payment plan waiver on floor rise charges.',
    buyer_sentiment: 'POSITIVE',
    
    // Section 4: 4-Hour Countdown SLA
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

  setBookingDecision(decision: string): void {
    this.discoveryData.booking_decision = decision;
    if (decision === 'BOOKED_SPECIFIC') {
      this.discoveryData.outcome = 'BOOKED';
      if (!this.discoveryData.booked_unit_number) {
        this.discoveryData.booked_unit_number = this.discoveryData.shortlisted_units || 'Tower B - Unit 402';
      }
      if (!this.discoveryData.token_amount_lacs) {
        this.discoveryData.token_amount_lacs = '5.00';
      }
      if (!this.discoveryData.booking_reference_number) {
        this.discoveryData.booking_reference_number = `CON-BK-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      if (!this.discoveryData.expected_agreement_date) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        this.discoveryData.expected_agreement_date = nextWeek.toISOString().split('T')[0];
      }
    } else if (decision === 'NOT_BOOKED') {
      if (this.discoveryData.outcome === 'BOOKED') {
        this.discoveryData.outcome = 'HOT_NEGOTIATION';
      }
      if (this.discoveryData.future_visit_intent === 'NONE') {
        this.discoveryData.future_visit_intent = 'VISIT_DIFFERENT_FLATS';
      }
    }
  }

  setFutureVisitIntent(intent: string): void {
    this.discoveryData.future_visit_intent = intent;
  }

  toggleTargetProject(projectName: string): void {
    let currentProjects = (this.discoveryData.target_alternate_projects || '')
      .split(',')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    const index = currentProjects.indexOf(projectName);
    if (index > -1) {
      currentProjects.splice(index, 1);
    } else {
      currentProjects.push(projectName);
    }
    this.discoveryData.target_alternate_projects = currentProjects.join(', ');
  }

  isProjectSelected(projectName: string): boolean {
    return (this.discoveryData.target_alternate_projects || '').includes(projectName);
  }

  toggleFlatSpec(spec: string): void {
    let current = (this.discoveryData.alternate_flat_specs || '')
      .split('•')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const index = current.indexOf(spec);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(spec);
    }
    this.discoveryData.alternate_flat_specs = current.join(' • ');
  }

  isFlatSpecSelected(spec: string): boolean {
    return (this.discoveryData.alternate_flat_specs || '').includes(spec);
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
