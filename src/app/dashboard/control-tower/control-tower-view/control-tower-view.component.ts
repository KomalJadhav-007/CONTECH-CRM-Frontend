import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
export class ControlTowerViewComponent implements OnInit {
  private controlTowerService = inject(ControlTowerService);
  private userService = inject(UserService);

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

  // Neglected Buyers Pagination & Search
  buyerSearchQuery = '';
  buyerPage = 1;
  buyerPageSize = 10;

  get filteredNeglectedBuyers(): any[] {
    const list = this.radarData?.neglected_buyers || [];
    if (!this.buyerSearchQuery || !this.buyerSearchQuery.trim()) {
      return list;
    }
    const q = this.buyerSearchQuery.toLowerCase().trim();
    return list.filter((b: any) => {
      const name = (b.full_name || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      const rep = (b.assignedRep?.name || '').toLowerCase();
      const timeframe = (b.buying_timeframe || '').toLowerCase();
      const proj = (b.project_name || b.project?.name || b.preferred_project || '').toLowerCase();
      return name.includes(q) || phone.includes(q) || rep.includes(q) || timeframe.includes(q) || proj.includes(q);
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
    return Math.ceil(this.filteredNeglectedBuyers.length / this.buyerPageSize) || 1;
  }

  get pagedNeglectedBuyers(): any[] {
    const start = (this.buyerPage - 1) * this.buyerPageSize;
    return this.filteredNeglectedBuyers.slice(start, start + this.buyerPageSize);
  }

  // At-Risk Visits Pagination
  visitPage = 1;
  visitPageSize = 10;

  get totalVisitPages(): number {
    const list = this.radarData?.at_risk_visits || [];
    return Math.ceil(list.length / this.visitPageSize) || 1;
  }

  get pagedVisits(): any[] {
    const list = this.radarData?.at_risk_visits || [];
    const start = (this.visitPage - 1) * this.visitPageSize;
    return list.slice(start, start + this.visitPageSize);
  }

  // Overdue Tasks Pagination
  taskPage = 1;
  taskPageSize = 10;

  get totalTaskPages(): number {
    const list = this.radarData?.overdue_tasks || [];
    return Math.ceil(list.length / this.taskPageSize) || 1;
  }

  get pagedTasks(): any[] {
    const list = this.radarData?.overdue_tasks || [];
    const start = (this.taskPage - 1) * this.taskPageSize;
    return list.slice(start, start + this.taskPageSize);
  }

  ngOnInit(): void {
    this.loadRadar(false);
    this.loadSalesReps();
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
    this.loading = true;
    this.isScanning = true;
    this.controlTowerService.getLiveRadarStatus().subscribe({
      next: (res) => {
        this.loading = false;
        this.isScanning = false;
        if (res.success && res.data) {
          this.radarData = res.data;
          if (isUserClick) {
            this.successMessage = `Live Radar Scan Complete: Audited ${res.data.summary?.total_exceptions_count || 0} operational exception(s). Pipeline health index: ${res.data.summary?.health_score || 100}/100.`;
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
