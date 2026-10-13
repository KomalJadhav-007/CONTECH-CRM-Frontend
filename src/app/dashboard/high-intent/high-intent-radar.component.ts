import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-high-intent-radar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule
  ],
  templateUrl: './high-intent-radar.component.html',
  styleUrl: './high-intent-radar.component.css'
})
export class HighIntentRadarComponent implements OnInit {
  private router = inject(Router);

  stats = {
    very_high_intent: 8,
    unassigned_high_intent: 2,
    sla_breached: 0,
    revenue_at_risk_cr: '13.09'
  };

  selectedBand = 'all';
  selectedOwner = 'all';

  owners = [
    'Unassigned',
    'Amit Kulkarni',
    'Ganesh Pawar',
    'Kavya Rao',
    'Meera Iyer',
    'Nikhil Shinde',
    'Priya Nair',
    'Rajeev Menon',
    'Rohit Patil',
    'Sarika Bhosale',
    'Sneha Joshi'
  ];

  buyers = [
    {
      id: 1,
      name: 'Sneha Kulkarni',
      stage: 'Qualified',
      source: 'SimpliQualify',
      score: 92,
      delta: 6,
      budget: '₹1.80 Cr – ₹2.00 Cr',
      next_action: 'Assign owner and call within 15 minutes',
      due: '40 days ago',
      at_risk: '₹1.43 Cr',
      owner: 'Unassigned'
    },
    {
      id: 2,
      name: 'Anand Bhagat',
      stage: 'High Intent',
      source: 'Google Ads',
      score: 91,
      delta: 6,
      budget: '₹3.00 Cr – ₹3.50 Cr',
      next_action: 'Buyer Score 91 - assign owner immediately',
      due: '40 days ago',
      at_risk: '₹2.18 Cr',
      owner: 'Unassigned'
    },
    {
      id: 3,
      name: 'Deepa Sharma',
      stage: 'Booking Intent',
      source: 'Referral',
      score: 90,
      delta: 2,
      budget: '₹1.30 Cr – ₹1.50 Cr',
      next_action: 'Initiate booking paperwork',
      due: '39 days ago',
      at_risk: '₹1.23 Cr',
      owner: 'Sneha Joshi'
    },
    {
      id: 4,
      name: 'Rahul Deshmukh',
      stage: 'Site Visit Scheduled',
      source: 'SimpliQualify',
      score: 89,
      delta: 5,
      budget: '₹2.00 Cr – ₹2.30 Cr',
      next_action: 'Confirm Saturday site visit',
      due: '39 days ago',
      at_risk: '₹1.51 Cr',
      owner: 'Amit Kulkarni'
    },
    {
      id: 5,
      name: 'Neha Agarwal',
      stage: 'Negotiation',
      source: 'Instagram',
      score: 88,
      delta: 2,
      budget: '₹2.60 Cr – ₹2.90 Cr',
      next_action: 'Manager intervention on price objection',
      due: '40 days ago',
      at_risk: '₹1.65 Cr',
      owner: 'Kavya Rao'
    },
    {
      id: 6,
      name: 'Harish Menon',
      stage: 'Visit Completed',
      source: 'Referral',
      score: 87,
      delta: 2,
      budget: '₹2.90 Cr – ₹3.30 Cr',
      next_action: 'Share proposal and initiate negotiation',
      due: '40 days ago',
      at_risk: '₹2.02 Cr',
      owner: 'Sneha Joshi'
    }
  ];

  ngOnInit(): void {
    this.recalculateStats();
  }

  recalculateStats() {
    const unassigned = this.buyers.filter(b => b.owner === 'Unassigned' && b.score >= 85).length;
    this.stats.unassigned_high_intent = unassigned;
  }

  onOwnerChange() {
    this.recalculateStats();
  }

  get filteredBuyers() {
    return this.buyers.filter(b => {
      if (this.selectedBand !== 'all') {
        if (this.selectedBand === 'very_high' && b.score < 90) return false;
        if (this.selectedBand === 'high' && (b.score < 85 || b.score >= 90)) return false;
      }
      if (this.selectedOwner !== 'all' && b.owner !== this.selectedOwner) {
        return false;
      }
      return true;
    });
  }

  openBuyer(buyerId: number) {
    this.router.navigate(['/buyers', buyerId]);
  }
}
