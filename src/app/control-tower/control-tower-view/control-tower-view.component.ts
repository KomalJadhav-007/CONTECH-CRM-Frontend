import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ControlTowerService } from '../control-tower.service';

@Component({
  selector: 'app-control-tower-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './control-tower-view.component.html',
  styleUrl: './control-tower-view.component.css'
})
export class ControlTowerViewComponent implements OnInit {
  private controlTowerService = inject(ControlTowerService);

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

  selectedBuyerForRescue: any = null;
  reassignedRepId = 3;
  rescueActionNotes = 'Reassigned to active senior rep for urgent priority callback';
  resolving = false;
  successMessage = '';

  ngOnInit(): void {
    this.loadRadar();
  }

  loadRadar(): void {
    this.loading = true;
    this.controlTowerService.getLiveRadarStatus().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.radarData = res.data;
        }
      },
      error: () => {
        this.loading = false;
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

    this.controlTowerService.resolveLeakageAlert({
      buyer_id: this.selectedBuyerForRescue.id,
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
