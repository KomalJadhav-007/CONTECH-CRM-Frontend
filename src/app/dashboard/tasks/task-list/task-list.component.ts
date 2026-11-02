import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../task.service';
import { BuyerService } from '../../buyers/buyer.service';
import { UserService } from '../../../users/user.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);

  loading = true;
  feedbackMessage = '';
  tasks: any[] = [];
  filterStatus = 'PENDING';

  prospectsList: any[] = [];
  salesRepsList: any[] = [];

  // Create Follow-up Modal State
  createTaskModalOpen = false;
  creatingTask = false;
  createForm: any = {
    buyer_id: null,
    title: '',
    description: '',
    assigned_to_id: null,
    priority: 'HIGH',
    countdown_hours: 4,
    due_at: '',
    manual_intent_score: 95,
    manual_intent_delta: 5,
    manual_intent_band: 'HIGH'
  };

  // Complete Follow-up Modal State (Take Action)
  completeTaskModalOpen = false;
  selectedTaskForCompletion: any = null;
  completingTask = false;

  action_channel = 'Phone Call Completed';
  outcome_status = 'Call Connected - High Interest';
  outcome_notes = '';
  manual_intent_score = 95;
  manual_intent_delta = 5;
  manual_intent_band = 'HIGH';
  schedule_next_follow_up = false;
  next_follow_up_title = '';
  next_follow_up_date = '';
  next_follow_up_priority = 'HIGH';

  ngOnInit(): void {
    this.loadTasks();
    this.loadProspectsAndReps();
  }

  loadProspectsAndReps(): void {
    this.buyerService.getBuyers({ limit: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.buyers) {
          this.prospectsList = res.buyers;
        }
      }
    });

    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res.success && res.users) {
          this.salesRepsList = res.users.filter((u: any) => u.is_active !== false);
        }
      }
    });
  }

  getSelectedBuyer(): any {
    if (!this.createForm.buyer_id) return null;
    return this.prospectsList.find(b => (b.buyer_id || b.id) == this.createForm.buyer_id) || null;
  }

  openCreateModal(): void {
    const fourHoursLater = new Date(Date.now() + 4 * 60 * 60 * 1000);
    const defaultBuyer = this.prospectsList[0] || null;

    this.createForm = {
      buyer_id: defaultBuyer ? (defaultBuyer.buyer_id || defaultBuyer.id) : null,
      follow_up_type: 'Phone Call',
      title: defaultBuyer ? `Follow-up Strategy Call with ${defaultBuyer.full_name}` : 'Follow-up Strategy Call',
      description: 'Review requirement, quote pricing milestones, and discuss preferred site visit / walkthrough slot.',
      assigned_to_id: defaultBuyer?.assigned_rep_id || (this.salesRepsList[0]?.user_id || null),
      priority: 'HIGH',
      countdown_hours: 4,
      due_at: fourHoursLater.toISOString().slice(0, 16)
    };

    this.createTaskModalOpen = true;
  }

  closeCreateModal(): void {
    this.createTaskModalOpen = false;
  }

  onFollowUpTypeChange(): void {
    const selected = this.getSelectedBuyer();
    const name = selected ? selected.full_name : 'Prospect';
    if (this.createForm.follow_up_type === 'Phone Call') {
      this.createForm.title = `Strategy Call with ${name}`;
    } else if (this.createForm.follow_up_type === 'WhatsApp') {
      this.createForm.title = `WhatsApp Follow-up with ${name}`;
    } else if (this.createForm.follow_up_type === 'Site Visit Walkthrough') {
      this.createForm.title = `Site Visit Coordination for ${name}`;
    } else if (this.createForm.follow_up_type === 'In-Person Meeting') {
      this.createForm.title = `Sales Gallery Discussion with ${name}`;
    } else if (this.createForm.follow_up_type === 'Pricing & Negotiation') {
      this.createForm.title = `Pricing & Payment Plan Review for ${name}`;
    }
  }

  onBuyerSelectChange(): void {
    const selected = this.getSelectedBuyer();
    if (selected) {
      if (selected.assigned_rep_id) {
        this.createForm.assigned_to_id = selected.assigned_rep_id;
      }
      this.onFollowUpTypeChange();
    }
  }

  setCreateCountdown(hours: number): void {
    this.createForm.countdown_hours = hours;
    const target = new Date(Date.now() + hours * 60 * 60 * 1000);
    this.createForm.due_at = target.toISOString().slice(0, 16);
  }

  submitCreateTask(): void {
    if (!this.createForm.title) {
      alert('Please enter a follow-up task title');
      return;
    }
    if (!this.createForm.buyer_id) {
      alert('Please select a prospect for this follow-up');
      return;
    }

    this.creatingTask = true;
    this.taskService.createTask(this.createForm).subscribe({
      next: (res) => {
        this.creatingTask = false;
        if (res.success) {
          this.closeCreateModal();
          this.showFeedback(`✓ Follow-up scheduled successfully in Pending SLAs!`);
          this.loadTasks();
        }
      },
      error: (err) => {
        this.creatingTask = false;
        alert('Failed to schedule follow-up: ' + (err.error?.message || err.message));
      }
    });
  }

  loadTasks(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;

    this.taskService.getTasks(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const list = res.tasks || [];
          list.sort((a: any, b: any) => {
            const idA = a.follow_up_task_id || a.id || 0;
            const idB = b.follow_up_task_id || b.id || 0;
            return idB - idA;
          });
          this.tasks = list;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  completeTask(task: any): void {
    this.openCompleteModal(task);
  }

  openCompleteModal(task: any): void {
    this.selectedTaskForCompletion = task;
    this.action_channel = 'Phone Call Completed';
    this.outcome_status = 'Call Connected - High Interest';
    this.outcome_notes = '';
    this.manual_intent_score = task.buyer?.intent_score !== undefined && task.buyer?.intent_score !== null ? task.buyer.intent_score : 95;
    this.manual_intent_delta = task.buyer?.intent_delta !== undefined && task.buyer?.intent_delta !== null ? task.buyer.intent_delta : 5;
    this.manual_intent_band = this.manual_intent_score >= 80 ? 'HIGH' : (this.manual_intent_score >= 50 ? 'MEDIUM' : 'LOW');
    this.schedule_next_follow_up = false;
    this.next_follow_up_title = `Next Follow-up Call for ${task.buyer?.full_name || 'Prospect'}`;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(11, 0, 0, 0);
    this.next_follow_up_date = tomorrow.toISOString().slice(0, 16);
    this.next_follow_up_priority = task.priority || 'HIGH';
    this.completeTaskModalOpen = true;
  }

  closeCompleteModal(): void {
    this.completeTaskModalOpen = false;
    this.selectedTaskForCompletion = null;
  }

  setManualIntentPreset(score: number, delta: number): void {
    this.manual_intent_score = score;
    this.manual_intent_delta = delta;
    this.manual_intent_band = score >= 80 ? 'HIGH' : (score >= 50 ? 'MEDIUM' : 'LOW');
  }

  submitTaskCompletion(): void {
    if (!this.selectedTaskForCompletion) return;
    this.completingTask = true;
    const id = this.selectedTaskForCompletion.follow_up_task_id || this.selectedTaskForCompletion.id;
    const notesWithChannel = `[Action: ${this.action_channel}] ${this.outcome_notes || ''}`.trim();
    const payload = {
      outcome_status: this.outcome_status,
      outcome_notes: notesWithChannel,
      manual_intent_score: this.manual_intent_score,
      manual_intent_delta: this.manual_intent_delta,
      manual_intent_band: this.manual_intent_band,
      next_follow_up_date: this.schedule_next_follow_up && this.next_follow_up_date ? this.next_follow_up_date : null,
      next_follow_up_title: this.schedule_next_follow_up && this.next_follow_up_title ? this.next_follow_up_title : null,
      next_follow_up_priority: this.next_follow_up_priority
    };

    this.taskService.completeTask(id, payload).subscribe({
      next: (res) => {
        this.completingTask = false;
        if (res.success) {
          this.closeCompleteModal();
          this.showFeedback(`✓ Action taken & recorded! Follow-up marked complete and buyer intent score updated.`);
          this.loadTasks();
        }
      },
      error: (err) => {
        this.completingTask = false;
        alert('Failed to complete follow-up: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteTask(task: any): void {
    const confirmed = window.confirm(`Delete follow-up task "${task.title}" from database?`);
    if (!confirmed) return;

    const id = task.follow_up_task_id || task.id;
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => (t.follow_up_task_id || t.id) !== id);
        this.showFeedback(`Task "${task.title}" deleted from database.`);
      },
      error: () => {
        this.tasks = this.tasks.filter(t => (t.follow_up_task_id || t.id) !== id);
        this.showFeedback(`Task removed.`);
      }
    });
  }

  updateTaskPriority(task: any, priority: string): void {
    const id = task.follow_up_task_id || task.id;
    this.taskService.updateTask(id, { priority }).subscribe({
      next: () => {
        task.priority = priority;
        this.showFeedback(`Task priority updated to ${priority} in database.`);
      }
    });
  }

  private showFeedback(msg: string): void {
    this.feedbackMessage = msg;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 3000);
  }
}
