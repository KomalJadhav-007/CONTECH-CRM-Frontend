import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="audit-page-wrapper">
      <div class="audit-header">
        <div class="section-tag">ADMINISTRATION</div>
        <h1 class="page-title">Audit Log</h1>
        <p class="page-subtitle">
          Every privileged action is recorded with actor, module, record and before/after values. Entries cannot be edited or deleted.
        </p>
      </div>

      <div class="filter-row">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          class="search-input"
          placeholder="Search actor, action or record"
        />
        <select [(ngModel)]="selectedModule" class="module-select">
          <option value="all">All modules</option>
          <option value="buyers">Buyers</option>
          <option value="visits">Site Visits</option>
          <option value="settings">Settings</option>
          <option value="users">Team & Roles</option>
        </select>
      </div>

      <div class="empty-state-box">
        <div class="empty-title">No audit entries</div>
        <div class="empty-sub">Privileged changes will appear here.</div>
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
      margin-bottom: 2rem;
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
    .filter-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .search-input {
      width: 320px;
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.84rem;
      color: #0f172a;
      outline: none;
    }
    .module-select {
      width: 200px;
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.84rem;
      color: #0f172a;
      outline: none;
      background: #ffffff;
    }
    .empty-state-box {
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      padding: 5rem 2rem;
      text-align: center;
      background: #ffffff;
    }
    .empty-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }
    .empty-sub {
      font-size: 0.78rem;
      color: #64748b;
    }
  `]
})
export class AuditLogsComponent {
  searchQuery = '';
  selectedModule = 'all';
}
