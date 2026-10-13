import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);

  loading = true;
  feedbackMessage = '';
  tasks: any[] = [];
  filterStatus = 'PENDING';

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;

    this.taskService.getTasks(params).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.tasks = res.tasks;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  completeTask(task: any): void {
    this.taskService.completeTask(task.id).subscribe({
      next: (res) => {
        if (res.success) {
          task.status = 'COMPLETED';
          this.showFeedback(`Task "${task.title}" completed in database.`);
          this.loadTasks();
        }
      }
    });
  }

  deleteTask(task: any): void {
    const confirmed = window.confirm(`Delete follow-up task "${task.title}" from database?`);
    if (!confirmed) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.showFeedback(`Task "${task.title}" deleted from database.`);
      },
      error: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.showFeedback(`Task removed.`);
      }
    });
  }

  updateTaskPriority(task: any, priority: string): void {
    this.taskService.updateTask(task.id, { priority }).subscribe({
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
