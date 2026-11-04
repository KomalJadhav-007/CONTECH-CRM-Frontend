import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatBadgeModule
  ],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css'
})

export class DashboardOverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;
  todayDateStr = '30 Sept 2026';

  // Pagination for Top Revenue Leakage
  leakageCurrentPage = 1;
  leakagePageSize = 5;

  get totalLeakagePages(): number {
    return Math.max(1, Math.ceil((this.stats.top_revenue_leakage || []).length / this.leakagePageSize));
  }

  get pagedLeakage(): any[] {
    const start = (this.leakageCurrentPage - 1) * this.leakagePageSize;
    return (this.stats.top_revenue_leakage || []).slice(start, start + this.leakagePageSize);
  }

  stats: any = {
    revenue_at_risk_cr: '60.97',
    open_leakage_items: 66,
    high_intent_buyers: 17,
    unassigned_high_intent: 3,
    sla_breaches: 31,
    visits_at_risk: 5,
    scheduled_today: 0,
    active_pipeline: 32,
    open_alerts: 10,
    open_follow_ups: 8,
    overdue_follow_ups: 8,
    pipeline_value_cr: '50.51',
    todays_visits: [],
    top_revenue_leakage: [
      {
        buyer_name: 'Rohiet Kumar',
        stage: 'High Intent',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹3.10 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Debashish',
        stage: 'High Intent',
        category: 'Unassigned High-Intent',
        reason: 'Score 95 buyer has no assigned owner',
        at_risk: '₹2.80 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Prasshanth Unnibhavi',
        stage: 'Negotiation',
        category: 'SLA Breach',
        reason: 'Commercial terms review pending',
        at_risk: '₹2.40 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Rahool Bhosale',
        stage: 'Visit Completed',
        category: 'SLA Breach',
        reason: 'Post-visit SLA turnaround countdown breached',
        at_risk: '₹2.30 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Jaywant Patil',
        stage: 'Site Visit Scheduled',
        category: 'SLA Breach',
        reason: 'Milestone payment schedule dispatch overdue',
        at_risk: '₹2.25 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'sachin Jadhav',
        stage: 'Qualified',
        category: 'SLA Breach',
        reason: 'Follow-up strategy call overdue',
        at_risk: '₹2.20 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Raj Kamal',
        stage: 'High Intent',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹2.15 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Santosh Karkhanis',
        stage: 'Site Visit Scheduled',
        category: 'Visit At Risk',
        reason: 'Missing driver confirmation',
        at_risk: '₹2.10 Cr',
        severity: 'CRITICAL'
      }
    ],
    high_intent_radar: [
      {
        buyer_name: 'Rohiet Kumar',
        action: 'Confirm cab & dispatch visit schedule',
        time_ago: 'Just now',
        score: 96,
        delta: 6
      },
      {
        buyer_name: 'Debashish',
        action: 'Buyer Score 95 - assign owner immediately',
        time_ago: '1 hour ago',
        score: 95,
        delta: 6
      },
      {
        buyer_name: 'Prasshanth Unnibhavi',
        action: 'Initiate booking paperwork & pricing draft',
        time_ago: '3 hours ago',
        score: 89,
        delta: 4
      },
      {
        buyer_name: 'Jaywant Patil',
        action: 'Confirm Saturday site visit & unit shortlist',
        time_ago: '4 hours ago',
        score: 88,
        delta: 4
      },
      {
        buyer_name: 'Rahool Bhosale',
        action: 'Manager intervention on plot pricing',
        time_ago: '5 hours ago',
        score: 88,
        delta: 3
      },
      {
        buyer_name: 'Santosh Karkhanis',
        action: 'Share proposal and initiate negotiation',
        time_ago: '6 hours ago',
        score: 87,
        delta: 2
      }
    ]
  };

  ngOnInit(): void {
    const today = new Date();
    this.todayDateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getExecutiveStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.stats) {
          this.stats = { ...this.stats, ...res.stats };
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

