import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrl: './dashboard-overview.component.css'
})
export class DashboardOverviewComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = true;
  stats: any = {
    total_buyers: 0,
    high_intent_buyers: 0,
    active_site_visits: 0,
    completed_site_visits: 0,
    booked_deals: 0,
    total_pipeline_cr: '0.00',
    booked_revenue_cr: '0.00',
    conversion_rate_percent: 0,
    objections_breakdown: {}
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.dashboardService.getExecutiveStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.stats = res.stats;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getObjectionKeys(): string[] {
    return Object.keys(this.stats.objections_breakdown || {});
  }
}
