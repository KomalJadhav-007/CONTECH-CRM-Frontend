import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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

  // Time & Period Filters (Week and Month filters)
  selectedPeriod: 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom_month' | 'custom' = 'all';
  selectedMonth: number = new Date().getMonth() + 1; // 1-12
  selectedYear: number = new Date().getFullYear();
  customStartDate: string = '';
  customEndDate: string = '';
  showCustomDateInputs = false;
  filterLabel: string = 'All Time';

  monthsList = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  yearsList = [2026, 2025, 2024];

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

  setPeriod(period: 'all' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom'): void {
    this.selectedPeriod = period;
    if (period === 'custom') {
      this.showCustomDateInputs = true;
      return;
    }
    this.showCustomDateInputs = false;
    this.loadAnalytics();
  }

  onMonthSelect(monthVal: any): void {
    this.selectedMonth = parseInt(monthVal, 10);
    this.selectedPeriod = 'custom_month';
    this.showCustomDateInputs = false;
    this.loadAnalytics();
  }

  onYearSelect(yearVal: any): void {
    this.selectedYear = parseInt(yearVal, 10);
    if (this.selectedPeriod === 'custom_month') {
      this.loadAnalytics();
    }
  }

  applyCustomRange(): void {
    if (this.customStartDate && this.customEndDate) {
      this.selectedPeriod = 'custom';
      this.loadAnalytics();
    }
  }

  resetFilters(): void {
    this.selectedPeriod = 'all';
    this.customStartDate = '';
    this.customEndDate = '';
    this.showCustomDateInputs = false;
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    const params: any = {};

    if (this.selectedPeriod === 'this_week' || this.selectedPeriod === 'last_week' ||
        this.selectedPeriod === 'this_month' || this.selectedPeriod === 'last_month') {
      params.period = this.selectedPeriod;
    } else if (this.selectedPeriod === 'custom_month') {
      params.month = this.selectedMonth;
      params.year = this.selectedYear;
    } else if (this.selectedPeriod === 'custom' && this.customStartDate && this.customEndDate) {
      params.startDate = this.customStartDate;
      params.endDate = this.customEndDate;
    }

    this.dashboardService.getRevenueAnalytics(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.success && res.analytics) {
          this.analytics = res.analytics;
          if (res.analytics.filter_info?.label) {
            this.filterLabel = res.analytics.filter_info.label;
          } else {
            this.filterLabel = this.getFallbackFilterLabel();
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private getFallbackFilterLabel(): string {
    if (this.selectedPeriod === 'this_week') return 'This Week';
    if (this.selectedPeriod === 'last_week') return 'Last Week';
    if (this.selectedPeriod === 'this_month') return 'This Month';
    if (this.selectedPeriod === 'last_month') return 'Last Month';
    if (this.selectedPeriod === 'custom_month') {
      const m = this.monthsList.find(x => x.value === this.selectedMonth)?.name || '';
      return `${m} ${this.selectedYear}`;
    }
    if (this.selectedPeriod === 'custom') {
      return `${this.customStartDate} to ${this.customEndDate}`;
    }
    return 'All Time';
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
