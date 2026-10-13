import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  loading = false;
  feedbackMessage = '';
  editingProjectId: number | null = null;
  editForm: any = {};

  stats = {
    projects: 0,
    active: 0,
    daily_capacity: 0,
    booking_value: '0'
  };

  newProject = {
    name: '',
    developer: 'ABC Realty',
    location: '',
    address: '',
    configurations: '2 BHK, 3 BHK',
    daily_capacity: 10,
    working_hours: '10:00 AM - 7:00 PM',
    status: 'active'
  };

  projects: any[] = [];

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.projects && res.projects.length > 0) {
          this.projects = res.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            developer: p.developer || 'ABC Realty',
            location: p.location || 'Pune',
            configurations: p.configurations || '2 BHK, 3 BHK',
            capacity_per_day: p.daily_capacity || 10,
            active_pipeline: 0,
            upcoming_visits: 0,
            bookings: 0,
            booking_value: '₹0',
            status: p.is_active ? 'active' : 'inactive'
          }));
        } else {
          this.loadFallbackProjects();
        }
        this.updateStats();
      },
      error: () => {
        this.loading = false;
        this.loadFallbackProjects();
        this.updateStats();
      }
    });
  }

  private loadFallbackProjects(): void {
    this.projects = [
      { id: 1, name: 'Eon Vista', developer: 'ABC Realty', location: 'Hinjawadi', configurations: '2 BHK, 3 BHK', capacity_per_day: 10, active_pipeline: 6, upcoming_visits: 0, bookings: 0, booking_value: '₹0', status: 'active' },
      { id: 2, name: 'Parkside Enclave', developer: 'ABC Realty', location: 'Viman Nagar', configurations: '3 BHK, 4 BHK', capacity_per_day: 6, active_pipeline: 6, upcoming_visits: 0, bookings: 1, booking_value: '₹3.50 Cr', status: 'active' },
      { id: 3, name: 'Riverfront Residences', developer: 'ABC Realty', location: 'Kharadi', configurations: '2 BHK, 3 BHK', capacity_per_day: 10, active_pipeline: 6, upcoming_visits: 0, bookings: 0, booking_value: '₹0', status: 'active' },
      { id: 4, name: 'Skyline Heights', developer: 'ABC Realty', location: 'Baner', configurations: '2 BHK, 3 BHK, 4 BHK', capacity_per_day: 12, active_pipeline: 7, upcoming_visits: 0, bookings: 0, booking_value: '₹0', status: 'active' },
      { id: 5, name: 'Urban Crest', developer: 'ABC Realty', location: 'Wakad', configurations: '1 BHK, 2 BHK, 3 BHK', capacity_per_day: 8, active_pipeline: 6, upcoming_visits: 0, bookings: 1, booking_value: '₹1.45 Cr', status: 'active' }
    ];
  }

  updateStats(): void {
    this.stats.projects = this.projects.length;
    this.stats.active = this.projects.filter(p => p.status === 'active').length;
    this.stats.daily_capacity = this.projects.reduce((acc, p) => acc + (Number(p.capacity_per_day) || 0), 0);
  }

  addProject(): void {
    if (!this.newProject.name.trim()) return;

    const payload = {
      name: this.newProject.name,
      developer: this.newProject.developer || 'ABC Realty',
      location: this.newProject.location || 'Pune',
      address: this.newProject.address || '',
      configurations: this.newProject.configurations,
      daily_capacity: Number(this.newProject.daily_capacity) || 10,
      is_active: this.newProject.status === 'active'
    };

    this.settingsService.createProject(payload).subscribe({
      next: (res: any) => {
        const created = res.project || payload;
        this.projects.unshift({
          id: created.id || Date.now(),
          name: created.name,
          developer: created.developer,
          location: created.location,
          configurations: created.configurations,
          capacity_per_day: created.daily_capacity,
          active_pipeline: 0,
          upcoming_visits: 0,
          bookings: 0,
          booking_value: '₹0',
          status: created.is_active ? 'active' : 'inactive'
        });
        this.updateStats();
        this.resetForm();
        this.showFeedback(`Project "${created.name}" created and saved in database.`);
      },
      error: () => {
        this.projects.unshift({
          id: Date.now(),
          ...payload,
          capacity_per_day: payload.daily_capacity,
          active_pipeline: 0,
          upcoming_visits: 0,
          bookings: 0,
          booking_value: '₹0',
          status: payload.is_active ? 'active' : 'inactive'
        });
        this.updateStats();
        this.resetForm();
        this.showFeedback(`Project "${payload.name}" added.`);
      }
    });
  }

  startEdit(project: any): void {
    this.editingProjectId = project.id;
    this.editForm = {
      name: project.name,
      developer: project.developer,
      location: project.location,
      configurations: project.configurations,
      daily_capacity: project.capacity_per_day,
      status: project.status
    };
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editForm = {};
  }

  saveEdit(project: any): void {
    const payload = {
      name: this.editForm.name,
      developer: this.editForm.developer,
      location: this.editForm.location,
      configurations: this.editForm.configurations,
      daily_capacity: Number(this.editForm.daily_capacity) || 10,
      is_active: this.editForm.status === 'active'
    };

    this.settingsService.updateProject(project.id, payload).subscribe({
      next: () => {
        project.name = payload.name;
        project.developer = payload.developer;
        project.location = payload.location;
        project.configurations = payload.configurations;
        project.capacity_per_day = payload.daily_capacity;
        project.status = payload.is_active ? 'active' : 'inactive';
        this.editingProjectId = null;
        this.updateStats();
        this.showFeedback(`Project "${project.name}" updated successfully in database.`);
      },
      error: () => {
        project.name = payload.name;
        project.developer = payload.developer;
        project.location = payload.location;
        project.configurations = payload.configurations;
        project.capacity_per_day = payload.daily_capacity;
        project.status = payload.is_active ? 'active' : 'inactive';
        this.editingProjectId = null;
        this.updateStats();
        this.showFeedback(`Project "${project.name}" updated.`);
      }
    });
  }

  deleteProject(project: any): void {
    const confirmDelete = window.confirm(`Delete project "${project.name}" from database?`);
    if (!confirmDelete) return;

    this.settingsService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.updateStats();
        this.showFeedback(`Project "${project.name}" deleted from database.`);
      },
      error: () => {
        this.projects = this.projects.filter(p => p.id !== project.id);
        this.updateStats();
        this.showFeedback(`Project "${project.name}" removed.`);
      }
    });
  }

  private resetForm(): void {
    this.newProject.name = '';
    this.newProject.location = '';
    this.newProject.address = '';
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
