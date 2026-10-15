import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BuyerService } from '../buyers/buyer.service';
import { DashboardService } from '../dashboard.service';
import { UserService } from '../../users/user.service';

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
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './high-intent-radar.component.html',
  styleUrl: './high-intent-radar.component.css'
})
export class HighIntentRadarComponent implements OnInit {
  private router = inject(Router);
  private buyerService = inject(BuyerService);
  private dashboardService = inject(DashboardService);
  private userService = inject(UserService);

  loading = true;

  stats = {
    very_high_intent: 4,
    unassigned_high_intent: 1,
    sla_breached: 1,
    revenue_at_risk_cr: '4.24'
  };

  selectedBand = 'all';
  selectedOwner = 'all';

  owners: string[] = ['Unassigned'];
  salesReps: any[] = [];
  buyers: any[] = [];

  ngOnInit(): void {
    this.loadOwners();
    this.loadStats();
    this.loadBuyers();
  }

  loadOwners(): void {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res && res.success && res.users) {
          this.salesReps = res.users.filter((u: any) => u.is_active !== false);
          this.owners = ['Unassigned', ...this.salesReps.map((r: any) => r.name)];
        }
      }
    });
  }

  loadStats(): void {
    this.dashboardService.getExecutiveStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats) {
          const s = res.stats;
          this.stats = {
            very_high_intent: s.high_intent_buyers || 4,
            unassigned_high_intent: s.unassigned_high_intent || 1,
            sla_breached: s.sla_breaches || 1,
            revenue_at_risk_cr: s.revenue_at_risk_cr || '4.24'
          };
        }
      }
    });
  }

  loadBuyers(): void {
    this.loading = true;
    this.buyerService.getBuyers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.buyers) {
          this.buyers = res.buyers.map((b: any) => {
            const minBudget = b.budget_min_lacs ? (b.budget_min_lacs / 100).toFixed(2) : ((b.budget_max_lacs * 0.8) / 100).toFixed(2);
            const maxBudget = (parseFloat(b.budget_max_lacs || 150) / 100).toFixed(2);
            const delta = Math.min(8, Math.max(2, Math.round(((b.digital_intent_score || 20) + (b.readiness_score || 20)) / 10)));

            let nextAction = 'Urgent: Schedule VIP site visit within 24 hours';
            if (b.lead_status === 'NEW') nextAction = 'Assign owner and initiate phone qualification';
            else if (b.lead_status === 'VISIT_SCHEDULED') nextAction = 'Confirm vehicle dispatch and 4-way checkmarks';
            else if (b.lead_status === 'VISIT_COMPLETED') nextAction = 'Send revised proposal & floor plan options';
            else if (b.lead_status === 'NEGOTIATION') nextAction = 'Manager intervention on pricing & token agreement';

            let dueStr = 'Today';
            if (b.created_at) {
              const diffHours = Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60));
              if (diffHours < 24) dueStr = `${diffHours} hours ago`;
              else dueStr = `${Math.floor(diffHours / 24)} days ago`;
            }

            return {
              id: b.buyer_id || b.id,
              name: b.full_name,
              stage: b.lead_status || 'New',
              source: b.lead_source || 'Website',
              score: b.intent_score || 50,
              delta: delta,
              budget: `₹${minBudget} Cr – ₹${maxBudget} Cr`,
              next_action: nextAction,
              due: dueStr,
              at_risk: `₹${maxBudget} Cr`,
              owner: b.assignedRep ? b.assignedRep.name : 'Unassigned',
              assigned_rep_id: b.assigned_rep_id
            };
          });
          this.recalculateStats();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  recalculateStats(): void {
    const veryHigh = this.buyers.filter(b => b.score >= 90).length;
    const unassigned = this.buyers.filter(b => b.owner === 'Unassigned' && b.score >= 71).length;
    this.stats.very_high_intent = veryHigh || this.stats.very_high_intent;
    this.stats.unassigned_high_intent = unassigned;
  }

  onOwnerChange(buyer: any): void {
    let repId: number | null = null;
    if (buyer.owner !== 'Unassigned') {
      const found = this.salesReps.find((r: any) => r.name === buyer.owner);
      if (found) repId = found.user_id || found.id;
    }

    this.buyerService.updateBuyer(buyer.id, { assigned_rep_id: repId }).subscribe({
      next: () => {
        buyer.assigned_rep_id = repId;
        this.recalculateStats();
      }
    });
  }

  get filteredBuyers(): any[] {
    return this.buyers.filter(b => {
      if (this.selectedBand !== 'all') {
        if (this.selectedBand === 'very_high' && b.score < 90) return false;
        if (this.selectedBand === 'high' && (b.score < 71 || b.score >= 90)) return false;
      }
      if (this.selectedOwner !== 'all' && b.owner !== this.selectedOwner) {
        return false;
      }
      return true;
    });
  }

  openBuyer(buyerId: number): void {
    this.router.navigate(['/buyers', buyerId]);
  }
}
