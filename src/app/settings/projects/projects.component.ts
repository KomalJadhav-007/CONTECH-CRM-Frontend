import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

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
  stats = {
    projects: 5,
    active: 5,
    daily_capacity: 46,
    booking_value: '4.95'
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

  projects = [
    {
      id: 1,
      name: 'Eon Vista',
      developer: 'ABC Realty',
      location: 'Hinjawadi',
      configurations: '2 BHK, 3 BHK',
      capacity_per_day: 10,
      active_pipeline: 6,
      upcoming_visits: 0,
      bookings: 0,
      booking_value: '₹0',
      status: 'active'
    },
    {
      id: 2,
      name: 'Parkside Enclave',
      developer: 'ABC Realty',
      location: 'Viman Nagar',
      configurations: '3 BHK, 4 BHK',
      capacity_per_day: 6,
      active_pipeline: 6,
      upcoming_visits: 0,
      bookings: 1,
      booking_value: '₹3.50 Cr',
      status: 'active'
    },
    {
      id: 3,
      name: 'Riverfront Residences',
      developer: 'ABC Realty',
      location: 'Kharadi',
      configurations: '2 BHK, 3 BHK',
      capacity_per_day: 10,
      active_pipeline: 6,
      upcoming_visits: 0,
      bookings: 0,
      booking_value: '₹0',
      status: 'active'
    },
    {
      id: 4,
      name: 'Skyline Heights',
      developer: 'ABC Realty',
      location: 'Baner',
      configurations: '2 BHK, 3 BHK, 4 BHK',
      capacity_per_day: 12,
      active_pipeline: 7,
      upcoming_visits: 0,
      bookings: 0,
      booking_value: '₹0',
      status: 'active'
    },
    {
      id: 5,
      name: 'Urban Crest',
      developer: 'ABC Realty',
      location: 'Wakad',
      configurations: '1 BHK, 2 BHK, 3 BHK',
      capacity_per_day: 8,
      active_pipeline: 6,
      upcoming_visits: 0,
      bookings: 1,
      booking_value: '₹1.45 Cr',
      status: 'active'
    }
  ];

  ngOnInit(): void {}

  addProject() {
    if (!this.newProject.name.trim()) return;
    this.projects.unshift({
      id: Date.now(),
      name: this.newProject.name,
      developer: this.newProject.developer || 'ABC Realty',
      location: this.newProject.location || 'Pune',
      configurations: this.newProject.configurations,
      capacity_per_day: Number(this.newProject.daily_capacity) || 10,
      active_pipeline: 0,
      upcoming_visits: 0,
      bookings: 0,
      booking_value: '₹0',
      status: this.newProject.status
    });
    this.stats.projects = this.projects.length;
    this.stats.active = this.projects.filter(p => p.status === 'active').length;
    this.newProject.name = '';
    this.newProject.location = '';
    this.newProject.address = '';
  }
}
