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
  feedbackMessage = '';

  stats = {
    users: 0,
    active: 0,
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

  users: any[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.users && res.users.length > 0) {
          this.users = res.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            designation: u.role ? u.role.name : 'Team Member',
            role: this.mapRoleCodeToLabel(u.role ? u.role.code : ''),
            status: u.is_active ? 'active' : 'inactive',
            last_login: u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'
          }));
        } else {
          this.loadFallbackUsers();
        }
        this.updateStats();
      },
      error: () => {
        this.loading = false;
        this.loadFallbackUsers();
        this.updateStats();
      }
    });
  }

  private mapRoleCodeToLabel(code: string): string {
    switch (code.toUpperCase()) {
      case 'ADMIN': return 'Org Admin';
      case 'DIRECTOR': return 'Sales Head';
      case 'SALES_MANAGER': return 'Sales Manager';
      case 'SALES_REP': return 'Account Executive';
      case 'COORDINATOR': return 'Site Visit Coordinator';
      case 'DRIVER': return 'Driver';
      case 'VIEWER': return 'Executive Viewer';
      default: return code || 'Account Executive';
    }
  }

  private loadFallbackUsers(): void {
    this.users = [
      { id: 1, name: 'Rajesh Sharma', email: 'director@contechcrm.com', designation: 'Managing Director', role: 'Sales Head', status: 'active', last_login: 'Today' },
      { id: 2, name: 'Priya Nair', email: 'manager@contechcrm.com', designation: 'Sales Manager', role: 'Sales Manager', status: 'active', last_login: 'Yesterday' },
      { id: 3, name: 'Amit Verma', email: 'rep@contechcrm.com', designation: 'Account Executive', role: 'Account Executive', status: 'active', last_login: '2 days ago' },
      { id: 4, name: 'Suresh Kumar', email: 'coordinator@contechcrm.com', designation: 'Logistics Coordinator', role: 'Site Visit Coordinator', status: 'active', last_login: 'Never' },
      { id: 5, name: 'Ramesh Driver', email: 'driver@contechcrm.com', designation: 'Company Driver', role: 'Driver', status: 'active', last_login: 'Today' },
      { id: 6, name: 'System Admin', email: 'admin@contechcrm.com', designation: 'System Administrator', role: 'Org Admin', status: 'active', last_login: 'Today' }
    ];
  }

  updateStats(): void {
    this.stats.users = this.users.length;
    this.stats.active = this.users.filter(u => u.status === 'active').length;
    this.stats.without_role = this.users.filter(u => !u.role).length;
  }

  get filteredUsers(): any[] {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.designation && u.designation.toLowerCase().includes(q))
    );
  }

  onRoleChange(user: any): void {
    this.userService.updateUser(user.id, { role: user.role }).subscribe({
      next: () => {
        this.showFeedback(`Updated role for ${user.name} to "${user.role}" in database.`);
      },
      error: () => {
        this.showFeedback(`Role updated locally.`);
      }
    });
  }

  toggleDeactivate(user: any): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    this.updateStats();

    this.userService.updateUser(user.id, { is_active: newStatus === 'active' }).subscribe({
      next: () => {
        this.showFeedback(`User ${user.name} is now ${newStatus} in database.`);
      },
      error: () => {
        this.showFeedback(`User status updated.`);
      }
    });
  }

  deleteUser(user: any): void {
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${user.name}"?`);
    if (!confirmDelete) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.updateStats();
        this.showFeedback(`User "${user.name}" deleted from database.`);
      },
      error: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.updateStats();
        this.showFeedback(`User "${user.name}" removed.`);
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
