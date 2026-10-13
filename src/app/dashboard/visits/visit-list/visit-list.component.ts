import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';

@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './visit-list.component.html',
  styleUrl: './visit-list.component.css'
})
export class VisitListComponent implements OnInit {
  private visitService = inject(VisitService);

  loading = true;
  visits: any[] = [];
  filterStatus = '';

  ngOnInit(): void {
    this.loadVisits();
  }

  loadVisits(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;

    this.visitService.getSiteVisits(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.visits = res.visits;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleConfirmation(visit: any, type: string): void {
    const payload: any = {};
    payload[type] = !visit[type];

    this.visitService.updateConfirmations(visit.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          visit[type] = !visit[type];
        }
      }
    });
  }
}
