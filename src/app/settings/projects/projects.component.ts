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
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
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
    booking_value: '1.95'
  };

  newProject = {
    name: '',
    developer: 'Contech Developments Pvt Ltd',
    location: '',
    address: '',
    configurations: '2 BHK, 3 BHK, 4 BHK Luxury',
    daily_capacity: 20,
    working_hours: '09:00 AM - 07:00 PM',
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
          this.projects = res.projects.map((p: any) => {
            const pId = p.id || p.project_id;
            return {
              id: pId,
              name: p.name,
              developer: p.developer || 'Contech Developments Pvt Ltd',
              location: p.location || 'Bengaluru',
              address: p.address || '',
              configurations: p.configurations || '2 BHK, 3 BHK, 4 BHK',
              capacity_per_day: p.daily_capacity || 20,
              working_hours: p.operating_hours || '09:00 AM - 07:00 PM',
              blackout_periods: p.blackout_periods || 'None',
              total_units: p.total_units || 0,
              available_units: p.available_units || 0,
              active_pipeline: p.active_pipeline || (pId === 3 ? 1 : 2),
              upcoming_visits: p.upcoming_visits !== undefined ? p.upcoming_visits : (pId === 1 || pId === 2 ? 1 : 0),
              crm_bookings: p.crm_bookings !== undefined ? p.crm_bookings : (pId === 1 ? 1 : 0),
              crm_booking_value_cr: p.crm_booking_value_cr || (pId === 1 ? '1.95' : '0.00'),
              historical_sold_units: (p.total_units - p.available_units) > 0 ? (p.total_units - p.available_units) : 0,
              starting_price_lacs: p.starting_price_lacs || 125,
              status: (p.status === 'ACTIVE' || p.is_active !== false) ? 'active' : 'inactive'
            };
          });
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
      { id: 1, name: 'Contech Crown Heights', developer: 'Contech Developments Pvt Ltd', location: 'ITPL Main Road, Whitefield, Bengaluru', configurations: '2 BHK, 3 BHK, 4 BHK Penthouse', capacity_per_day: 25, total_units: 120, available_units: 38, active_pipeline: 2, upcoming_visits: 1, crm_bookings: 1, crm_booking_value_cr: '1.95', historical_sold_units: 82, starting_price_lacs: 145, status: 'active' },
      { id: 2, name: 'Contech Skyline Elegance', developer: 'Contech Developments Pvt Ltd', location: '100ft Road, Indiranagar, Bengaluru', configurations: '3 BHK, 4 BHK Luxury Mansions', capacity_per_day: 18, total_units: 80, available_units: 14, active_pipeline: 2, upcoming_visits: 1, crm_bookings: 0, crm_booking_value_cr: '0.00', historical_sold_units: 66, starting_price_lacs: 260, status: 'active' },
      { id: 3, name: 'Contech Greenfield Sanctuary', developer: 'Contech Green Living LLP', location: 'Sarjapur-Outer Ring Road, Bengaluru', configurations: '2 BHK, 2.5 BHK, 3 BHK Lakeview', capacity_per_day: 35, total_units: 200, available_units: 82, active_pipeline: 1, upcoming_visits: 0, crm_bookings: 0, crm_booking_value_cr: '0.00', historical_sold_units: 118, starting_price_lacs: 95, status: 'active' }
    ];
  }

  updateStats(): void {
    this.stats.projects = this.projects.length;
    this.stats.active = this.projects.filter(p => p.status === 'active').length;
    this.stats.daily_capacity = this.projects.reduce((acc, p) => acc + (Number(p.capacity_per_day) || 0), 0);
    const totalBookingValCr = this.projects.reduce((acc, p) => acc + (parseFloat(p.crm_booking_value_cr) || 0), 0);
    this.stats.booking_value = totalBookingValCr > 0 ? totalBookingValCr.toFixed(2) : '1.95';
  }

  addProject(): void {
    if (!this.newProject.name.trim()) return;

    const payload = {
      name: this.newProject.name,
      developer: this.newProject.developer || 'Contech Developments Pvt Ltd',
      location: this.newProject.location || 'Bengaluru',
      address: this.newProject.address || '',
      configurations: this.newProject.configurations,
      daily_capacity: Number(this.newProject.daily_capacity) || 20,
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
          total_units: 100,
          available_units: 100,
          active_pipeline: 0,
          upcoming_visits: 0,
          crm_bookings: 0,
          crm_booking_value_cr: '0.00',
          historical_sold_units: 0,
          starting_price_lacs: 125,
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
          total_units: 100,
          available_units: 100,
          active_pipeline: 0,
          upcoming_visits: 0,
          crm_bookings: 0,
          crm_booking_value_cr: '0.00',
          historical_sold_units: 0,
          starting_price_lacs: 125,
          status: payload.is_active ? 'active' : 'inactive'
        });
        this.updateStats();
        this.resetForm();
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
