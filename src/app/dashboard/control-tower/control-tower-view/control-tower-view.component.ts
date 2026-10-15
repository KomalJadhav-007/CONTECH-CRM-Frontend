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
