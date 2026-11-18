import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../task.service';
import { BuyerService } from '../../buyers/buyer.service';
import { UserService } from '../../../users/user.service';
import { SettingsService } from '../../../settings/settings.service';

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
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private buyerService = inject(BuyerService);
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);

  loading = true;
  feedbackMessage = '';
  tasks: any[] = [];
  allTasks: any[] = [];
  projects: any[] = [];
  selectedProjectId: string | number = 'all';

  filterStatus = 'PENDING';
  pendingCount = 0;
  completedCount = 0;
  totalCount = 0;
  countdownInterval: any = null;

  // Pagination & Search State
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';

  get filteredTasks(): any[] {
    let list = this.tasks;
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter((t: any) => {
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const buyer = (t.buyer?.full_name || '').toLowerCase();
        const rep = (t.assignedUser?.name || '').toLowerCase();
        const project = (this.getTaskProjectName(t) || '').toLowerCase();
        return title.includes(q) || desc.includes(q) || buyer.includes(q) || rep.includes(q) || project.includes(q);
      });
    }
    return list;
  }

  get totalPages(): number {
    const size = Number(this.pageSize) || 10;
    return Math.ceil(this.filteredTasks.length / size) || 1;
  }

  get pagedTasks(): any[] {
    const size = Number(this.pageSize) || 10;
    const page = Math.max(1, Number(this.currentPage) || 1);
    const start = (page - 1) * size;
    return this.filteredTasks.slice(start, start + size);
  }

  get taskStartItem(): number {
    if (!this.filteredTasks || this.filteredTasks.length === 0) return 0;
    const size = Number(this.pageSize) || 10;
    const page = Math.max(1, Number(this.currentPage) || 1);
    return (page - 1) * size + 1;
  }

  get taskEndItem(): number {
    if (!this.filteredTasks || this.filteredTasks.length === 0) return 0;
    const size = Number(this.pageSize) || 10;
    const page = Math.max(1, Number(this.currentPage) || 1);
    return Math.min(page * size, this.filteredTasks.length);
  }

  setPageSize(size: any): void {
    this.pageSize = Number(size) || 10;
    this.currentPage = 1;
  }

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
    try {
      const savedFilter = localStorage.getItem('contech_tasks_filter_status');
      if (savedFilter !== null && savedFilter !== undefined) {
        this.filterStatus = savedFilter;
      }
      const savedProj = localStorage.getItem('contech_tasks_project_id');
      if (savedProj !== null && savedProj !== undefined) {
        this.selectedProjectId = savedProj;
      }
    } catch (_) {}

    this.loadProjects();
    this.loadTasks();
    this.loadProspectsAndReps();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.success && res.projects) {
          this.projects = res.projects;
        }
      },
      error: () => {
        this.projects = [];
      }
    });
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

  toLocalISOString(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  openDateTimePicker(inputEl: HTMLInputElement): void {
    if (inputEl && typeof (inputEl as any).showPicker === 'function') {
      try {
        (inputEl as any).showPicker();
      } catch (_) {}
    }
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
      due_at: this.toLocalISOString(fourHoursLater)
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
    this.createForm.due_at = this.toLocalISOString(target);
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

  isCompleted(task: any): boolean {
    if (!task) return false;
    const st = (task.status || '').toString().trim().toUpperCase();
    return st === 'COMPLETED' || !!task.completed_at;
  }

  startCountdownTimer(): void {
    this.updateSlaCountdowns();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.countdownInterval = setInterval(() => {
      this.updateSlaCountdowns();
    }, 1000);
  }

  updateSlaCountdowns(): void {
    if (!this.allTasks || this.allTasks.length === 0) return;
    const now = Date.now();
    for (const task of this.allTasks) {
      if (this.isCompleted(task)) {
        task.countdown_text = 'Completed';
        task.is_overdue = false;
        continue;
      }
      if (!task.due_at) {
        task.countdown_text = task.hours_remaining ? `${task.hours_remaining}h Remaining` : 'Pending SLA';
        task.is_overdue = false;
        continue;
      }

      const dueTime = new Date(task.due_at).getTime();
      const diffMs = dueTime - now;

      if (diffMs <= 0) {
        task.is_overdue = true;
        const overdueMs = Math.abs(diffMs);
        const hrs = Math.floor(overdueMs / 3600000);
        const mins = Math.floor((overdueMs % 3600000) / 60000);
        const secs = Math.floor((overdueMs % 60000) / 1000);
        if (hrs > 0) {
          task.countdown_text = `OVERDUE (${hrs}h ${mins}m ago)`;
        } else if (mins > 0) {
          task.countdown_text = `OVERDUE (${mins}m ${secs}s ago)`;
        } else {
          task.countdown_text = `OVERDUE (${secs}s ago)`;
        }
      } else {
        task.is_overdue = false;
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        if (hrs > 0) {
          task.countdown_text = `${hrs}h ${mins}m ${secs}s remaining`;
        } else if (mins > 0) {
          task.countdown_text = `${mins}m ${secs}s remaining`;
        } else {
          task.countdown_text = `${secs}s remaining`;
        }
      }
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks({}).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const list = res.tasks || [];
          list.sort((a: any, b: any) => {
            const idA = a.follow_up_task_id || a.id || 0;
            const idB = b.follow_up_task_id || b.id || 0;
            return idB - idA;
          });
          this.allTasks = list;
          this.pendingCount = list.filter((t: any) => !this.isCompleted(t)).length;
          this.completedCount = list.filter((t: any) => this.isCompleted(t)).length;
          this.totalCount = list.length;
          this.updateSlaCountdowns();
          this.applyFilter();
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.allTasks];

    // Status Filter (Pending SLAs, Completed, All Tasks)
    if (this.filterStatus === 'PENDING') {
      list = list.filter((t: any) => !this.isCompleted(t));
    } else if (this.filterStatus === 'COMPLETED') {
      list = list.filter((t: any) => this.isCompleted(t));
    } else if (this.filterStatus) {
      list = list.filter((t: any) => (t.status || '').toUpperCase() === this.filterStatus.toUpperCase());
    }

    // Project Container Filter
    if (this.selectedProjectId && this.selectedProjectId !== 'all') {
      if (this.selectedProjectId === 'unassigned') {
        list = list.filter((t: any) => !this.getTaskProjectId(t));
      } else {
        list = list.filter((t: any) => {
          const pId = this.getTaskProjectId(t);
          const pName = (this.getTaskProjectName(t) || '').toLowerCase();
          const matchId = pId && String(pId) === String(this.selectedProjectId);
          const matchName = typeof this.selectedProjectId === 'string' && pName === this.selectedProjectId.toLowerCase();
          return matchId || matchName;
        });
      }
    }

    this.tasks = list;
  }

  setFilterStatus(status: string): void {
    this.filterStatus = status;
    try {
      localStorage.setItem('contech_tasks_filter_status', status);
    } catch (_) {}
    this.currentPage = 1;
    this.applyFilter();
  }

  setProjectFilter(projectId: any): void {
    this.selectedProjectId = projectId;
    try {
      localStorage.setItem('contech_tasks_project_id', String(projectId));
    } catch (_) {}
    this.currentPage = 1;
    this.applyFilter();
  }

  getTaskProjectId(task: any): any {
    return task.project_id || task.project?.project_id || task.project?.id || task.buyer?.project_id || task.buyer?.project?.project_id || task.siteVisit?.project_id || null;
  }

  getTaskProjectName(task: any): string {
    return task.project?.name || task.project_name || task.buyer?.project?.name || task.buyer?.preferred_project || task.siteVisit?.project?.name || 'General Project';
  }

  getTaskProjectCode(task: any): string {
    return task.project?.code || task.buyer?.project?.code || '';
  }

  getTaskProjectLocation(task: any): string {
    return task.project?.location || task.buyer?.project?.location || '';
  }

  getPendingCountForProject(projectId: any): number {
    if (projectId === 'all') {
      return this.allTasks.filter((t: any) => !this.isCompleted(t)).length;
    }
    if (projectId === 'unassigned') {
      return this.allTasks.filter((t: any) => !this.isCompleted(t) && !this.getTaskProjectId(t)).length;
    }
    return this.allTasks.filter((t: any) => {
      const pId = this.getTaskProjectId(t);
      const pName = (this.getTaskProjectName(t) || '').toLowerCase();
      const matchId = pId && String(pId) === String(projectId);
      const matchName = typeof projectId === 'string' && pName === projectId.toLowerCase();
      return !this.isCompleted(t) && (matchId || matchName);
    }).length;
  }

  getTotalCountForProject(projectId: any): number {
    if (projectId === 'all') {
      return this.allTasks.length;
    }
    if (projectId === 'unassigned') {
      return this.allTasks.filter((t: any) => !this.getTaskProjectId(t)).length;
    }
    return this.allTasks.filter((t: any) => {
      const pId = this.getTaskProjectId(t);
      const pName = (this.getTaskProjectName(t) || '').toLowerCase();
      const matchId = pId && String(pId) === String(projectId);
      const matchName = typeof projectId === 'string' && pName === projectId.toLowerCase();
      return matchId || matchName;
    }).length;
  }

  getBuyerProjectName(buyer: any): string {
    if (!buyer) return 'General Project';
    return buyer.project?.name || buyer.preferred_project || 'General Project';
  }

  getPriorityClass(priority: string): string {
    switch ((priority || '').toUpperCase()) {
      case 'CRITICAL': return 'priority-critical';
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'NORMAL': return 'priority-normal';
      default: return 'priority-high';
    }
  }

  getIntentBadgeClass(score: number): string {
    if (score >= 80) return 'intent-high';
    if (score >= 50) return 'intent-med';
    return 'intent-low';
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
    this.next_follow_up_date = this.toLocalISOString(tomorrow);
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

  quickCompleteTask(task: any, event?: Event): void {
    if (event) event.stopPropagation();
    const id = task.follow_up_task_id || task.id;
    if (!id) return;

    const confirmed = window.confirm(`Mark follow-up "${task.title}" as Completed?`);
    if (!confirmed) return;

    task.completing = true;
    const payload = {
      status: 'COMPLETED',
      outcome_status: 'Completed Directly',
      outcome_notes: 'Marked complete via 1-click quick completion',
      manual_intent_score: task.buyer?.intent_score || 95,
      manual_intent_delta: task.buyer?.intent_delta || 5,
      manual_intent_band: (task.buyer?.intent_score || 95) >= 80 ? 'HIGH' : 'MEDIUM'
    };

    this.taskService.completeTask(id, payload).subscribe({
      next: (res) => {
        task.completing = false;
        task.status = 'COMPLETED';
        task.completed_at = new Date().toISOString();
        task.outcome_status = 'Completed Directly';
        this.showFeedback(`✓ Follow-up marked as Completed!`);
        this.pendingCount = this.allTasks.filter((t: any) => !this.isCompleted(t)).length;
        this.completedCount = this.allTasks.filter((t: any) => this.isCompleted(t)).length;
        this.updateSlaCountdowns();
        this.applyFilter();
      },
      error: () => {
        // Fallback to updateTask
        this.taskService.updateTask(id, { status: 'COMPLETED', completed_at: new Date() }).subscribe({
          next: () => {
            task.completing = false;
            task.status = 'COMPLETED';
            task.completed_at = new Date().toISOString();
            task.outcome_status = 'Completed Directly';
            this.showFeedback(`✓ Follow-up marked as Completed!`);
            this.pendingCount = this.allTasks.filter((t: any) => !this.isCompleted(t)).length;
            this.completedCount = this.allTasks.filter((t: any) => this.isCompleted(t)).length;
            this.updateSlaCountdowns();
            this.applyFilter();
          },
          error: (err2) => {
            task.completing = false;
            alert('Failed to complete follow-up: ' + (err2.error?.message || err2.message || 'Error'));
          }
        });
      }
    });
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
          if (this.selectedTaskForCompletion) {
            this.selectedTaskForCompletion.status = 'COMPLETED';
            this.selectedTaskForCompletion.completed_at = new Date().toISOString();
            this.selectedTaskForCompletion.outcome_status = this.outcome_status;
          }
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
        this.allTasks = this.allTasks.filter(t => (t.follow_up_task_id || t.id) !== id);
        this.pendingCount = this.allTasks.filter(t => t.status === 'PENDING').length;
        this.completedCount = this.allTasks.filter(t => t.status === 'COMPLETED').length;
        this.totalCount = this.allTasks.length;
        this.applyFilter();
        this.showFeedback(`Task "${task.title}" deleted from database.`);
      },
      error: () => {
        this.allTasks = this.allTasks.filter(t => (t.follow_up_task_id || t.id) !== id);
        this.applyFilter();
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
