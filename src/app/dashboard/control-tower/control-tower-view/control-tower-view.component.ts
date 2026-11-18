import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ControlTowerService } from '../control-tower.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { UserService } from '../../../users/user.service';

@Component({
  selector: 'app-control-tower-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './control-tower-view.component.html',
  styleUrl: './control-tower-view.component.css'
})
export class ControlTowerViewComponent implements OnInit, OnDestroy {
  private controlTowerService = inject(ControlTowerService);
  private userService = inject(UserService);
  private scanSub?: Subscription;

  loading = true;
  radarData: any = {
    summary: {
      neglected_buyers_count: 0,
      revenue_at_risk_lacs: 0,
      at_risk_visits_today: 0,
      overdue_tasks_count: 0,
      health_score: 100
    },
    neglected_buyers: [],
    at_risk_visits: [],
    overdue_tasks: []
  };

  salesReps: any[] = [];
  selectedBuyerForRescue: any = null;
  reassignedRepId: any = 3;
  rescueActionNotes = 'Reassigned to active senior rep for urgent priority callback';
  resolving = false;
  isScanning = false;
  successMessage = '';

  // Unified Multi-Field Search (Buyer Name, Phone, Representative, Project)
  globalSearchQuery = '';
  buyerSearchQuery = '';

  onSearchChange(query: string): void {
    const val = query || '';
    this.globalSearchQuery = val;
    this.buyerSearchQuery = val;
    this.buyerPage = 1;
    this.visitPage = 1;
    this.taskPage = 1;
  }

  clearSearch(): void {
    this.onSearchChange('');
  }

  // Neglected Buyers Pagination & Search
  buyerPage = 1;
  buyerPageSize = 10;

