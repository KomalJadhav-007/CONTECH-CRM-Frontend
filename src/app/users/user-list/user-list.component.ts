import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})

export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  loading = false;
  searchQuery = '';

  stats = {
    users: 11,
    active: 11,
    without_role: 0
  };

  roles = [
    'Org Admin',
    'Sales Head',
    'Sales Manager',
    'Account Executive',
    'Site Visit Coordinator',
    'Driver',
    'Executive Viewer'
  ];

  users = [
    {
      id: 1,
      name: 'Amit Kulkarni',
      email: 'amit@contechcrm.com',
      designation: 'Account Executive',
      role: 'Account Executive',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 2,
      name: 'Ganesh Pawar',
      email: 'driver@contechcrm.com',
      designation: 'Driver',
      role: 'Driver',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 3,
      name: 'Kavya Rao',
      email: 'kavya.rao@abcrealty.demo',
      designation: 'Account Executive',
      role: 'Account Executive',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 4,
      name: 'Meera Iyer',
      email: 'admin@contechcrm.com',
      designation: 'Organisation Administrator',
      role: 'Org Admin',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 5,
      name: 'Nikhil Shinde',
      email: 'nikhil.shinde@abcrealty.demo',
      designation: 'Account Executive',
      role: 'Account Executive',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 6,
      name: 'Priya Nair',
      email: 'manager@contechcrm.com',
      designation: 'Sales Manager',
      role: 'Sales Manager',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 7,
      name: 'Rajeev Menon',
      email: 'exec@contechcrm.com',
      designation: 'Executive Viewer',
      role: 'Executive Viewer',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 8,
      name: 'Rohit Patil',
      email: 'rohit.patil@abcrealty.demo',
      designation: 'Account Executive',
      role: 'Account Executive',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 9,
      name: 'Sarika Bhosale',
      email: 'coordinator@contechcrm.com',
      designation: 'Site Visit Coordinator',
      role: 'Site Visit Coordinator',
      status: 'active',
      last_login: 'Never'
    },
    {
      id: 10,
      name: 'Sneha Joshi',
      email: 'sneha.joshi@abcrealty.demo',
      designation: 'Account Executive',
      role: 'Account Executive',
      status: 'active',
      last_login: 'Never'
    }
  ];

  ngOnInit(): void {
    this.stats.users = this.users.length;
    this.stats.active = this.users.filter(u => u.status === 'active').length;
  }

  get filteredUsers() {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.designation.toLowerCase().includes(q)
    );
  }

  toggleDeactivate(user: any) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    this.stats.active = this.users.filter(u => u.status === 'active').length;
  }
}

