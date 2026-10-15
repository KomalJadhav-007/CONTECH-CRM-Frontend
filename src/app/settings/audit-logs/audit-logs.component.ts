import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SettingsService } from '../settings.service';
import { AlertService } from '../../shared/alert.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private alertService = inject(AlertService);

  activeTab: 'AUDIT_LOGS' | 'IN_APP_ALERTS' = 'AUDIT_LOGS';
  searchQuery = '';
  selectedModule = 'all';
  loading = false;
  logs: any[] = [];
  alerts: any[] = [];
  unackAlertsCount = 0;
  criticalAlertsCount = 0;

  ngOnInit(): void {
    this.loadAuditLogs();
    this.loadAlerts();
  }

  refreshCurrentTab(): void {
    if (this.activeTab === 'AUDIT_LOGS') {
      this.loadAuditLogs();
    } else {
      this.loadAlerts();
    }
  }

  loadAuditLogs(): void {
    this.loading = true;
    this.settingsService.getAuditLogs().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.logs) {
          this.logs = res.logs;
        } else {
          this.logs = [];
        }
      },
      error: () => {
        this.loading = false;
        this.logs = [];
      }
    });
  }

  loadAlerts(): void {
    this.loading = true;
    this.alertService.getAlerts().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.alerts) {
          this.alerts = res.alerts;
          this.unackAlertsCount = res.unacknowledged_count || 0;
          this.criticalAlertsCount = res.critical_count || 0;
        } else {
          this.alerts = [];
        }
      },
      error: () => {
        this.loading = false;
        this.alerts = [];
      }
    });
  }

  ackAlert(alert: any): void {
    this.alertService.acknowledgeAlert(alert.id).subscribe({
      next: () => {
        alert.is_acknowledged = true;
        this.unackAlertsCount = Math.max(0, this.unackAlertsCount - 1);
      }
    });
  }

  resolveAlert(alert: any): void {
    this.alertService.resolveAlert(alert.id, 'Resolved in Audit Center').subscribe({
      next: () => {
        alert.is_resolved = true;
        alert.is_acknowledged = true;
        this.unackAlertsCount = Math.max(0, this.unackAlertsCount - 1);
      }
    });
  }

  onFilterChange(): void {
    // Client-side filtering is instant with filteredLogs getter
  }

  get filteredLogs(): any[] {
    return this.logs.filter(log => {
      if (this.selectedModule !== 'all') {
        const mod = (log.module || '').toUpperCase();
        const sel = this.selectedModule.toUpperCase();
        if (!mod.includes(sel)) return false;
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const match =
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.module && log.module.toLowerCase().includes(q)) ||
          (log.user?.name && log.user.name.toLowerCase().includes(q)) ||
          (log.user?.email && log.user.email.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }

  countByModule(modules: string[]): number {
    return this.logs.filter(l => modules.some(m => (l.module || '').toUpperCase().includes(m))).length;
  }

  getModuleBadgeClass(mod: string): string {
    const m = (mod || '').toUpperCase();
    if (m.includes('SETTING') || m.includes('ACCESS')) return 'badge-settings';
    if (m.includes('BUYER')) return 'badge-buyers';
    if (m.includes('VISIT')) return 'badge-visits';
    if (m.includes('PROJECT')) return 'badge-projects';
    if (m.includes('USER') || m.includes('TEAM') || m.includes('AUTH')) return 'badge-users';
    return 'badge-default';
  }
}
