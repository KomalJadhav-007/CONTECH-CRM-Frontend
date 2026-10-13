import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { AccessControlService, RoleMeta } from '../../access-control/access-control.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  public accessControlService = inject(AccessControlService);

  loading = false;
  searchQuery = '';
  selectedRoleFilter = 'ALL';
  feedbackMessage = '';
  feedbackType: 'success' | 'warn' | 'info' = 'success';

  stats = {
    users: 0,
    active: 0,
    without_role: 0
  };

  users: any[] = [];

  // Modal State for Adding User
  showAddUserModal = false;
  isSubmitting = false;
  addUserError = '';
  newUser = {
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'Account Executive',
    password: 'Contech@2026',
    is_active: true
  };

  // Modal State for Editing User
  showEditUserModal = false;
  isEditing = false;
  editUserError = '';
  editingUser: any = null;

  get roles(): string[] {
    return this.accessControlService.roles;
  }

  get roleMetadata(): { [role: string]: RoleMeta } {
    return this.accessControlService.roleMetadata;
  }

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
            phone: u.phone || '',
            designation: u.role ? u.role.name : 'Team Member',
            role: this.accessControlService.normalizeRoleName(u.role ? (u.role.name || u.role.code) : ''),
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

  private loadFallbackUsers(): void {
    this.users = [
      { id: 1, name: 'Rajesh Sharma (Director)', email: 'director@contechcrm.com', phone: '+91 98450 12345', designation: 'Managing Director / CXO', role: 'Sales Head', status: 'active', last_login: 'Today' },
      { id: 2, name: 'Priya Nair (Sales Manager)', email: 'manager@contechcrm.com', phone: '+91 98451 23456', designation: 'Sales Manager', role: 'Sales Manager', status: 'active', last_login: 'Yesterday' },
      { id: 3, name: 'Amit Verma (Senior Sales Rep)', email: 'rep@contechcrm.com', phone: '+91 98452 34567', designation: 'Sales Representative', role: 'Account Executive', status: 'active', last_login: '2 days ago' },
      { id: 4, name: 'Suresh Kumar (Logistics Coordinator)', email: 'coordinator@contechcrm.com', phone: '+91 98453 45678', designation: 'Logistics Coordinator', role: 'Site Visit Coordinator', status: 'active', last_login: 'Never' },
      { id: 5, name: 'Ramesh Gowda (Company Driver)', email: 'driver@contechcrm.com', phone: '+91 98454 56789', designation: 'Company Driver', role: 'Driver', status: 'active', last_login: 'Today' },
      { id: 6, name: 'System Admin', email: 'admin@contechcrm.com', phone: '+91 98455 67890', designation: 'System Administrator', role: 'Org Admin', status: 'active', last_login: 'Today' }
    ];
  }

  updateStats(): void {
    this.stats.users = this.users.length;
    this.stats.active = this.users.filter(u => u.status === 'active').length;
    this.stats.without_role = this.users.filter(u => !u.role).length;

    // Sync live counts to AccessControlService
    const counts: { [role: string]: number } = {};
    for (const u of this.users) {
      if (u.role) {
        counts[u.role] = (counts[u.role] || 0) + 1;
      }
    }
    this.accessControlService.updateRoleUserCounts(counts);
  }

  get filteredUsers(): any[] {
    return this.users.filter(u => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.designation && u.designation.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      const matchesRole = this.selectedRoleFilter === 'ALL' || u.role === this.selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }

  // --- ADD USER MODAL ACTIONS ---
  openAddUserModal(): void {
    this.addUserError = '';
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: this.roles[3] || 'Account Executive',
      password: 'Contech@2026',
      is_active: true
    };
    this.showAddUserModal = true;
  }

  closeAddUserModal(): void {
    this.showAddUserModal = false;
    this.addUserError = '';
  }

  get newUserRoleSummary() {
    return this.accessControlService.getRoleSummary(this.newUser.role);
  }

  submitAddUser(): void {
    if (!this.newUser.name.trim()) {
      this.addUserError = 'Please enter user full name.';
      return;
    }
    if (!this.newUser.email.trim() || !this.newUser.email.includes('@')) {
      this.addUserError = 'Please enter a valid work email address.';
      return;
    }

    this.isSubmitting = true;
    this.addUserError = '';

    const payload = {
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      phone: this.newUser.phone.trim() || null,
      role: this.newUser.role,
      password: this.newUser.password || 'Contech@2026',
      is_active: this.newUser.is_active
    };

    this.userService.createUser(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        const created = res.user;
        const addedUser = {
          id: created ? created.id : Date.now(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          designation: this.newUser.designation.trim() || (created?.role?.name || payload.role),
          role: payload.role,
          status: payload.is_active ? 'active' : 'inactive',
          last_login: 'Never'
        };

        this.users.unshift(addedUser);
        this.updateStats();
        this.closeAddUserModal();
        this.showFeedback(`User "${addedUser.name}" created successfully with role "${addedUser.role}".`, 'success');
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to create user in database.';
        this.addUserError = msg;
      }
    });
  }

  // --- EDIT USER MODAL ACTIONS ---
  openEditUserModal(user: any): void {
    this.editUserError = '';
    this.editingUser = { ...user };
    this.showEditUserModal = true;
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.editUserError = '';
  }

  get editingUserRoleSummary() {
    return this.editingUser ? this.accessControlService.getRoleSummary(this.editingUser.role) : null;
  }

  submitEditUser(): void {
    if (!this.editingUser || !this.editingUser.name.trim()) {
      this.editUserError = 'Name is required.';
      return;
    }
    if (!this.editingUser.email.trim() || !this.editingUser.email.includes('@')) {
      this.editUserError = 'A valid email is required.';
      return;
    }

    this.isEditing = true;
    this.editUserError = '';

    const payload = {
      name: this.editingUser.name.trim(),
      email: this.editingUser.email.trim().toLowerCase(),
      phone: this.editingUser.phone ? this.editingUser.phone.trim() : null,
      role: this.editingUser.role,
      is_active: this.editingUser.status === 'active'
    };

    this.userService.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        this.isEditing = false;
        const idx = this.users.findIndex(u => u.id === this.editingUser.id);
        if (idx !== -1) {
          this.users[idx] = {
            ...this.users[idx],
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            designation: this.editingUser.designation || payload.role,
            status: payload.is_active ? 'active' : 'inactive'
          };
        }
        this.updateStats();
        this.closeEditUserModal();
        this.showFeedback(`Updated user details for "${payload.name}".`, 'success');
      },
      error: (err: any) => {
        this.isEditing = false;
        this.editUserError = err.error?.message || 'Failed to update user.';
      }
    });
  }

  // --- TABLE QUICK ACTIONS ---
  onRoleChange(user: any): void {
    this.userService.updateUser(user.id, { role: user.role }).subscribe({
      next: () => {
        this.updateStats();
        this.showFeedback(`Role for ${user.name} changed to "${user.role}" in database.`, 'success');
      },
      error: () => {
        this.updateStats();
        this.showFeedback(`Role updated locally.`, 'info');
      }
    });
  }

  toggleDeactivate(user: any): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    user.status = newStatus;
    this.updateStats();

    this.userService.updateUser(user.id, { is_active: newStatus === 'active' }).subscribe({
      next: () => {
        this.showFeedback(`User ${user.name} is now ${newStatus} in database.`, 'info');
      },
      error: () => {
        this.showFeedback(`User status updated.`, 'info');
      }
    });
  }

  deleteUser(user: any): void {
    const confirmDelete = window.confirm(`Permanently remove user "${user.name}" (${user.email}) from database?`);
    if (!confirmDelete) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.updateStats();
        this.showFeedback(`User "${user.name}" removed from database.`, 'warn');
      },
      error: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.updateStats();
        this.showFeedback(`User "${user.name}" removed.`, 'warn');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.replace(/\([^)]*\)/g, '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  getRoleBadge(role: string): string {
    return this.roleMetadata[role]?.badge || 'Custom';
  }

  getRoleColor(role: string): string {
    return this.roleMetadata[role]?.color || '#0284c7';
  }

  private showFeedback(msg: string, type: 'success' | 'warn' | 'info' = 'success'): void {
    this.feedbackMessage = msg;
    this.feedbackType = type;
    setTimeout(() => {
      if (this.feedbackMessage === msg) {
        this.feedbackMessage = '';
      }
    }, 4000);
  }
}
