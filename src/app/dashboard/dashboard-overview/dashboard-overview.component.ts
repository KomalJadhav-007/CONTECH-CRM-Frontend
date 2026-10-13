import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatTooltipModule, MatChipsModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css'
})

export class DashboardOverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;
  todayDateStr = '30 Sept 2026';

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
    top_revenue_leakage: [
      {
        buyer_name: 'Anand Bhagat',
        stage: 'High Intent',
        category: 'Unassigned High-Intent',
        reason: 'Score 91 buyer has no owner',
        at_risk: '₹2.18 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Anand Bhagat',
        stage: 'High Intent',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹2.18 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Suhas Kirloskar',
        stage: 'Negotiation',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹2.03 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Harish Menon',
        stage: 'Visit Completed',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹2.02 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Girish Naik',
        stage: 'Site Visit Scheduled',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹1.86 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Girish Naik',
        stage: 'Site Visit Scheduled',
        category: 'Visit At Risk',
        reason: 'Missing: Vehicle & driver confirmed',
        at_risk: '₹1.86 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Neha Agarwal',
        stage: 'Negotiation',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹1.65 Cr',
        severity: 'CRITICAL'
      },
      {
        buyer_name: 'Rahul Deshmukh',
        stage: 'Site Visit Scheduled',
        category: 'SLA Breach',
        reason: 'Next best action is past its due time',
        at_risk: '₹1.51 Cr',
        severity: 'CRITICAL'
      }
    ],
    high_intent_radar: [
      {
        buyer_name: 'Sneha Kulkarni',
        action: 'Assign owner and call within 15 minutes',
        time_ago: '40 days ago',
        score: 92,
        delta: 6
      },
      {
        buyer_name: 'Anand Bhagat',
        action: 'Buyer Score 91 - assign owner immediately',
        time_ago: '40 days ago',
        score: 91,
        delta: 6
      },
      {
        buyer_name: 'Deepa Sharma',
        action: 'Initiate booking paperwork',
        time_ago: '39 days ago',
        score: 90,
        delta: 2
      },
      {
        buyer_name: 'Rahul Deshmukh',
        action: 'Confirm Saturday site visit',
        time_ago: '39 days ago',
        score: 89,
        delta: 5
      },
      {
        buyer_name: 'Neha Agarwal',
        action: 'Manager intervention on price objection',
        time_ago: '40 days ago',
        score: 88,
        delta: 2
      },
      {
        buyer_name: 'Harish Menon',
        action: 'Share proposal and initiate negotiation',
        time_ago: '39 days ago',
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

