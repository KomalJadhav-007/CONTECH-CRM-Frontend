import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="audit-page-wrapper">
      <div class="audit-header">
        <div class="header-left">
          <div class="section-tag">ADMINISTRATION</div>
          <h1 class="page-title">Audit Log</h1>
          <p class="page-subtitle">
            Every privileged action is recorded with actor, module, record and before/after values. Entries cannot be edited or deleted.
          </p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-refresh" (click)="loadAuditLogs()">🔄 Refresh Logs</button>
        </div>
      </div>

      <!-- 4 Audit Summary Cards -->
      <div class="audit-stats-grid">
        <div class="stat-card">
          <div class="card-label">TOTAL AUDIT EVENTS</div>
          <div class="card-value">{{ logs.length }}</div>
        </div>
        <div class="stat-card">
          <div class="card-label">SECURITY & ACCESS</div>
          <div class="card-value">{{ countByModule(['SETTINGS', 'ACCESS_CONTROL']) }}</div>
        </div>
        <div class="stat-card">
          <div class="card-label">PIPELINE & PROSPECTS</div>
          <div class="card-value">{{ countByModule(['BUYERS', 'VISITS']) }}</div>
        </div>
        <div class="stat-card">
          <div class="card-label">INTEGRITY STATUS</div>
          <div class="card-value text-emerald">100% Immutable</div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-row">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onFilterChange()"
          class="search-input"
          placeholder="Search actor, action or record details"
        />
        <select [(ngModel)]="selectedModule" (ngModelChange)="onFilterChange()" class="module-select">
          <option value="all">All modules</option>
          <option value="BUYERS">Buyers / Pipeline</option>
          <option value="VISITS">Site Visits</option>
          <option value="SETTINGS">Settings &amp; Access Control</option>
          <option value="PROJECTS">Projects</option>
          <option value="USERS">Team &amp; Roles</option>
          <option value="CONTROL_TOWER">Control Tower</option>
        </select>
      </div>

      <!-- Logs Table -->
      <div class="table-card" *ngIf="filteredLogs.length > 0">
        <div class="table-responsive">
          <table class="audit-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTOR</th>
                <th>MODULE</th>
                <th>ACTION</th>
                <th>DETAILS &amp; AUDIT TRAIL</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of filteredLogs">
                <td class="time-cell">
                  {{ log.created_at | date:'medium' }}
                </td>
                <td>
                  <div class="actor-name">{{ log.user?.name || 'System Admin' }}</div>
                  <div class="actor-email">{{ log.user?.email || 'admin@contechcrm.com' }}</div>
                </td>
                <td>
                  <span class="module-badge" [ngClass]="getModuleBadgeClass(log.module)">
                    {{ log.module }}
                  </span>
                </td>
                <td>
                  <span class="action-tag">{{ log.action }}</span>
                </td>
                <td class="details-cell">
                  <div class="details-text">{{ log.details }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State Box -->
      <div class="empty-state-box" *ngIf="!loading && filteredLogs.length === 0">
        <div class="empty-title">No audit entries found</div>
        <div class="empty-sub">No privileged changes match your search or module filter.</div>
      </div>

      <div class="loading-state" *ngIf="loading">
        Loading audit events from database...
      </div>
    </div>
  `,
  styles: [`
    .audit-page-wrapper {
      padding: 2.25rem 2.5rem;
      max-width: 1560px;
      margin: 0 auto;
      font-family: var(--font-main);
      color: #0f172a;
    }
    .audit-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
    }
    .section-tag {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.22em;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 0.35rem;
    }
    .page-title {
      font-size: 1.55rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .page-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 0.35rem;
      line-height: 1.45;
    }
    .btn-refresh {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-refresh:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
    .audit-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 85px;
    }
    .card-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      text-transform: uppercase;
    }
    .card-value {
      font-size: 1.45rem;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0.25rem;
    }
    .text-emerald {
      color: #059669;
      font-size: 1.15rem;
    }
    .filter-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .search-input {
      width: 360px;
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.84rem;
      color: #0f172a;
      outline: none;
      background: #ffffff;
    }
    .search-input:focus {
      border-color: #0f172a;
    }
    .module-select {
      width: 240px;
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.84rem;
      color: #0f172a;
      outline: none;
      background: #ffffff;
    }
    .table-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0;
      margin-bottom: 2rem;
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .audit-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
    }
    .audit-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.68rem;
      font-weight: 700;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: #f8fafc;
    }
    .audit-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
      vertical-align: middle;
    }
    .time-cell {
      white-space: nowrap;
      font-size: 0.76rem;
      color: #64748b;
      font-variant-numeric: tabular-nums;
    }
    .actor-name {
      font-weight: 600;
      color: #0f172a;
      font-size: 0.82rem;
    }
    .actor-email {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.1rem;
    }
    .module-badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .badge-settings {
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
    }
    .badge-buyers {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-visits {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    .badge-projects {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-users {
      background: #fae8ff;
      color: #a21caf;
      border: 1px solid #f5d0fe;
    }
    .badge-default {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .action-tag {
      font-family: monospace;
      font-size: 0.74rem;
      font-weight: 600;
      background: #f8fafc;
      padding: 0.2rem 0.45rem;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
      color: #0f172a;
    }
    .details-cell {
      max-width: 500px;
    }
    .details-text {
      color: #1e293b;
      line-height: 1.4;
      font-size: 0.78rem;
    }
    .empty-state-box {
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      padding: 5rem 2rem;
      text-align: center;
      background: #ffffff;
    }
    .empty-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }
    .empty-sub {
      font-size: 0.8rem;
      color: #64748b;
    }
    .loading-state {
      padding: 3rem;
      text-align: center;
      color: #64748b;
      font-size: 0.85rem;
    }
    @media (max-width: 1024px) {
      .audit-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  searchQuery = '';
  selectedModule = 'all';
  loading = false;
  logs: any[] = [];

  ngOnInit(): void {
    this.loadAuditLogs();
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
