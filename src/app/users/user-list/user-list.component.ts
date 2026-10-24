import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../user.service';
import { AccessControlService, RoleMeta } from '../../access-control/access-control.service';
import { SettingsService } from '../../settings/settings.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  public accessControlService = inject(AccessControlService);
  private settingsService = inject(SettingsService);

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
  availableProjects: any[] = [];

  // Modal State for Adding User
  showAddUserModal = false;
  isSubmitting = false;
  addUserError = '';
  showNewPassword = false;
  newUser = {
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'Account Executive',
    password: 'Contech@2026',
    is_active: true,
    all_projects: true,
    assigned_project_ids: [] as number[]
  };

  // Modal State for Editing User
  showEditUserModal = false;
  isEditing = false;
  editUserError = '';
  editingUser: any = null;
  showEditPassword = false;

  get roles(): string[] {
    return this.accessControlService.roles;
  }

  get roleMetadata(): { [role: string]: RoleMeta } {
    return this.accessControlService.roleMetadata;
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsers();
  }

  loadProjects(): void {
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.projects && res.projects.length > 0) {
          this.availableProjects = res.projects;
        } else if (res && res.settings && res.settings.projects) {
          this.availableProjects = res.settings.projects;
        } else {
          this.availableProjects = [
            { project_id: 1, id: 1, name: 'Contech Crown Heights', code: 'CCH-BLR', location: 'Whitefield, Bengaluru' },
            { project_id: 2, id: 2, name: 'Contech Skyline Elegance', code: 'CSE-BLR', location: 'Indiranagar, Bengaluru' },
            { project_id: 3, id: 3, name: 'Contech Greenfield Sanctuary', code: 'CGS-BLR', location: 'Sarjapur Road, Bengaluru' }
          ];
        }
      },
      error: () => {
        this.availableProjects = [
          { project_id: 1, id: 1, name: 'Contech Crown Heights', code: 'CCH-BLR', location: 'Whitefield, Bengaluru' },
          { project_id: 2, id: 2, name: 'Contech Skyline Elegance', code: 'CSE-BLR', location: 'Indiranagar, Bengaluru' },
          { project_id: 3, id: 3, name: 'Contech Greenfield Sanctuary', code: 'CGS-BLR', location: 'Sarjapur Road, Bengaluru' }
        ];
      }
    });
  }

  // Reassignment Safeguard Modal State (SOW Sec 5)
  showReassignModal = false;
  isReassigning = false;
  reassignError = '';
  reassignUser: any = null;
  reassignStats: any = null;
  selectedReassignTargetId: number | null = null;
  reassignAction: 'deactivate' | 'delete' = 'deactivate';

  get otherActiveUsers(): any[] {
    if (!this.reassignUser) return this.users.filter(u => u.status === 'active');
    return this.users.filter(u => u.status === 'active' && u.id !== this.reassignUser.id);
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res && res.success && res.users && res.users.length > 0) {
          this.users = res.users.map((u: any) => {
            const assignedList = u.assigned_projects || [];
            const assignedIds = u.assigned_project_ids || assignedList.map((p: any) => p.project_id || p.id);
            const isUniversal = u.has_all_projects_access !== undefined ? u.has_all_projects_access : assignedIds.length === 0;
            return {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone || '',
              designation: u.role ? u.role.name : 'Team Member',
              role: this.accessControlService.normalizeRoleName(u.role ? (u.role.name || u.role.code) : ''),
              manager_id: u.manager_id,
              manager_name: u.manager ? u.manager.name : (u.manager_name || 'None'),
              status: u.is_active ? 'active' : 'inactive',
              last_login: u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never',
              assigned_projects: assignedList,
              assigned_project_ids: assignedIds,
              has_all_projects_access: isUniversal
            };
          });
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
    this.showNewPassword = false;
    this.newUser = {
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: this.roles[3] || 'Account Executive',
      password: 'Contech@2026',
      is_active: true,
      all_projects: true,
      assigned_project_ids: []
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

  toggleProjectForNewUser(projectId: number): void {
    const idx = this.newUser.assigned_project_ids.indexOf(projectId);
    if (idx > -1) {
      this.newUser.assigned_project_ids.splice(idx, 1);
    } else {
      this.newUser.assigned_project_ids.push(projectId);
    }
  }

  isProjectSelectedForNewUser(projectId: number): boolean {
    return this.newUser.assigned_project_ids.includes(projectId);
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

    const assignedIds = this.newUser.all_projects ? [] : this.newUser.assigned_project_ids;
    const payload = {
      name: this.newUser.name.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      phone: this.newUser.phone.trim() || null,
      role: this.newUser.role,
      password: this.newUser.password || 'Contech@2026',
      is_active: this.newUser.is_active,
      assigned_project_ids: assignedIds
    };

    this.userService.createUser(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        const created = res.user;
        const assignedObjs = this.newUser.all_projects
          ? []
          : this.availableProjects.filter(p => assignedIds.includes(p.id || p.project_id));

        const addedUser = {
          id: created ? created.id : Date.now(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone || '',
          designation: this.newUser.designation.trim() || (created?.role?.name || payload.role),
          role: payload.role,
          status: payload.is_active ? 'active' : 'inactive',
          last_login: 'Never',
          assigned_projects: assignedObjs,
          assigned_project_ids: assignedIds,
          has_all_projects_access: this.newUser.all_projects || assignedIds.length === 0
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

  generatePasswordForNewUser(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newUser.password = pwd;
    this.showNewPassword = true;
  }

  setDefaultPasswordForNewUser(): void {
    this.newUser.password = 'Contech@2026';
    this.showNewPassword = true;
  }

  // --- EDIT USER MODAL ACTIONS ---
  openEditUserModal(user: any): void {
    this.editUserError = '';
    const currentAssignedIds = user.assigned_project_ids || (user.assigned_projects ? user.assigned_projects.map((p: any) => p.project_id || p.id) : []);
    this.editingUser = {
      ...user,
      password: '', // blank by default: keeps existing password intact unless set
      all_projects: user.has_all_projects_access || currentAssignedIds.length === 0,
      assigned_project_ids: [...currentAssignedIds]
    };
    this.showEditPassword = false;
    this.showEditUserModal = true;
  }

  closeEditUserModal(): void {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.showEditPassword = false;
    this.editUserError = '';
  }

  toggleProjectForEditingUser(projectId: number): void {
    if (!this.editingUser) return;
    if (!this.editingUser.assigned_project_ids) this.editingUser.assigned_project_ids = [];
    const idx = this.editingUser.assigned_project_ids.indexOf(projectId);
    if (idx > -1) {
      this.editingUser.assigned_project_ids.splice(idx, 1);
    } else {
      this.editingUser.assigned_project_ids.push(projectId);
    }
  }

  isProjectSelectedForEditingUser(projectId: number): boolean {
    return this.editingUser?.assigned_project_ids?.includes(projectId) || false;
  }

  generatePasswordForEdit(): void {
    if (!this.editingUser) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.editingUser.password = pwd;
    this.showEditPassword = true;
  }

  setDefaultPasswordForEdit(): void {
    if (!this.editingUser) return;
    this.editingUser.password = 'Contech@2026';
    this.showEditPassword = true;
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

    const assignedIds = this.editingUser.all_projects ? [] : (this.editingUser.assigned_project_ids || []);
    const payload: any = {
      name: this.editingUser.name.trim(),
      email: this.editingUser.email.trim().toLowerCase(),
      phone: this.editingUser.phone ? this.editingUser.phone.trim() : null,
      role: this.editingUser.role,
      is_active: this.editingUser.status === 'active',
      assigned_project_ids: assignedIds
    };

    let hasPasswordUpdate = false;
    if (this.editingUser.password && this.editingUser.password.trim()) {
      const cleanPwd = this.editingUser.password.trim();
      if (cleanPwd.length < 6) {
        this.editUserError = 'Password must be at least 6 characters long.';
        this.isEditing = false;
        return;
      }
      payload.password = cleanPwd;
      hasPasswordUpdate = true;
    }

    this.userService.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        this.isEditing = false;
        const idx = this.users.findIndex(u => u.id === this.editingUser.id);
        const assignedObjs = this.editingUser.all_projects
          ? []
          : this.availableProjects.filter(p => assignedIds.includes(p.id || p.project_id));

        if (idx !== -1) {
          this.users[idx] = {
            ...this.users[idx],
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            role: payload.role,
            designation: this.editingUser.designation || payload.role,
            status: payload.is_active ? 'active' : 'inactive',
            assigned_projects: assignedObjs,
            assigned_project_ids: assignedIds,
            has_all_projects_access: this.editingUser.all_projects || assignedIds.length === 0
          };
        }
        this.updateStats();
        this.closeEditUserModal();
        this.showFeedback(
          hasPasswordUpdate
            ? `Updated profile & password for "${payload.name}".`
            : `Updated user details for "${payload.name}".`,
          'success'
        );
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
    if (user.status === 'active') {
      // Deactivating: check open assignments safeguard first
      this.userService.getOpenAssignments(user.id).subscribe({
        next: (res: any) => {
          if (res && res.has_open_items) {
            this.reassignUser = user;
            this.reassignStats = res;
            this.reassignAction = 'deactivate';
            this.selectedReassignTargetId = this.otherActiveUsers.length > 0 ? this.otherActiveUsers[0].id : null;
            this.showReassignModal = true;
          } else {
            this.executeStatusChange(user, 'inactive');
          }
        },
        error: () => {
          this.executeStatusChange(user, 'inactive');
        }
      });
    } else {
      this.executeStatusChange(user, 'active');
    }
  }

  private executeStatusChange(user: any, newStatus: string): void {
    user.status = newStatus;
    this.updateStats();

    this.userService.updateUser(user.id, { is_active: newStatus === 'active' }).subscribe({
      next: () => {
        this.showFeedback(`User ${user.name} is now ${newStatus} in database.`, 'info');
      },
      error: (err: any) => {
        this.showFeedback(err.error?.message || 'Failed to update user status.', 'warn');
        this.loadUsers();
      }
    });
  }

  deleteUser(user: any): void {
    this.userService.getOpenAssignments(user.id).subscribe({
      next: (res: any) => {
        if (res && res.has_open_items) {
          this.reassignUser = user;
          this.reassignStats = res;
          this.reassignAction = 'delete';
          this.selectedReassignTargetId = this.otherActiveUsers.length > 0 ? this.otherActiveUsers[0].id : null;
          this.showReassignModal = true;
        } else {
          const confirmDelete = window.confirm(`Permanently remove user "${user.name}" (${user.email}) from database?`);
          if (!confirmDelete) return;

          this.userService.deleteUser(user.id).subscribe({
            next: () => {
              this.users = this.users.filter(u => u.id !== user.id);
              this.updateStats();
              this.showFeedback(`User "${user.name}" removed from database.`, 'warn');
            },
            error: (err: any) => {
              this.showFeedback(err.error?.message || 'Failed to delete user.', 'warn');
            }
          });
        }
      },
      error: () => {
        this.showFeedback('Could not verify open assignments.', 'warn');
      }
    });
  }

  confirmReassignment(): void {
    if (!this.reassignUser || !this.selectedReassignTargetId) {
      this.reassignError = 'Please select an active team member to transfer assignments to.';
      return;
    }

    this.isReassigning = true;
    this.reassignError = '';

    if (this.reassignAction === 'deactivate') {
      this.userService.updateUser(this.reassignUser.id, {
        is_active: false,
        reassign_to_user_id: this.selectedReassignTargetId
      }).subscribe({
        next: () => {
          this.isReassigning = false;
          this.showReassignModal = false;
          this.reassignUser.status = 'inactive';
          this.updateStats();
          this.showFeedback(`Safeguard completed: Transferred all open records and deactivated ${this.reassignUser.name}.`, 'success');
          this.reassignUser = null;
        },
        error: (err: any) => {
          this.isReassigning = false;
          this.reassignError = err.error?.message || 'Failed to reassign records.';
        }
      });
    } else {
      this.userService.deleteUser(this.reassignUser.id, {
        reassign_to_user_id: this.selectedReassignTargetId
      }).subscribe({
        next: () => {
          this.isReassigning = false;
          this.showReassignModal = false;
          this.users = this.users.filter(u => u.id !== this.reassignUser.id);
          this.updateStats();
          this.showFeedback(`Safeguard completed: Transferred all open records and removed ${this.reassignUser.name}.`, 'success');
          this.reassignUser = null;
        },
        error: (err: any) => {
          this.isReassigning = false;
          this.reassignError = err.error?.message || 'Failed to transfer and delete user.';
        }
      });
    }
  }

  closeReassignModal(): void {
    this.showReassignModal = false;
    this.reassignUser = null;
    this.reassignStats = null;
    this.reassignError = '';
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
