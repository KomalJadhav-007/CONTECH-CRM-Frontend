import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AccessControlService, PermissionMatrix, RoleMeta } from '../access-control.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-access-control-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  templateUrl: './access-control-view.component.html',
  styleUrl: './access-control-view.component.css'
})
export class AccessControlViewComponent implements OnInit {
  private accessService = inject(AccessControlService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Access Scope: Role-based or User-specific
  accessScope: 'ROLE' | 'USER' = 'ROLE';

  roles = this.accessService.roles;
  modules = this.accessService.modules;
  permissionColumns = this.accessService.permissionColumns;
  roleMetadata = this.accessService.roleMetadata;
  moduleCategories = this.accessService.moduleCategories;

  // Role mode state
  selectedRole = 'Account Executive';
  rolePermissions: PermissionMatrix = {};
  cloneSourceRole = '';

  // Specific Person (User) mode state
  users: any[] = [];
  selectedUserId: string | number = '';
  selectedUser: any = null;
  userPermissionsMap: { [userId: string]: { [module: string]: { [permission: string]: boolean } } } = {};
  activeUserMatrix: { [module: string]: { [permission: string]: boolean } } = {};
  cloneSourceUser = '';
  userFilterSearch = '';

  // Toolbar & Filtering
  searchQuery = '';
  selectedCategory = 'ALL';
  categories = ['ALL', 'Intelligence', 'Pipeline', 'Site Visit Ops', 'Administration'];

  notificationMessage = '';
  notificationType: 'info' | 'success' | 'warn' = 'info';
  isSaving = false;
  hasUnsavedChanges = false;

  // Add custom role modal
  showAddRoleModal = false;
  newRole = {
    name: '',
    badge: 'Custom',
    color: '#0284c7',
    description: '',
    cloneFrom: 'Account Executive'
  };

  // Quick Give Access to Person modal
  showQuickGrantModal = false;
  quickGrantTargetUserId = '';
  quickGrantSource = 'role:Account Executive';

  ngOnInit(): void {
    this.rolePermissions = this.accessService.getCurrentMatrix();
    this.userPermissionsMap = this.accessService.getAllUserPermissions();
    this.users = this.accessService.getAllUsers();

    // Listen to role permissions updates
    this.accessService.permissions$.subscribe(matrix => {
      this.rolePermissions = JSON.parse(JSON.stringify(matrix));
      if (this.accessScope === 'USER' && this.selectedUser && !this.isUserOverridden(this.selectedUserId)) {
        this.syncActiveUserMatrix();
      }
    });

    // Listen to user permissions overrides updates
    this.accessService.userPermissions$.subscribe(uMap => {
      this.userPermissionsMap = JSON.parse(JSON.stringify(uMap || {}));
      if (this.accessScope === 'USER' && this.selectedUser) {
        this.syncActiveUserMatrix();
      }
    });

    // Listen to users list updates
    this.accessService.allUsers$.subscribe(users => {
      if (users && users.length > 0) {
        this.users = users;
        if (!this.selectedUser && this.users.length > 0) {
          const targetId = this.selectedUserId || (this.users[0].user_id || this.users[0].id);
          const found = this.users.find(u => (u.user_id || u.id) == targetId) || this.users[0];
          this.selectUser(found);
        }
      }
    });

    this.accessService.fetchUserCounts();

    // Check query params for deep-linking (e.g. ?userId=5 or ?role=Sales%20Head)
    this.route.queryParams.subscribe(params => {
      const uId = params['userId'] || params['user_id'];
      if (uId) {
        this.setAccessScope('USER');
        const found = this.users.find(u => (u.user_id || u.id) == uId);
        if (found) {
          this.selectUser(found);
        } else {
          this.selectedUserId = uId;
        }
      } else if (params['role']) {
        this.setAccessScope('ROLE');
        this.selectRole(params['role']);
      }
    });
  }

  // --- SCOPE SWITCHING ---
  setAccessScope(scope: 'ROLE' | 'USER'): void {
    this.accessScope = scope;
    if (scope === 'USER') {
      if (!this.selectedUser && this.users.length > 0) {
        this.selectUser(this.users[0]);
      } else if (this.selectedUser) {
        this.syncActiveUserMatrix();
      }
      this.showNotification(`Switched to Specific Person Access mode. Select any team member to customize individual permissions.`, 'info');
    } else {
      this.showNotification(`Switched to Role-Based Access mode. Matrix applies to all users assigned to the active role.`, 'info');
    }
  }

  // --- ROLE LOGIC ---
  get currentRoleMeta(): RoleMeta {
    return this.roleMetadata[this.selectedRole] || {
      name: this.selectedRole,
      badge: 'Role',
      color: '#0f172a',
      description: 'Platform access profile.',
      usersCount: 0
    };
  }

  get filteredModules(): string[] {
    return this.modules.filter(mod => {
      const matchesSearch = !this.searchQuery || 
        mod.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (this.moduleCategories[mod] && this.moduleCategories[mod].toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCat = this.selectedCategory === 'ALL' || this.moduleCategories[mod] === this.selectedCategory;
      return matchesSearch && matchesCat;
    });
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.onRoleChange();
  }

  onRoleChange(): void {
    this.showNotification(`Active matrix loaded for "${this.selectedRole}".`, 'info');
  }

  togglePermission(mod: string, col: string): void {
    if (!this.rolePermissions[this.selectedRole]) return;
    const isGranted = this.rolePermissions[this.selectedRole][mod][col];
    this.hasUnsavedChanges = true;
    this.saveToStorage();
    this.showNotification(
      `Updated: ${col} permission ${isGranted ? 'granted' : 'revoked'} for ${mod} (${this.selectedRole}).`,
      'info'
    );
  }

  grantAllForRole(): void {
    if (!this.rolePermissions[this.selectedRole]) return;
    this.modules.forEach(mod => {
      this.permissionColumns.forEach(col => {
        this.rolePermissions[this.selectedRole][mod][col] = true;
      });
    });
    this.hasUnsavedChanges = true;
    this.saveToStorage();
    this.showNotification(`All permissions granted for "${this.selectedRole}".`, 'success');
  }

  revokeAllForRole(): void {
    if (!this.rolePermissions[this.selectedRole]) return;
    this.modules.forEach(mod => {
      this.permissionColumns.forEach(col => {
        this.rolePermissions[this.selectedRole][mod][col] = false;
      });
    });
    this.hasUnsavedChanges = true;
    this.saveToStorage();
    this.showNotification(`All permissions revoked for "${this.selectedRole}".`, 'warn');
  }

  toggleRow(mod: string): void {
    if (!this.rolePermissions[this.selectedRole]) return;
    const allActive = this.isAllGrantedForModule(mod);
    this.permissionColumns.forEach(col => {
      this.rolePermissions[this.selectedRole][mod][col] = !allActive;
    });
    this.hasUnsavedChanges = true;
    this.saveToStorage();
    this.showNotification(
      `${allActive ? 'Revoked all' : 'Granted all'} actions for "${mod}" (${this.selectedRole}).`,
      'info'
    );
  }

  toggleColumn(col: string): void {
    if (!this.rolePermissions[this.selectedRole]) return;
    const allActive = this.isAllGrantedForColumn(col);
    this.modules.forEach(mod => {
      this.rolePermissions[this.selectedRole][mod][col] = !allActive;
    });
    this.hasUnsavedChanges = true;
    this.saveToStorage();
    this.showNotification(
      `${allActive ? 'Revoked all' : 'Granted all'} "${col}" permissions across modules.`,
      'info'
    );
  }

  clonePermissionsFrom(sourceRole: string): void {
    if (!sourceRole || sourceRole === this.selectedRole) return;
    if (!this.rolePermissions[sourceRole]) return;

    this.rolePermissions[this.selectedRole] = JSON.parse(
      JSON.stringify(this.rolePermissions[sourceRole])
    );
    this.hasUnsavedChanges = true;
    this.cloneSourceRole = '';
    this.saveToStorage();
    this.showNotification(`Copied all permissions from "${sourceRole}" to "${this.selectedRole}".`, 'success');
  }

  resetCurrentRole(): void {
    const confirmed = window.confirm(`Reset "${this.selectedRole}" permissions to system defaults?`);
    if (!confirmed) return;

    this.rolePermissions = this.accessService.resetRoleToDefault(this.selectedRole);
    this.hasUnsavedChanges = false;
    this.showNotification(`Reset "${this.selectedRole}" to default permissions.`, 'info');
  }

  isCustomRole(role: string): boolean {
    return this.accessService.isCustomRole(role);
  }

  openAddRoleModal(): void {
    this.newRole = {
      name: '',
      badge: 'Custom',
      color: '#0284c7',
      description: '',
      cloneFrom: 'Account Executive'
    };
    this.showAddRoleModal = true;
  }

  closeAddRoleModal(): void {
    this.showAddRoleModal = false;
  }

  createCustomRole(): void {
    if (!this.newRole.name.trim()) return;
    const name = this.newRole.name.trim();

    if (this.roles.includes(name)) {
      this.showNotification(`A role named "${name}" already exists.`, 'warn');
      return;
    }

    this.accessService.addCustomRole(
      name,
      {
        badge: this.newRole.badge || 'Custom',
        color: this.newRole.color || '#0284c7',
        description: this.newRole.description || 'Custom security profile.'
      },
      this.newRole.cloneFrom
    ).subscribe({
      next: () => {
        this.selectedRole = name;
        this.showAddRoleModal = false;
        this.showNotification(`Role "${name}" created and saved to database.`, 'success');
      }
    });
  }

  deleteCurrentRole(): void {
    if (!this.isCustomRole(this.selectedRole)) {
      this.showNotification(`Default system role "${this.selectedRole}" cannot be deleted.`, 'warn');
      return;
    }

    const toDelete = this.selectedRole;
    const confirmed = window.confirm(`Permanently delete custom role "${toDelete}" and all its permissions from the database?`);
    if (!confirmed) return;

    this.accessService.deleteCustomRole(toDelete).subscribe({
      next: () => {
        this.selectedRole = 'Account Executive';
        this.showNotification(`Custom role "${toDelete}" deleted from database.`, 'success');
      }
    });
  }

  // --- USER (SPECIFIC PERSON) LOGIC ---
  selectUser(user: any): void {
    if (!user) return;
    this.selectedUser = user;
    this.selectedUserId = user.user_id || user.id;
    this.syncActiveUserMatrix();
  }

  onUserChange(): void {
    const found = this.users.find(u => (u.user_id || u.id) == this.selectedUserId);
    if (found) {
      this.selectUser(found);
      this.showNotification(`Active permissions matrix loaded for "${found.name}".`, 'info');
    }
  }

  syncActiveUserMatrix(): void {
    if (!this.selectedUser) return;
    const uid = String(this.selectedUserId);
    const override = this.userPermissionsMap[uid];
    if (override) {
      this.activeUserMatrix = JSON.parse(JSON.stringify(override));
    } else {
      const roleName = this.getUserRoleName(this.selectedUser);
      const defaults = this.rolePermissions[roleName] || this.accessService.getDefaultPermissionsForRole(roleName);
      this.activeUserMatrix = JSON.parse(JSON.stringify(defaults));
    }
  }

  isUserOverridden(userId: any): boolean {
    if (!userId) return false;
    return !!this.userPermissionsMap[String(userId)];
  }

  get overriddenUsersCount(): number {
    return Object.keys(this.userPermissionsMap).length;
  }

  getUserRoleName(user: any): string {
    return this.accessService.normalizeRoleName(
      user?.role ? (user.role.name || user.role.code || user.role) : (user?.role_code || '')
    );
  }

  getUserRoleColor(user: any): string {
    const rName = this.getUserRoleName(user);
    return this.roleMetadata[rName] ? this.roleMetadata[rName].color : '#0284c7';
  }

  isUserPermissionGranted(mod: string, col: string): boolean {
    return !!(this.activeUserMatrix && this.activeUserMatrix[mod] && this.activeUserMatrix[mod][col]);
  }

  getRoleDefaultPermission(user: any, mod: string, col: string): boolean {
    const role = this.getUserRoleName(user);
    return !!(this.rolePermissions[role]?.[mod]?.[col]);
  }

  isCellOverriddenForUser(mod: string, col: string): boolean {
    if (!this.selectedUser || !this.isUserOverridden(this.selectedUserId)) return false;
    const currentVal = !!(this.activeUserMatrix[mod]?.[col]);
    const defaultVal = this.getRoleDefaultPermission(this.selectedUser, mod, col);
    return currentVal !== defaultVal;
  }

  getUserOverriddenCount(): number {
    if (!this.selectedUser || !this.isUserOverridden(this.selectedUserId)) return 0;
    let count = 0;
    for (const mod of this.modules) {
      for (const col of this.permissionColumns) {
        if (this.isCellOverriddenForUser(mod, col)) {
          count++;
        }
      }
    }
    return count;
  }

  getUserGrantedCount(): number {
    if (!this.activeUserMatrix) return 0;
    let count = 0;
    for (const mod of this.modules) {
      for (const col of this.permissionColumns) {
        if (this.activeUserMatrix[mod]?.[col]) {
          count++;
        }
      }
    }
    return count;
  }

  getUserCoveragePercent(): number {
    const granted = this.getUserGrantedCount();
    const total = this.getTotalPossible();
    return Math.round((granted / total) * 100);
  }

  toggleUserPermission(mod: string, col: string): void {
    if (!this.selectedUser) return;
    if (!this.activeUserMatrix[mod]) this.activeUserMatrix[mod] = {};
    const isGranted = this.activeUserMatrix[mod][col];
    this.hasUnsavedChanges = true;
    this.saveUserToStorage();
    this.showNotification(
      `Updated: ${col} permission ${isGranted ? 'granted' : 'revoked'} for ${mod} (${this.selectedUser.name}).`,
      'info'
    );
  }

  grantAllForUser(): void {
    if (!this.selectedUser) return;
    this.modules.forEach(mod => {
      if (!this.activeUserMatrix[mod]) this.activeUserMatrix[mod] = {};
      this.permissionColumns.forEach(col => {
        this.activeUserMatrix[mod][col] = true;
      });
    });
    this.hasUnsavedChanges = true;
    this.saveUserToStorage();
    this.showNotification(`All permissions granted to "${this.selectedUser.name}".`, 'success');
  }

  revokeAllForUser(): void {
    if (!this.selectedUser) return;
    this.modules.forEach(mod => {
      if (!this.activeUserMatrix[mod]) this.activeUserMatrix[mod] = {};
      this.permissionColumns.forEach(col => {
        this.activeUserMatrix[mod][col] = false;
      });
    });
    this.hasUnsavedChanges = true;
    this.saveUserToStorage();
    this.showNotification(`All permissions revoked for "${this.selectedUser.name}".`, 'warn');
  }

  toggleUserRow(mod: string): void {
    if (!this.selectedUser || !this.activeUserMatrix[mod]) return;
    const allActive = this.isAllGrantedForUserModule(mod);
    this.permissionColumns.forEach(col => {
      this.activeUserMatrix[mod][col] = !allActive;
    });
    this.hasUnsavedChanges = true;
    this.saveUserToStorage();
    this.showNotification(
      `${allActive ? 'Revoked all' : 'Granted all'} actions for "${mod}" (${this.selectedUser.name}).`,
      'info'
    );
  }

  toggleUserColumn(col: string): void {
    if (!this.selectedUser) return;
    const allActive = this.isAllGrantedForUserColumn(col);
    this.modules.forEach(mod => {
      if (!this.activeUserMatrix[mod]) this.activeUserMatrix[mod] = {};
      this.activeUserMatrix[mod][col] = !allActive;
    });
    this.hasUnsavedChanges = true;
    this.saveUserToStorage();
    this.showNotification(
      `${allActive ? 'Revoked all' : 'Granted all'} "${col}" permissions for ${this.selectedUser.name}.`,
      'info'
    );
  }

  isAllGrantedForUserModule(mod: string): boolean {
    if (!this.activeUserMatrix || !this.activeUserMatrix[mod]) return false;
    return this.permissionColumns.every(col => this.activeUserMatrix[mod][col]);
  }

  isAllRevokedForUserModule(mod: string): boolean {
    if (!this.activeUserMatrix || !this.activeUserMatrix[mod]) return true;
    return this.permissionColumns.every(col => !this.activeUserMatrix[mod][col]);
  }

  isAllGrantedForUserColumn(col: string): boolean {
    if (!this.activeUserMatrix) return false;
    return this.modules.every(mod => this.activeUserMatrix[mod]?.[col]);
  }

  resetUserToRoleDefaults(): void {
    if (!this.selectedUser) return;
    const roleName = this.getUserRoleName(this.selectedUser);
    const confirmed = window.confirm(
      `Reset "${this.selectedUser.name}" to their base role defaults (${roleName})?\nThis will clear any customized access overrides.`
    );
    if (!confirmed) return;

    this.accessService.removeUserOverride(this.selectedUserId).subscribe({
      next: () => {
        this.syncActiveUserMatrix();
        this.showNotification(`Reset "${this.selectedUser.name}" back to base role defaults (${roleName}).`, 'info');
      }
    });
  }

  cloneUserPermissionsFrom(sourceKey: string): void {
    if (!sourceKey || !this.selectedUser) return;
    if (sourceKey.startsWith('role:')) {
      const roleName = sourceKey.replace('role:', '');
      if (this.rolePermissions[roleName]) {
        this.activeUserMatrix = JSON.parse(JSON.stringify(this.rolePermissions[roleName]));
        this.saveUserToStorage();
        this.showNotification(`Cloned all permissions from role "${roleName}" to "${this.selectedUser.name}".`, 'success');
      }
    } else if (sourceKey.startsWith('user:')) {
      const otherId = sourceKey.replace('user:', '');
      const other = this.users.find(u => (u.user_id || u.id) == otherId);
      if (other) {
        this.activeUserMatrix = JSON.parse(JSON.stringify(this.accessService.getEffectiveUserPermissions(other)));
        this.saveUserToStorage();
        this.showNotification(`Cloned permissions from "${other.name}" to "${this.selectedUser.name}".`, 'success');
      }
    }
    this.cloneSourceUser = '';
  }

  private saveUserToStorage(): void {
    if (!this.selectedUserId) return;
    this.accessService.saveUserPermissions(this.selectedUserId, this.activeUserMatrix).subscribe();
  }

  getUsersInRole(roleName: string): any[] {
    return this.users.filter(u => this.getUserRoleName(u) === roleName);
  }

  openUserAccess(user: any): void {
    this.setAccessScope('USER');
    this.selectUser(user);
  }

  openQuickGrantModal(preselectedUserId?: any): void {
    this.quickGrantTargetUserId = preselectedUserId || (this.users[0]?.user_id || this.users[0]?.id || '');
    this.quickGrantSource = 'role:' + this.selectedRole;
    this.showQuickGrantModal = true;
  }

  closeQuickGrantModal(): void {
    this.showQuickGrantModal = false;
  }

  applyQuickGrant(): void {
    if (!this.quickGrantTargetUserId) return;
    const targetUser = this.users.find(u => (u.user_id || u.id) == this.quickGrantTargetUserId);
    if (!targetUser) return;

    let newMatrix: any;
    if (this.quickGrantSource.startsWith('role:')) {
      const roleName = this.quickGrantSource.replace('role:', '');
      newMatrix = JSON.parse(JSON.stringify(this.rolePermissions[roleName] || this.accessService.getDefaultPermissionsForRole(roleName)));
    } else if (this.quickGrantSource.startsWith('user:')) {
      const srcId = this.quickGrantSource.replace('user:', '');
      const srcUser = this.users.find(u => (u.user_id || u.id) == srcId);
      newMatrix = JSON.parse(JSON.stringify(this.accessService.getEffectiveUserPermissions(srcUser)));
    } else if (this.quickGrantSource === 'all') {
      newMatrix = this.accessService.getBlankPermissions();
      this.modules.forEach(m => {
        this.permissionColumns.forEach(c => {
          newMatrix[m][c] = true;
        });
      });
    }

    if (newMatrix) {
      this.accessService.saveUserPermissions(this.quickGrantTargetUserId, newMatrix).subscribe({
        next: () => {
          this.showQuickGrantModal = false;
          this.setAccessScope('USER');
          this.selectUser(targetUser);
          this.showNotification(`Custom permissions configured for "${targetUser.name}".`, 'success');
        }
      });
    }
  }

  // --- COMMON HELPERS ---
  saveExplicitly(): void {
    this.isSaving = true;
    if (this.accessScope === 'USER') {
      if (!this.selectedUser) {
        this.isSaving = false;
        return;
      }
      this.accessService.saveUserPermissions(this.selectedUserId, this.activeUserMatrix).subscribe({
        next: () => {
          this.isSaving = false;
          this.hasUnsavedChanges = false;
          this.showNotification(`Individual access rights saved and enforced for "${this.selectedUser.name}".`, 'success');
        },
        error: () => {
          this.isSaving = false;
          this.showNotification(`Saved locally in browser storage.`, 'info');
        }
      });
    } else {
      this.accessService.savePermissions(this.rolePermissions).subscribe({
        next: () => {
          this.isSaving = false;
          this.hasUnsavedChanges = false;
          this.showNotification(`Access Control matrix saved and deployed successfully.`, 'success');
        },
        error: () => {
          this.isSaving = false;
          this.showNotification(`Saved locally in browser storage.`, 'info');
        }
      });
    }
  }

  private saveToStorage(): void {
    this.accessService.savePermissions(this.rolePermissions).subscribe();
  }

  getGrantedCount(role: string): number {
    if (!this.rolePermissions[role]) return 0;
    let count = 0;
    this.modules.forEach(mod => {
      this.permissionColumns.forEach(col => {
        if (this.rolePermissions[role][mod] && this.rolePermissions[role][mod][col]) {
          count++;
        }
      });
    });
    return count;
  }

  getTotalPossible(): number {
    return this.modules.length * this.permissionColumns.length;
  }

  getCoveragePercent(role: string): number {
    const granted = this.getGrantedCount(role);
    const total = this.getTotalPossible();
    return Math.round((granted / total) * 100);
  }

  isAllGrantedForModule(mod: string): boolean {
    if (!this.rolePermissions[this.selectedRole] || !this.rolePermissions[this.selectedRole][mod]) return false;
    return this.permissionColumns.every(col => this.rolePermissions[this.selectedRole][mod][col]);
  }

  isAllRevokedForModule(mod: string): boolean {
    if (!this.rolePermissions[this.selectedRole] || !this.rolePermissions[this.selectedRole][mod]) return true;
    return this.permissionColumns.every(col => !this.rolePermissions[this.selectedRole][mod][col]);
  }

  isAllGrantedForColumn(col: string): boolean {
    if (!this.rolePermissions[this.selectedRole]) return false;
    return this.modules.every(mod => this.rolePermissions[this.selectedRole][mod]?.[col]);
  }

  exportMatrix(): void {
    if (this.accessScope === 'USER') {
      if (!this.selectedUser) return;
      const exportData = {
        scope: 'SPECIFIC_PERSON',
        userName: this.selectedUser.name,
        userEmail: this.selectedUser.email,
        baseRole: this.getUserRoleName(this.selectedUser),
        hasCustomOverride: this.isUserOverridden(this.selectedUserId),
        exportedAt: new Date().toISOString(),
        permissions: this.activeUserMatrix
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-control-user-${this.selectedUser.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.showNotification(`Exported permissions for "${this.selectedUser.name}".`, 'info');
    } else {
      const exportData = {
        scope: 'ROLE',
        role: this.selectedRole,
        exportedAt: new Date().toISOString(),
        permissions: this.rolePermissions[this.selectedRole]
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-control-${this.selectedRole.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.showNotification(`Exported permissions for "${this.selectedRole}".`, 'info');
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  private showNotification(msg: string, type: 'info' | 'success' | 'warn' = 'info'): void {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 4000);
  }
}