  get filteredNeglectedBuyers(): any[] {
    const list = this.radarData?.neglected_buyers || [];
    const rawQuery = (this.globalSearchQuery || this.buyerSearchQuery || '').trim().toLowerCase();
    if (!rawQuery) {
      return list;
    }
    const cleanDigits = rawQuery.replace(/\D/g, '');

    return list.filter((b: any) => {
      const name = (b.full_name || b.name || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      const phoneDigits = (b.phone || '').replace(/\D/g, '');
      const rep = (b.assignedRep?.name || b.salesRep?.name || b.assigned_rep_name || (b.assigned_rep_id ? '' : 'unassigned')).toLowerCase();
      const timeframe = (b.buying_timeframe || '').toLowerCase();
      const proj = (this.getBuyerProjectName(b) || '').toLowerCase();

      return (
        name.includes(rawQuery) ||
        phone.includes(rawQuery) ||
        (cleanDigits.length >= 3 && phoneDigits.includes(cleanDigits)) ||
        rep.includes(rawQuery) ||
        timeframe.includes(rawQuery) ||
        proj.includes(rawQuery)
      );
    });
  }

  // At-Risk Site Visits Pagination & Search
  visitPage = 1;
  visitPageSize = 10;

  get filteredVisits(): any[] {
    const list = this.radarData?.at_risk_visits || [];
    const rawQuery = (this.globalSearchQuery || this.buyerSearchQuery || '').trim().toLowerCase();
    if (!rawQuery) {
      return list;
    }
    const cleanDigits = rawQuery.replace(/\D/g, '');

    return list.filter((v: any) => {
      const buyerName = (v.buyer?.full_name || v.buyer?.name || v.buyer_name || '').toLowerCase();
      const phone = (v.buyer?.phone || v.phone || '').toLowerCase();
      const phoneDigits = (v.buyer?.phone || v.phone || '').replace(/\D/g, '');
      const rep = (v.salesRep?.name || v.assignedRep?.name || v.sales_rep_name || (v.sales_rep_id ? '' : 'unassigned')).toLowerCase();
      const driver = (v.driver?.name || v.driver_name || '').toLowerCase();
      const slot = (v.time_slot || '').toLowerCase();
      const proj = (this.getVisitProjectName(v) || '').toLowerCase();

      return (
        buyerName.includes(rawQuery) ||
        phone.includes(rawQuery) ||
        (cleanDigits.length >= 3 && phoneDigits.includes(cleanDigits)) ||
        rep.includes(rawQuery) ||
        driver.includes(rawQuery) ||
        slot.includes(rawQuery) ||
        proj.includes(rawQuery)
      );
    });
  }

  // Overdue Follow-up Tasks Pagination & Search
  taskPage = 1;
  taskPageSize = 10;

  get filteredTasks(): any[] {
    const list = this.radarData?.overdue_tasks || [];
    const rawQuery = (this.globalSearchQuery || this.buyerSearchQuery || '').trim().toLowerCase();
    if (!rawQuery) {
      return list;
    }
    const cleanDigits = rawQuery.replace(/\D/g, '');

    return list.filter((t: any) => {
      const title = (t.title || '').toLowerCase();
      const buyerName = (t.buyer?.full_name || t.buyer?.name || t.buyer_name || '').toLowerCase();
      const phone = (t.buyer?.phone || t.phone || '').toLowerCase();
      const phoneDigits = (t.buyer?.phone || t.phone || '').replace(/\D/g, '');
      const rep = (t.assignedUser?.name || t.salesRep?.name || t.assigned_rep_name || (t.assigned_user_id ? '' : 'unassigned')).toLowerCase();
      const proj = (this.getTaskProjectName(t) || '').toLowerCase();

      return (
        title.includes(rawQuery) ||
        buyerName.includes(rawQuery) ||
        phone.includes(rawQuery) ||
        (cleanDigits.length >= 3 && phoneDigits.includes(cleanDigits)) ||
        rep.includes(rawQuery) ||
        proj.includes(rawQuery)
      );
    });
  }

  getTaskProjectName(task: any): string {
    if (task.project_name) return task.project_name;
    if (task.project?.name) return task.project.name;
    if (task.buyer?.project?.name) return task.buyer.project.name;
    if (task.buyer?.preferred_project) return task.buyer.preferred_project;
    if (task.siteVisit?.project?.name) return task.siteVisit.project.name;
    return 'General Project';
  }

  getTaskProjectLocation(task: any): string {
    if (task.project_location) return task.project_location;
    if (task.project?.location) return task.project.location;
    if (task.buyer?.project?.location) return task.buyer.project.location;
    if (task.siteVisit?.project?.location) return task.siteVisit.project.location;
    return '';
  }

  getTaskProjectCode(task: any): string {
    if (task.project_code) return task.project_code;
    if (task.project?.code) return task.project.code;
    if (task.buyer?.project?.code) return task.buyer.project.code;
    if (task.siteVisit?.project?.code) return task.siteVisit.project.code;
    return '';
  }

  getBuyerProjectName(buyer: any): string {
    if (buyer.project_name) return buyer.project_name;
    if (buyer.project?.name) return buyer.project.name;
    if (buyer.preferred_project) return buyer.preferred_project;
    return 'General Project';
  }

  getVisitProjectName(visit: any): string {
    if (visit.project_name) return visit.project_name;
    if (visit.project?.name) return visit.project.name;
    if (visit.buyer?.project?.name) return visit.buyer.project.name;
    if (visit.buyer?.preferred_project) return visit.buyer.preferred_project;
    return 'General Project';
  }

  get totalBuyerPages(): number {
    const size = Number(this.buyerPageSize) || 10;
    return Math.ceil(this.filteredNeglectedBuyers.length / size) || 1;
  }

  get pagedNeglectedBuyers(): any[] {
    const size = Number(this.buyerPageSize) || 10;
    const page = Math.max(1, Number(this.buyerPage) || 1);
    const start = (page - 1) * size;
    return this.filteredNeglectedBuyers.slice(start, start + size);
  }

  get buyerStartItem(): number {
    if (!this.filteredNeglectedBuyers || this.filteredNeglectedBuyers.length === 0) return 0;
    const size = Number(this.buyerPageSize) || 10;
    const page = Math.max(1, Number(this.buyerPage) || 1);
    return (page - 1) * size + 1;
  }

  get buyerEndItem(): number {
    if (!this.filteredNeglectedBuyers || this.filteredNeglectedBuyers.length === 0) return 0;
    const size = Number(this.buyerPageSize) || 10;
    const page = Math.max(1, Number(this.buyerPage) || 1);
    return Math.min(page * size, this.filteredNeglectedBuyers.length);
  }

  setBuyerPageSize(size: any): void {
    this.buyerPageSize = Number(size) || 10;
    this.buyerPage = 1;
  }

  get totalVisitPages(): number {
    const size = Number(this.visitPageSize) || 10;
    return Math.ceil(this.filteredVisits.length / size) || 1;
  }

  get pagedVisits(): any[] {
    const size = Number(this.visitPageSize) || 10;
    const page = Math.max(1, Number(this.visitPage) || 1);
    const start = (page - 1) * size;
    return this.filteredVisits.slice(start, start + size);
  }

  get visitStartItem(): number {
    if (this.filteredVisits.length === 0) return 0;
    const size = Number(this.visitPageSize) || 10;
    const page = Math.max(1, Number(this.visitPage) || 1);
    return (page - 1) * size + 1;
  }

  get visitEndItem(): number {
    if (this.filteredVisits.length === 0) return 0;
    const size = Number(this.visitPageSize) || 10;
    const page = Math.max(1, Number(this.visitPage) || 1);
    return Math.min(page * size, this.filteredVisits.length);
  }

  setVisitPageSize(size: any): void {
    this.visitPageSize = Number(size) || 10;
    this.visitPage = 1;
  }

  get totalTaskPages(): number {
    const size = Number(this.taskPageSize) || 10;
    return Math.ceil(this.filteredTasks.length / size) || 1;
  }

  get pagedTasks(): any[] {
    const size = Number(this.taskPageSize) || 10;
    const page = Math.max(1, Number(this.taskPage) || 1);
    const start = (page - 1) * size;
    return this.filteredTasks.slice(start, start + size);
  }

  get taskStartItem(): number {
    if (this.filteredTasks.length === 0) return 0;
    const size = Number(this.taskPageSize) || 10;
    const page = Math.max(1, Number(this.taskPage) || 1);
    return (page - 1) * size + 1;
  }

  get taskEndItem(): number {
    if (this.filteredTasks.length === 0) return 0;
    const size = Number(this.taskPageSize) || 10;
    const page = Math.max(1, Number(this.taskPage) || 1);
    return Math.min(page * size, this.filteredTasks.length);
  }

  setTaskPageSize(size: any): void {
    this.taskPageSize = Number(size) || 10;
    this.taskPage = 1;
  }

  ngOnInit(): void {
    this.loadRadar(false);
    this.loadSalesReps();
  }

  ngOnDestroy(): void {
    if (this.scanSub) {
      this.scanSub.unsubscribe();
    }
  }

  loadSalesReps(): void {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res && res.success && res.users) {
          this.salesReps = res.users.filter((u: any) => u.is_active !== false);
          if (this.salesReps.length > 0) {
            this.reassignedRepId = this.salesReps[0].user_id || this.salesReps[0].id;
          }
        }
      }
    });
  }

  loadRadar(isUserClick: boolean = false): void {
    if (this.isScanning) {
      return;
    }
    this.loading = true;
    this.isScanning = true;

    if (this.scanSub) {
      this.scanSub.unsubscribe();
    }

    this.scanSub = this.controlTowerService.getLiveRadarStatus().subscribe({
      next: (res) => {
        this.loading = false;
        this.isScanning = false;
        if (res && res.success && res.data) {
          const dedupe = (arr: any[], key: string) => {
            if (!Array.isArray(arr)) return [];
            const seen = new Set();
            return arr.filter(item => {
              const val = item ? (item[key] ?? item.id) : null;
              if (val === null || val === undefined) return true;
              if (seen.has(val)) return false;
              seen.add(val);
              return true;
            });
          };

          const neglected = dedupe(res.data.neglected_buyers || [], 'buyer_id');
          const visits = dedupe(res.data.at_risk_visits || [], 'site_visit_id');
          const tasks = dedupe(res.data.overdue_tasks || [], 'follow_up_task_id');

          this.radarData = {
            ...res.data,
            neglected_buyers: neglected,
            at_risk_visits: visits,
            overdue_tasks: tasks,
            summary: {
              ...res.data.summary,
              neglected_buyers_count: neglected.length,
              at_risk_visits_today: visits.length,
              overdue_tasks_count: tasks.length,
              total_exceptions_count: (res.data.summary?.total_exceptions_count != null)
                ? res.data.summary.total_exceptions_count
                : (neglected.length + visits.length + tasks.length)
            }
          };

          if (isUserClick) {
            this.successMessage = `Live Radar Scan Complete: Audited ${this.radarData.summary?.total_exceptions_count || 0} operational exception(s). Pipeline health index: ${this.radarData.summary?.health_score || 100}/100.`;
            setTimeout(() => {
              this.successMessage = '';
            }, 4500);
          }
        }
      },
      error: () => {
        this.loading = false;
        this.isScanning = false;
      }
    });
  }

  openRescueModal(buyer: any) {
    this.selectedBuyerForRescue = buyer;
    this.successMessage = '';
  }

  closeRescueModal() {
    this.selectedBuyerForRescue = null;
  }

  executeRescue() {
    if (!this.selectedBuyerForRescue) return;
    this.resolving = true;

    const buyerId = this.selectedBuyerForRescue.buyer_id || this.selectedBuyerForRescue.id;
    this.controlTowerService.resolveLeakageAlert({
      buyer_id: buyerId,
      reassigned_rep_id: this.reassignedRepId,
      action_taken: this.rescueActionNotes
    }).subscribe({
      next: () => {
        this.resolving = false;
        this.successMessage = `Deal rescued! ${this.selectedBuyerForRescue.full_name} reassigned successfully.`;
        this.selectedBuyerForRescue = null;
        this.loadRadar();
      },
      error: () => {
        this.resolving = false;
      }
    });
  }
}
