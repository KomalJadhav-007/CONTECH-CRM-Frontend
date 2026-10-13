import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-revenue-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatTableModule, MatProgressBarModule],
  templateUrl: './revenue-analytics.component.html',
  styleUrl: './revenue-analytics.component.css'
})

export class RevenueAnalyticsComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;

  analytics: any = {
    lead_to_visit_pct: 31,
    visits_scheduled_count: 10,
    visit_to_booking_pct: 0,
    bookings_count: 0,
    visits_completed_count: 2,
    recovery_rate_pct: 0,
    cancelled_count: 1,
    no_shows_count: 1,
    sla_compliance_pct: 100,
    sla_breaches_count: 0,
    total_buyers: 32,
    high_intent: 17,
    open_follow_ups: 8,
    overdue_follow_ups: 8,
    revenue_at_risk_cr: '25.84',
    pipeline_funnel: [
      { stage: 'New', count: 29, max_count: 29, drop_off: '-21%' },
      { stage: 'Contacted', count: 23, max_count: 29, drop_off: '-22%' },
      { stage: 'Qualified', count: 18, max_count: 29, drop_off: '-33%' },
      { stage: 'High Intent', count: 12, max_count: 29, drop_off: '-17%' },
      { stage: 'Site Visit Scheduled', count: 10, max_count: 29, drop_off: '-40%' },
      { stage: 'Visit Completed', count: 6, max_count: 29, drop_off: '-50%' },
      { stage: 'Negotiation', count: 3, max_count: 29, drop_off: '-67%' },
      { stage: 'Booking Intent', count: 1, max_count: 29, drop_off: '-100%' },
      { stage: 'Booked', count: 0, max_count: 29, drop_off: '-0%' }
    ],
    intent_bands: [
      { label: 'VERY HIGH INTENT', count: 8 },
      { label: 'HIGH INTENT', count: 9 },
      { label: 'QUALIFIED', count: 8 },
      { label: 'EMERGING', count: 4 },
      { label: 'LOW', count: 3 }
    ],
    source_performance: [
      { name: 'SimpliQualify', buyers: 4, high_intent: 3, booked: 0, revenue: '₹0' },
      { name: 'Website', buyers: 4, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'Google Ads', buyers: 3, high_intent: 1, booked: 0, revenue: '₹0' },
      { name: 'Referral', buyers: 3, high_intent: 3, booked: 0, revenue: '₹0' },
      { name: 'Instagram', buyers: 3, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'Property Portal', buyers: 3, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'WhatsApp', buyers: 3, high_intent: 1, booked: 0, revenue: '₹0' },
      { name: 'Walk-in', buyers: 3, high_intent: 0, booked: 0, revenue: '₹0' },
      { name: 'Meta Ads', buyers: 2, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'Channel Partner', buyers: 2, high_intent: 1, booked: 0, revenue: '₹0' },
      { name: 'Phone', buyers: 2, high_intent: 0, booked: 0, revenue: '₹0' }
    ],
    owner_performance: [
      { name: 'Sneha Joshi', buyers: 6, high_intent: 4, booked: 0, revenue: '₹0' },
      { name: 'Unassigned', buyers: 5, high_intent: 3, booked: 0, revenue: '₹0' },
      { name: 'Amit Kulkarni', buyers: 5, high_intent: 3, booked: 0, revenue: '₹0' },
      { name: 'Kavya Rao', buyers: 5, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'Rohit Patil', buyers: 5, high_intent: 3, booked: 0, revenue: '₹0' },
      { name: 'Nikhil Shinde', buyers: 5, high_intent: 2, booked: 0, revenue: '₹0' },
      { name: 'Meera Iyer', buyers: 1, high_intent: 0, booked: 0, revenue: '₹0' }
    ],
    project_performance: [
      { name: 'Skyline Heights', buyers: 7, high_intent: 5, booked: 0, revenue_at_risk: '₹8.28 Cr' },
      { name: 'Riverfront Residences', buyers: 6, high_intent: 3, booked: 0, revenue_at_risk: '₹4.09 Cr' },
      { name: 'Urban Crest', buyers: 6, high_intent: 3, booked: 0, revenue_at_risk: '₹3.29 Cr' },
      { name: 'Parkside Enclave', buyers: 6, high_intent: 2, booked: 0, revenue_at_risk: '₹4.50 Cr' }
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
}
