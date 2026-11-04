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
    lead_to_visit_pct: 24,
    visits_scheduled_count: 6,
    total_visits: 6,
    visit_to_booking_pct: 17,
    bookings_count: 1,
    visits_completed_count: 2,
    recovery_rate_pct: 100,
    cancelled_count: 1,
    no_shows_count: 0,
    sla_compliance_pct: 86,
    sla_breaches_count: 1,
    total_buyers: 25,
    high_intent: 20,
    open_follow_ups: 6,
    overdue_follow_ups: 3,
    revenue_at_risk_cr: '45.20',
    pipeline_funnel: [
      { stage: 'New', count: 25, max_count: 25, drop_off: '0%' },
      { stage: 'Contacted', count: 21, max_count: 25, drop_off: '-16%' },
      { stage: 'Qualified', count: 12, max_count: 25, drop_off: '-43%' },
      { stage: 'High Intent', count: 20, max_count: 25, drop_off: '0%' },
      { stage: 'Site Visit Scheduled', count: 6, max_count: 25, drop_off: '-70%' },
      { stage: 'Visit Completed', count: 2, max_count: 25, drop_off: '-67%' },
      { stage: 'Negotiation', count: 2, max_count: 25, drop_off: '0%' },
      { stage: 'Booking Intent', count: 1, max_count: 25, drop_off: '-50%' },
      { stage: 'Booked', count: 1, max_count: 25, drop_off: '0%' }
    ],
    intent_bands: [
      { label: 'VERY HIGH INTENT', count: 6 },
      { label: 'HIGH INTENT', count: 14 },
      { label: 'QUALIFIED', count: 4 },
      { label: 'EMERGING', count: 1 },
      { label: 'LOW', count: 0 }
    ],
    source_performance: [
      { name: 'Instagram', buyers: 25, high_intent: 20, booked: 1, revenue: '₹1.95 Cr' }
    ],
    owner_performance: [
      { name: 'Amit Verma (Account Executive)', buyers: 23, high_intent: 18, booked: 1, revenue: '₹1.95 Cr' },
      { name: 'Priya Nair (Sales Manager)', buyers: 1, high_intent: 1, booked: 0, revenue: '₹0' },
      { name: 'Unassigned Leads', buyers: 1, high_intent: 1, booked: 0, revenue: '₹0' }
    ],
    project_performance: [
      { name: 'Contech Crown Heights', buyers: 5, high_intent: 5, booked: 1, revenue_at_risk: '₹11.25 Cr' },
      { name: 'Contech Skyline Elegance', buyers: 5, high_intent: 4, booked: 0, revenue_at_risk: '₹10.35 Cr' },
      { name: 'Contech Greenfield Sanctuary', buyers: 5, high_intent: 4, booked: 0, revenue_at_risk: '₹9.20 Cr' },
      { name: 'Contech Emerald Meadows Plotted Layout', buyers: 5, high_intent: 4, booked: 0, revenue_at_risk: '₹9.25 Cr' },
      { name: 'Contech Business Square', buyers: 5, high_intent: 4, booked: 0, revenue_at_risk: '₹9.50 Cr' }
    ]
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
