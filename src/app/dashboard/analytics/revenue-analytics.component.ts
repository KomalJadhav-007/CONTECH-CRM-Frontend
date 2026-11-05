import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-revenue-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './revenue-analytics.component.html',
  styleUrl: './revenue-analytics.component.css'
})

export class RevenueAnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;

  analytics: any = {
    lead_to_visit_pct: 0,
    visits_scheduled_count: 0,
    total_visits: 0,
    visit_to_booking_pct: 0,
    bookings_count: 0,
    visits_completed_count: 0,
    recovery_rate_pct: 0,
    cancelled_count: 0,
    no_shows_count: 0,
    sla_compliance_pct: 100,
    sla_breaches_count: 0,
    total_buyers: 0,
    high_intent: 0,
    open_follow_ups: 0,
    overdue_follow_ups: 0,
    revenue_at_risk_cr: '0.00',
    pipeline_funnel: [],
    intent_bands: [],
    source_performance: [],
    owner_performance: [],
    project_performance: []
  };

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.dashboardService.getRevenueAnalytics().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.analytics) {
          this.analytics = res.analytics;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getFunnelWidth(count: number, maxCount: number): number {
    if (!maxCount || maxCount === 0) return 0;
    return Math.round((count / maxCount) * 100);
  }

  getIntentBandPct(count: number): number {
    const total = this.analytics.total_buyers || 1;
    return Math.min(100, Math.round((count / total) * 100));
  }

  getBandColorClass(label: string): string {
    const l = (label || '').toUpperCase();
    if (l.includes('VERY HIGH')) return 'emerald';
    if (l.includes('HIGH')) return 'blue';
    if (l.includes('QUALIFIED')) return 'indigo';
    if (l.includes('EMERGING')) return 'amber';
    return 'slate';
  }

  getHighIntentSharePct(): number {
    if (!this.analytics.intent_bands || this.analytics.intent_bands.length < 2) return 0;
    const high = (this.analytics.intent_bands[0]?.count || 0) + (this.analytics.intent_bands[1]?.count || 0);
    const total = this.analytics.total_buyers || 1;
    return Math.min(100, Math.round((high / total) * 100));
  }
}
