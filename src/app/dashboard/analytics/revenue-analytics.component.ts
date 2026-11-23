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

  // Two Interactive Visualization Filters
  selectedGraphTarget: 'all' | 'pipeline_funnel' | 'intent_bands' | 'source_performance' | 'owner_performance' | 'project_performance' = 'all';
  selectedGraphType: 'default' | 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'box' | 'heatmap' | 'treemap' = 'default';

  sectionGraphTypes: Record<string, string> = {
    pipeline_funnel: 'default',
    intent_bands: 'default',
    source_performance: 'default',
    owner_performance: 'default',
    project_performance: 'default'
  };

  graphTargets = [
    { value: 'all', label: 'All 5 Sections (Global Visualization)' },
    { value: 'pipeline_funnel', label: '1. Pipeline Funnel' },
    { value: 'intent_bands', label: '2. Intent Band Distribution' },
    { value: 'source_performance', label: '3. Source Performance' },
    { value: 'owner_performance', label: '4. Owner Performance' },
    { value: 'project_performance', label: '5. Project Performance' }
  ];

  graphTypes = [
    { value: 'default', label: 'Default View', icon: 'table_rows', desc: 'Standard tabular & funnel view' },
    { value: 'bar', label: 'Bar Charts', icon: 'bar_chart', desc: 'Comparative column & metric bars' },
    { value: 'line', label: 'Line Charts', icon: 'show_chart', desc: 'Continuous trend & conversion lines' },
    { value: 'pie', label: 'Pie Charts', icon: 'pie_chart', desc: 'Proportional share & distribution slices' },
    { value: 'scatter', label: 'Scatter Plots', icon: 'bubble_chart', desc: 'Volume vs intent correlation points' },
    { value: 'histogram', label: 'Histograms', icon: 'stacked_bar_chart', desc: 'Frequency distribution bins' },
    { value: 'box', label: 'Box Plots', icon: 'candlestick_chart', desc: 'Min, Q1, Median, Q3, Max spread' },
    { value: 'heatmap', label: 'Heatmaps', icon: 'grid_view', desc: 'Color intensity performance matrix' },
    { value: 'treemap', label: 'Treemaps', icon: 'dashboard', desc: 'Proportional nested volume tiles' }
  ];

  chartColors = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#64748b'  // Slate
  ];

  getColor(index: number): string {
    return this.chartColors[index % this.chartColors.length];
  }

  onGraphTargetChange(target: any): void {
    this.selectedGraphTarget = target;
    if (this.selectedGraphType !== 'default') {
      this.applyGraphTypeToTarget(this.selectedGraphType);
    }
  }

  onGraphTypeChange(type: any): void {
    this.selectedGraphType = type;
    this.applyGraphTypeToTarget(type);
  }

  applyGraphTypeToTarget(type: string): void {
    if (this.selectedGraphTarget === 'all') {
      Object.keys(this.sectionGraphTypes).forEach(key => {
        this.sectionGraphTypes[key] = type;
      });
    } else {
      this.sectionGraphTypes[this.selectedGraphTarget] = type;
    }
  }

  setSectionGraphType(sectionKey: string, type: string): void {
    this.sectionGraphTypes[sectionKey] = type;
  }

  getEffectiveGraphType(sectionKey: string): string {
    return this.sectionGraphTypes[sectionKey] || this.selectedGraphType || 'default';
  }

  resetGraphTypes(): void {
    this.selectedGraphTarget = 'all';
    this.selectedGraphType = 'default';
    Object.keys(this.sectionGraphTypes).forEach(key => {
      this.sectionGraphTypes[key] = 'default';
    });
  }

  getMaxValue(items: any[], key: string): number {
    if (!items || items.length === 0) return 1;
    const vals = items.map(d => Number(d[key] ?? d.count ?? d.buyers ?? 0));
    return Math.max(...vals, 1);
  }

  getLineChartData(items: any[], valueKey: string = 'count', width: number = 520, height: number = 180, pad: number = 32): {
    points: { x: number, y: number, name: string, val: number }[];
    polyPoints: string;
    areaPoints: string;
    maxVal: number;
  } {
    if (!items || items.length === 0) {
      return { points: [], polyPoints: '', areaPoints: '', maxVal: 0 };
    }
    const vals = items.map(d => {
      const v = d[valueKey] !== undefined ? d[valueKey] : (d.count !== undefined ? d.count : (d.buyers !== undefined ? d.buyers : 0));
      return Number(v) || 0;
    });
    const maxVal = Math.max(...vals, 1);
    const usableWidth = width - 2 * pad;
    const usableHeight = height - 2 * pad;
    const step = items.length > 1 ? usableWidth / (items.length - 1) : usableWidth / 2;

    const points = items.map((d, i) => {
      const v = Number(d[valueKey] !== undefined ? d[valueKey] : (d.count !== undefined ? d.count : (d.buyers !== undefined ? d.buyers : 0))) || 0;
      const x = pad + (items.length === 1 ? usableWidth / 2 : i * step);
      const y = height - pad - (v / maxVal) * usableHeight;
      const name = d.name || d.stage || d.label || `Item ${i + 1}`;
      return { x: Math.round(x), y: Math.round(y), name, val: v };
    });

    const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
    const firstX = points[0]?.x || pad;
    const lastX = points[points.length - 1]?.x || (width - pad);
    const baseY = height - pad;
    const areaPoints = `${firstX},${baseY} ` + polyPoints + ` ${lastX},${baseY}`;

    return { points, polyPoints, areaPoints, maxVal };
  }

  getPieChartSlices(items: any[], valueKey: string = 'count'): {
    name: string;
    val: number;
    pct: number;
    strokeDash: string;
    strokeOffset: string;
    color: string;
  }[] {
    if (!items || items.length === 0) return [];
    const circumference = 440; // 2 * PI * r (r = 70)
    const vals = items.map(d => {
      const v = d[valueKey] !== undefined ? d[valueKey] : (d.count !== undefined ? d.count : (d.buyers !== undefined ? d.buyers : 0));
      return Number(v) || 0;
    });
    const total = vals.reduce((sum, v) => sum + v, 0);

    let acc = 0;
    return items.map((d, i) => {
      const v = vals[i];
      const frac = total > 0 ? (v / total) : 0;
      const pct = Math.round(frac * 100);
      const strokeDash = `${(frac * circumference).toFixed(1)} ${circumference}`;
      const strokeOffset = (-acc * circumference).toFixed(1);
      acc += frac;
      return {
        name: d.name || d.stage || d.label || `Item ${i + 1}`,
        val: v,
        pct,
        strokeDash,
        strokeOffset,
        color: this.getColor(i)
      };
    });
  }

  getScatterPlotPoints(items: any[], xKey: string = 'buyers', yKey: string = 'high_intent', width: number = 500, height: number = 200, pad: number = 35): any[] {
    if (!items || items.length === 0) return [];
    const xVals = items.map(d => Number(d[xKey] ?? d.count ?? 0));
    const yVals = items.map(d => Number(d[yKey] ?? d.booked ?? d.count ?? 0));
    const maxX = Math.max(...xVals, 1);
    const maxY = Math.max(...yVals, 1);
    const usableW = width - 2 * pad;
    const usableH = height - 2 * pad;

    return items.map((d, i) => {
      const xVal = Number(d[xKey] ?? d.count ?? 0);
      const yVal = Number(d[yKey] ?? d.booked ?? d.count ?? 0);
      const cx = pad + (xVal / maxX) * usableW;
      const cy = height - pad - (yVal / maxY) * usableH;
      const r = Math.min(18, Math.max(7, 7 + (xVal / maxX) * 8));
      return {
        ...d,
        name: d.name || d.stage || d.label || `Point ${i + 1}`,
        cx: Math.round(cx),
        cy: Math.round(cy),
        r,
        xVal,
        yVal,
        color: this.getColor(i)
      };
    });
  }

  getHistogramBins(items: any[], valueKey: string = 'buyers'): {
    label: string;
    count: number;
    pct: number;
    names: string[];
  }[] {
    if (!items || items.length === 0) return [];
    const vals = items.map(d => Number(d[valueKey] ?? d.count ?? 0));
    const max = Math.max(...vals, 1);
    const numBins = 4;
    const step = Math.max(1, Math.ceil((max + 1) / numBins));

    const bins = [];
    for (let i = 0; i < numBins; i++) {
      const start = i * step;
      const end = (i + 1) * step - 1;
      const matched = items.filter(d => {
        const v = Number(d[valueKey] ?? d.count ?? 0);
        return i === numBins - 1 ? (v >= start && v <= max) : (v >= start && v <= end);
      });
      bins.push({
        label: i === numBins - 1 && max > end ? `${start}-${max}` : `${start}-${end}`,
        count: matched.length,
        pct: Math.round((matched.length / items.length) * 100),
        names: matched.map(d => d.name || d.stage || d.label)
      });
    }
    return bins;
  }

  getBoxPlotStats(items: any[], valueKey: string = 'buyers'): {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    iqr: number;
    avg: number;
    count: number;
  } {
    if (!items || items.length === 0) {
      return { min: 0, q1: 0, median: 0, q3: 0, max: 0, iqr: 0, avg: 0, count: 0 };
    }
    const vals = items
      .map(d => Number(d[valueKey] ?? d.count ?? 0))
      .sort((a, b) => a - b);
    const count = vals.length;
    const min = vals[0];
    const max = vals[count - 1];
    const avg = Math.round((vals.reduce((s, v) => s + v, 0) / count) * 10) / 10;

    const getPercentile = (p: number) => {
      const idx = (count - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const weight = idx - lower;
      return Math.round((vals[lower] * (1 - weight) + vals[upper] * weight) * 10) / 10;
    };

    const q1 = getPercentile(0.25);
    const median = getPercentile(0.5);
    const q3 = getPercentile(0.75);
    const iqr = Math.round((q3 - q1) * 10) / 10;

    return { min, q1, median, q3, max, iqr, avg, count };
  }

  getHeatmapMatrix(items: any[], section: string): {
    rowName: string;
    cols: { label: string; value: any; intensity: number }[];
  }[] {
    if (!items || items.length === 0) return [];
    if (section === 'pipeline_funnel') {
      const maxCount = Math.max(...items.map(d => Number(d.count) || 0), 1);
      return items.map(d => ({
        rowName: d.stage,
        cols: [
          { label: 'Count', value: d.count, intensity: Math.max(0.15, (Number(d.count) || 0) / maxCount) },
          { label: 'Drop-off', value: d.drop_off, intensity: d.drop_off.includes('-') ? 0.65 : 0.15 }
        ]
      }));
    }
    if (section === 'intent_bands') {
      const maxCount = Math.max(...items.map(d => Number(d.count) || 0), 1);
      return items.map(d => ({
        rowName: d.label,
        cols: [
          { label: 'Buyers', value: d.count, intensity: Math.max(0.15, (Number(d.count) || 0) / maxCount) },
          { label: 'Share', value: `${this.getIntentBandPct(d.count)}%`, intensity: Math.max(0.15, this.getIntentBandPct(d.count) / 100) }
        ]
      }));
    }
    // Performance tables
    const maxBuyers = Math.max(...items.map(d => Number(d.buyers) || 0), 1);
    const maxHigh = Math.max(...items.map(d => Number(d.high_intent) || 0), 1);
    const maxBooked = Math.max(...items.map(d => Number(d.booked) || 0), 1);

    return items.map(d => ({
      rowName: d.name,
      cols: [
        { label: 'Buyers', value: d.buyers, intensity: Math.max(0.12, (Number(d.buyers) || 0) / maxBuyers) },
        { label: 'High Intent', value: d.high_intent, intensity: Math.max(0.12, (Number(d.high_intent) || 0) / maxHigh) },
        { label: 'Booked', value: d.booked, intensity: Math.max(0.12, (Number(d.booked) || 0) / maxBooked) },
        { label: 'Revenue', value: d.revenue || d.revenue_at_risk || '₹0', intensity: (Number(d.booked) || 0) > 0 ? 0.8 : 0.12 }
      ]
    }));
  }

  getTreemapItems(items: any[], valueKey: string = 'count'): {
    name: string;
    val: number;
    pct: number;
    flexGrow: number;
    color: string;
  }[] {
    if (!items || items.length === 0) return [];
    const vals = items.map(d => {
      const v = d[valueKey] !== undefined ? d[valueKey] : (d.count !== undefined ? d.count : (d.buyers !== undefined ? d.buyers : 0));
      return Number(v) || 0;
    });
    const total = vals.reduce((s, v) => s + v, 0);

    return items.map((d, i) => {
      const v = vals[i];
      const frac = total > 0 ? (v / total) : 0;
      const pct = Math.round(frac * 100);
      return {
        name: d.name || d.stage || d.label || `Item ${i + 1}`,
        val: v,
        pct,
        flexGrow: Math.max(1, Math.round(frac * 100)),
        color: this.getColor(i)
      };
    });
  }

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
