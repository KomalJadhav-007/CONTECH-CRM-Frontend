import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VisitService } from '../visit.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-visit-discovery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './visit-discovery.component.html',
  styleUrl: './visit-discovery.component.css'
})
export class VisitDiscoveryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private visitService = inject(VisitService);

  visitId!: number;
  visit: any = null;
  loading = true;
  saving = false;
  successMessage = '';

  discoveryData = {
    outcome: 'HOT_NEGOTIATION',
    shortlisted_units: 'Tower B - Unit 402 (3BHK East Facing)',
    objection_category: 'PRICE',
    objection_severity: 'MEDIUM',
    objection_notes: 'Buyer requested special payment plan waiver on floor rise charges.',
    buyer_sentiment: 'POSITIVE',
    recommended_action: 'Offer 10:90 subvention scheme before 5 PM today.',
    follow_up_title: 'Dispatch customized milestone pricing draft for Unit 402'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.visitId = parseInt(id, 10);
      this.loadVisit();
    }
  }

  loadVisit(): void {
    this.loading = true;
    this.visitService.getSiteVisitById(this.visitId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.visit = res.visit;
          if (this.visit.discovery) {
            Object.assign(this.discoveryData, this.visit.discovery);
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.saving = true;
    this.visitService.recordDiscovery(this.visitId, this.discoveryData).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.successMessage = 'In-visit discovery recorded and 4-hour countdown task created!';
          setTimeout(() => {
            this.router.navigate(['/visits']);
          }, 1500);
        }
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}
