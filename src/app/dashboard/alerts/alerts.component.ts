import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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

import { AlertService } from '../../shared/alert.service';
import { UserService } from '../../users/user.service';

export type AlertTab = 'all' | 'overdue' | 'missing_action' | 'neglected' | 'visits' | 'system';

@Component({
  selector: 'app-alerts',
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
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit {
  private alertService = inject(AlertService);
  private userService = inject(UserService);
  private router = inject(Router);

  loading = true;
  isRefreshing = false;
  submittingAction = false;
  feedbackMessage: string | null = null;
  errorMessage: string | null = null;

  activeTab: AlertTab = 'all';
  searchQuery = '';
  severityFilter: 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' = 'ALL';

  summary: any = {
    overdue_tasks_count: 0,
    missing_next_actions_count: 0,
    neglected_buyers_count: 0,
    at_risk_visits_today: 0,
    gross_pipeline_at_risk_cr: '0.00',
    total_exceptions_count: 0,
    health_score: 100
  };

  overdueTasks: any[] = [];
  missingNextActions: any[] = [];
  neglectedBuyers: any[] = [];
  atRiskVisits: any[] = [];
  unassignedBuyers: any[] = [];
  inAppAlerts: any[] = [];
  salesReps: any[] = [];

  // Modals state
  showScheduleModal = false;
  scheduleForm = {
    buyer_id: 0,
    buyer_name: '',
    buyer_phone: '',
    title: '',
    countdown_hours: 4,
    due_date: '',
    priority: 'HIGH',
    assigned_to_id: 0,
    description: ''
  };

  showCompleteModal = false;
  completeForm = {
    task_id: 0,
    task_title: '',
    buyer_name: '',
    outcome_status: 'Followed Up - Discussion Ongoing',
    outcome_notes: '',
    schedule_next: true,
    next_title: 'Next Follow-up Call',
    next_date: ''
  };

  showReassignModal = false;
  reassignForm = {
    buyer_id: 0,
    buyer_name: '',
    current_rep_name: '',
    reassigned_rep_id: 0,
    notes: ''
  };

  ngOnInit(): void {
    this.loadAlertsData();
    this.loadSalesReps();
  }

  loadAlertsData(forceRefresh = false): void {
    if (forceRefresh) {
      this.isRefreshing = true;
    } else {
      this.loading = true;
    }
    this.errorMessage = null;

    this.alertService.getAlerts().subscribe({
      next: (res) => {
        this.loading = false;
        this.isRefreshing = false;

        if (res && res.success) {
          this.summary = res.summary || this.summary;
          this.overdueTasks = res.overdue_tasks || [];
          this.missingNextActions = res.missing_next_actions || [];
          this.neglectedBuyers = res.neglected_buyers || [];
          this.atRiskVisits = res.at_risk_visits || [];
          this.unassignedBuyers = res.unassigned_buyers || [];
          this.inAppAlerts = res.alerts || [];

          if (forceRefresh) {
            this.showToast('Alerts and missed follow-ups scanned & refreshed!');
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.isRefreshing = false;
        this.errorMessage = err?.error?.message || 'Failed to load alerts data';
      }
    });
  }

  loadSalesReps(): void {
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res && res.success && res.users) {
          this.salesReps = res.users.filter((u: any) => u.is_active !== false);
        }
      }
    });
  }

  // Quick Action: Acknowledge Alert
  acknowledgeAlert(alertId: number | string, event?: Event): void {
    if (event) event.stopPropagation();
    this.alertService.acknowledgeAlert(alertId).subscribe({
      next: () => {
        const item = this.inAppAlerts.find(a => (a.in_app_alert_id || a.id) === alertId);
        if (item) item.is_acknowledged = true;
        this.showToast('Alert acknowledged');
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to acknowledge alert';
      }
    });
  }

  // Quick Action: Resolve In-App Alert
  resolveAlert(alertId: number | string, event?: Event): void {
    if (event) event.stopPropagation();
    this.alertService.resolveAlert(alertId, 'Resolved via Alerts Hub').subscribe({
      next: () => {
        this.inAppAlerts = this.inAppAlerts.filter(a => (a.in_app_alert_id || a.id) !== alertId);
        this.showToast('Alert marked as resolved');
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to resolve alert';
      }
    });
  }

  acknowledgeAll(): void {
    this.alertService.acknowledgeAll().subscribe({
      next: () => {
        this.inAppAlerts.forEach(a => a.is_acknowledged = true);
        this.showToast('All alerts acknowledged successfully');
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to acknowledge all alerts';
      }
    });
  }

  // Open Schedule Follow-Up Modal
  openScheduleModal(buyer: any, defaultTitle = 'Urgent Follow-Up Call'): void {
    const buyerId = buyer.buyer_id || buyer.id;
    const now = new Date();
    // Default 4 hours from now in ISO local string
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const dateFormatted = fourHoursLater.toISOString().slice(0, 16);

    this.scheduleForm = {
      buyer_id: buyerId,
      buyer_name: buyer.full_name || 'Prospect',
      buyer_phone: buyer.phone || '',
      title: defaultTitle,
      countdown_hours: 4,
      due_date: dateFormatted,
      priority: 'HIGH',
      assigned_to_id: buyer.assigned_rep_id || (buyer.assignedRep ? buyer.assignedRep.user_id : (this.salesReps[0]?.user_id || 0)),
      description: `Follow-up required for ${buyer.full_name || 'prospect'}. Deal stage: ${buyer.lead_status || 'Active'}.`
    };
    this.showScheduleModal = true;
  }

  setQuickDue(hours: number): void {
    this.scheduleForm.countdown_hours = hours;
    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    this.scheduleForm.due_date = target.toISOString().slice(0, 16);
  }

  setQuickDueTomorrow(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    this.scheduleForm.due_date = tomorrow.toISOString().slice(0, 16);
    this.scheduleForm.countdown_hours = 24;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  submitScheduleFollowUp(): void {
    if (!this.scheduleForm.title || !this.scheduleForm.assigned_to_id) {
      this.errorMessage = 'Please provide a title and assigned sales representative.';
      return;
    }

    this.submittingAction = true;
    this.alertService.scheduleFollowUp({
      buyer_id: this.scheduleForm.buyer_id,
      title: this.scheduleForm.title,
      due_at: this.scheduleForm.due_date,
      countdown_hours: this.scheduleForm.countdown_hours,
      priority: this.scheduleForm.priority,
      assigned_to_id: this.scheduleForm.assigned_to_id,
      description: this.scheduleForm.description
    }).subscribe({
      next: (res) => {
        this.submittingAction = false;
        this.closeScheduleModal();
        this.showToast(`Follow-up scheduled for ${this.scheduleForm.buyer_name}!`);
        // Refresh alert data to remove buyer from missing actions
        this.loadAlertsData();
      },
      error: (err) => {
        this.submittingAction = false;
        this.errorMessage = err?.error?.message || 'Failed to schedule follow-up';
      }
    });
  }

  // Open Complete Follow-Up Modal
  openCompleteModal(task: any): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);

    this.completeForm = {
      task_id: task.follow_up_task_id || task.id,
      task_title: task.title,
      buyer_name: task.buyer ? task.buyer.full_name : 'Prospect',
      outcome_status: 'Followed Up - Discussion Ongoing',
      outcome_notes: '',
      schedule_next: true,
      next_title: `Next Touchpoint with ${task.buyer ? task.buyer.full_name : 'Buyer'}`,
      next_date: tomorrow.toISOString().slice(0, 16)
    };
    this.showCompleteModal = true;
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
  }

  submitCompleteFollowUp(): void {
    this.submittingAction = true;
    const fullNotes = `Status: ${this.completeForm.outcome_status}. Notes: ${this.completeForm.outcome_notes || 'Action taken'}`;

    this.alertService.completeFollowUp({
      task_id: this.completeForm.task_id,
      outcome_notes: fullNotes,
      next_follow_up_date: this.completeForm.schedule_next ? this.completeForm.next_date : undefined,
      next_follow_up_title: this.completeForm.schedule_next ? this.completeForm.next_title : undefined
    }).subscribe({
      next: () => {
        this.submittingAction = false;
        this.closeCompleteModal();
        this.showToast('Follow-up recorded and completed!');
        this.loadAlertsData();
      },
      error: (err) => {
        this.submittingAction = false;
        this.errorMessage = err?.error?.message || 'Failed to complete follow-up';
      }
    });
  }

  // Open Reassign Modal
  openReassignModal(buyer: any): void {
    const buyerId = buyer.buyer_id || buyer.id;
    this.reassignForm = {
      buyer_id: buyerId,
      buyer_name: buyer.full_name || 'Prospect',
      current_rep_name: buyer.assignedRep?.name || 'Unassigned',
      reassigned_rep_id: this.salesReps[0]?.user_id || 0,
      notes: ''
    };
    this.showReassignModal = true;
  }

  closeReassignModal(): void {
    this.showReassignModal = false;
  }

  submitReassign(): void {
    if (!this.reassignForm.reassigned_rep_id) {
      this.errorMessage = 'Please choose a representative to assign.';
      return;
    }

    this.submittingAction = true;
    this.alertService.reassignBuyer({
      buyer_id: this.reassignForm.buyer_id,
      reassigned_rep_id: this.reassignForm.reassigned_rep_id,
      notes: this.reassignForm.notes
    }).subscribe({
      next: () => {
        this.submittingAction = false;
        this.closeReassignModal();
        this.showToast(`${this.reassignForm.buyer_name} reassigned successfully!`);
        this.loadAlertsData();
      },
      error: (err) => {
        this.submittingAction = false;
        this.errorMessage = err?.error?.message || 'Failed to reassign buyer';
      }
    });
  }

  viewBuyer(buyer: any, event?: Event): void {
    if (event) event.stopPropagation();
    const id = buyer.buyer_id || buyer.id;
    if (id) {
      this.router.navigate(['/buyers', id]);
    }
  }

  showToast(msg: string): void {
    this.feedbackMessage = msg;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = null;
      }
    }, 4500);
  }

  // Filter Getters
  get filteredOverdueTasks(): any[] {
    let list = this.overdueTasks;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.buyer && t.buyer.full_name && t.buyer.full_name.toLowerCase().includes(q)) ||
        (t.buyer && t.buyer.phone && t.buyer.phone.includes(q)) ||
        (t.assignedUser && t.assignedUser.name && t.assignedUser.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get filteredMissingActions(): any[] {
    let list = this.missingNextActions;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b => 
        (b.full_name && b.full_name.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.assignedRep && b.assignedRep.name && b.assignedRep.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get filteredNeglectedBuyers(): any[] {
    let list = this.neglectedBuyers;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b => 
        (b.full_name && b.full_name.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.assignedRep && b.assignedRep.name && b.assignedRep.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get filteredAtRiskVisits(): any[] {
    let list = this.atRiskVisits;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(v => 
        (v.buyer && v.buyer.full_name && v.buyer.full_name.toLowerCase().includes(q)) ||
        (v.salesRep && v.salesRep.name && v.salesRep.name.toLowerCase().includes(q)) ||
        (v.driver && v.driver.name && v.driver.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get filteredInAppAlerts(): any[] {
    let list = this.inAppAlerts;
    if (this.severityFilter !== 'ALL') {
      list = list.filter(a => a.severity === this.severityFilter);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(a => 
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.message && a.message.toLowerCase().includes(q)) ||
        (a.related_module && a.related_module.toLowerCase().includes(q))
      );
    }
    return list;
  }

  get totalItemsCount(): number {
    return this.overdueTasks.length + 
           this.missingNextActions.length + 
           this.neglectedBuyers.length + 
           this.atRiskVisits.length + 
           this.inAppAlerts.length;
  }
}
