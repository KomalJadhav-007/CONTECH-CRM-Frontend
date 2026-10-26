import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';
import { SettingsService } from '../../../settings/settings.service';

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
  private settingsService = inject(SettingsService);

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
      project_id: 1,
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

  // Project inventory units & availability tracking
  projectUnits: any[] = [];
  availableFlatsCount = 0;
  totalFlatsCount = 0;
  selectedUnitNumber = '';
  selectedUnit: any = null;
  customUnitMode = false;
  loadingInventory = false;

  availableProjects = [
    { name: 'Contech Skyline Elegance (Hebbal)', badge: 'Luxury 3 & 4 BHK', zone: 'North BLR' },
    { name: 'Contech Greenfield Sanctuary (Sarjapur)', badge: 'Eco-Villas & 3 BHK', zone: 'East BLR' },
    { name: 'Contech Oasis (Electronic City)', badge: 'Smart 2 & 3 BHK', zone: 'South BLR' }
  ];

  flatSpecsQuickChips = [
    'Higher Floor (10-18)',
    '3 BHK East Facing',
    '4 BHK Penthouse',
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
    
    // Section 4: Customizable Countdown SLA
    recommended_action: 'Offer 10:90 subvention scheme before 5 PM today.',
    follow_up_title: 'Dispatch customized milestone pricing draft for Unit 402',
    follow_up_sla_hours: 4
  };

  slaPresets = [
    { label: '1 Hour', hours: 1, subtitle: 'Immediate' },
    { label: '2 Hours', hours: 2, subtitle: 'Urgent' },
    { label: '4 Hours', hours: 4, subtitle: 'Standard' },
    { label: '8 Hours', hours: 8, subtitle: 'Same Day' },
    { label: '24 Hours', hours: 24, subtitle: 'Next Day' },
    { label: '48 Hours', hours: 48, subtitle: '2 Days' }
  ];

  setSlaHours(hours: number): void {
    this.discoveryData.follow_up_sla_hours = hours;
  }

  getCalculatedDeadline(): string {
    const hours = parseFloat(this.discoveryData.follow_up_sla_hours) || 4;
    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    const now = new Date();
    const isToday = target.toDateString() === now.toDateString();
    
    const timeStr = target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Today at ${timeStr} (in ${hours} hr${hours > 1 ? 's' : ''})`;
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (target.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr} (in ${hours} hr${hours > 1 ? 's' : ''})`;
    }
    const dateStr = target.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr} at ${timeStr} (in ${hours} hr${hours > 1 ? 's' : ''})`;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitId = parseInt(id, 10);
      this.loadVisit();
    } else {
      this.loading = false;
      this.populateProjectUnits();
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
          this.populateProjectUnits();
        }
      },
      error: () => {
        this.loading = false;
        if (!this.visit || !this.visit.buyer) {
          this.visit = { ...this.fallbackVisit };
        }
        this.populateProjectUnits();
      }
    });
  }

  populateProjectUnits(): void {
    const projectId = this.visit?.project_id || this.visit?.project?.project_id || this.visit?.project?.id || 1;
    
    // If visit already loaded project units via Sequelize include
    if (this.visit?.project?.units && this.visit.project.units.length > 0) {
      this.setUnitsData(this.visit.project.units);
    }

    // Also fetch fresh inventory directly for this project to get real-time availability
    this.loadingInventory = true;
    this.settingsService.getProjectInventory(projectId).subscribe({
      next: (res) => {
        this.loadingInventory = false;
        if (res.success && res.units && res.units.length > 0) {
          this.setUnitsData(res.units);
        } else if (this.projectUnits.length === 0) {
          this.setFallbackUnitsForProject(projectId);
        }
      },
      error: () => {
        this.loadingInventory = false;
        if (this.projectUnits.length === 0) {
          this.setFallbackUnitsForProject(projectId);
        }
      }
    });
  }

  setUnitsData(units: any[]): void {
    this.projectUnits = units;
    this.availableFlatsCount = units.filter(u => u.status === 'AVAILABLE').length;
    this.totalFlatsCount = units.length;
    
    const current = (this.discoveryData.shortlisted_units || '').trim();
    if (current) {
      const match = this.projectUnits.find(u => 
        current.toLowerCase().includes(u.unit_number.toLowerCase()) || 
        u.unit_number.toLowerCase().includes(current.toLowerCase())
      );
      if (match) {
        this.selectedUnitNumber = match.unit_number;
        this.selectedUnit = match;
      } else {
        const firstAvail = this.projectUnits.find(u => u.status === 'AVAILABLE');
        if (firstAvail && !this.selectedUnit) {
          this.selectedUnitNumber = firstAvail.unit_number;
          this.selectedUnit = firstAvail;
          this.discoveryData.shortlisted_units = `${firstAvail.unit_number} (${firstAvail.bhk_type} • ${firstAvail.facing || 'East Facing'})`;
          this.discoveryData.booked_unit_number = firstAvail.unit_number;
        }
      }
    } else {
      const firstAvail = this.projectUnits.find(u => u.status === 'AVAILABLE');
      if (firstAvail) {
        this.selectedUnitNumber = firstAvail.unit_number;
        this.selectedUnit = firstAvail;
        this.discoveryData.shortlisted_units = `${firstAvail.unit_number} (${firstAvail.bhk_type} • ${firstAvail.facing || 'East Facing'})`;
        this.discoveryData.booked_unit_number = firstAvail.unit_number;
      }
    }
  }

  setFallbackUnitsForProject(projectId: number): void {
    const projName = (this.visit?.project?.name || '').toLowerCase();
    let mockUnits: any[] = [];
    if (projName.includes('greenfield') || projectId === 3) {
      mockUnits = [
        { unit_id: 101, unit_number: 'Lake Block - 101', tower_block: 'Lake Block', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1210, price_lacs: 95.00, facing: 'Lake View', status: 'AVAILABLE' },
        { unit_id: 102, unit_number: 'Lake Block - 102', tower_block: 'Lake Block', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1210, price_lacs: 95.00, facing: 'Garden View', status: 'AVAILABLE' },
        { unit_id: 201, unit_number: 'Lake Block - 201', tower_block: 'Lake Block', floor_number: 2, bhk_type: '3 BHK', area_sqft: 1720, price_lacs: 135.00, facing: 'Central Garden', status: 'AVAILABLE' },
        { unit_id: 301, unit_number: 'Lake Block - 301', tower_block: 'Lake Block', floor_number: 3, bhk_type: '3 BHK', area_sqft: 1720, price_lacs: 138.00, facing: 'Lake View', status: 'AVAILABLE' },
        { unit_id: 401, unit_number: 'Villa Sanctuary - 01', tower_block: 'Villa Enclave', floor_number: 1, bhk_type: '4 BHK', area_sqft: 3000, price_lacs: 240.00, facing: 'Lakefront', status: 'AVAILABLE' }
      ];
    } else if (projName.includes('skyline') || projectId === 2) {
      mockUnits = [
        { unit_id: 201, unit_number: 'Signature Wing - 201', tower_block: 'Signature Wing', floor_number: 2, bhk_type: '3 BHK', area_sqft: 2200, price_lacs: 260.00, facing: 'East Facing', status: 'AVAILABLE' },
        { unit_id: 302, unit_number: 'Signature Wing - 302', tower_block: 'Signature Wing', floor_number: 3, bhk_type: '3 BHK', area_sqft: 2200, price_lacs: 265.00, facing: 'North-East Facing', status: 'AVAILABLE' },
        { unit_id: 501, unit_number: 'Signature Wing - 501', tower_block: 'Signature Wing', floor_number: 5, bhk_type: '4 BHK', area_sqft: 3450, price_lacs: 420.00, facing: 'Private Deck Facing', status: 'AVAILABLE' },
        { unit_id: 601, unit_number: 'Signature Wing - 601', tower_block: 'Signature Wing', floor_number: 6, bhk_type: '4 BHK', area_sqft: 3450, price_lacs: 430.00, facing: 'Private Deck Facing', status: 'AVAILABLE' }
      ];
    } else {
      mockUnits = [
        { unit_id: 1, unit_number: 'Tower A - 101', tower_block: 'Tower A', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1320, price_lacs: 145.00, facing: 'East Facing', status: 'AVAILABLE' },
        { unit_id: 2, unit_number: 'Tower A - 102', tower_block: 'Tower A', floor_number: 1, bhk_type: '2 BHK', area_sqft: 1320, price_lacs: 145.00, facing: 'West Facing', status: 'AVAILABLE' },
        { unit_id: 3, unit_number: 'Tower A - 201', tower_block: 'Tower A', floor_number: 2, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 195.00, facing: 'North-East Facing', status: 'AVAILABLE' },
        { unit_id: 4, unit_number: 'Tower A - 402', tower_block: 'Tower A', floor_number: 4, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 195.00, facing: 'East Facing', status: 'BOOKED' },
        { unit_id: 5, unit_number: 'Tower B - 501', tower_block: 'Tower B', floor_number: 5, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 202.00, facing: 'Park Facing', status: 'AVAILABLE' },
        { unit_id: 6, unit_number: 'Tower B - 703', tower_block: 'Tower B', floor_number: 7, bhk_type: '3 BHK', area_sqft: 1850, price_lacs: 210.00, facing: 'East Facing', status: 'RESERVED' },
        { unit_id: 7, unit_number: 'Tower B - 1201', tower_block: 'Tower B', floor_number: 12, bhk_type: '4 BHK', area_sqft: 2850, price_lacs: 310.00, facing: 'Panoramic Park Facing', status: 'AVAILABLE' },
        { unit_id: 8, unit_number: 'Tower B - 1202', tower_block: 'Tower B', floor_number: 12, bhk_type: '4 BHK', area_sqft: 2850, price_lacs: 315.00, facing: 'Panoramic Park Facing', status: 'AVAILABLE' }
      ];
    }
    this.setUnitsData(mockUnits);
  }

  getAvailableUnits(): any[] {
    return this.projectUnits.filter(u => u.status === 'AVAILABLE');
  }

  getOtherUnits(): any[] {
    return this.projectUnits.filter(u => u.status !== 'AVAILABLE');
  }

  onUnitSelect(val: string): void {
    if (val === '__CUSTOM__') {
      this.customUnitMode = true;
      return;
    }
    this.customUnitMode = false;
    const unit = this.projectUnits.find(u => u.unit_number === val);
    if (unit) {
      this.selectedUnit = unit;
      this.selectedUnitNumber = unit.unit_number;
      this.discoveryData.shortlisted_units = `${unit.unit_number} (${unit.bhk_type} • ${unit.facing || 'East Facing'})`;
      this.discoveryData.booked_unit_number = unit.unit_number;
    }
  }

  switchToCustomUnit(): void {
    this.customUnitMode = true;
  }

  switchToDropdownUnit(): void {
    this.customUnitMode = false;
    if (this.selectedUnit) {
      this.selectedUnitNumber = this.selectedUnit.unit_number;
    } else if (this.getAvailableUnits().length > 0) {
      this.onUnitSelect(this.getAvailableUnits()[0].unit_number);
    }
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
