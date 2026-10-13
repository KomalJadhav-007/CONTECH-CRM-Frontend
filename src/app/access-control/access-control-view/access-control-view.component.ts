import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccessControlService, PermissionMatrix, RoleMeta } from '../access-control.service';

@Component({
  selector: 'app-access-control-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './access-control-view.component.html',
  styleUrl: './access-control-view.component.css'
})
export class AccessControlViewComponent implements OnInit {
  private accessService = inject(AccessControlService);

  roles = this.accessService.roles;
  modules = this.accessService.modules;
  permissionColumns = this.accessService.permissionColumns;
  roleMetadata = this.accessService.roleMetadata;
  moduleCategories = this.accessService.moduleCategories;

  selectedRole = 'Account Executive';
  rolePermissions: PermissionMatrix = {};
  
  searchQuery = '';
  selectedCategory = 'ALL';
  categories = ['ALL', 'Intelligence', 'Pipeline', 'Site Visit Ops', 'Administration'];

  notificationMessage = '';
  notificationType: 'info' | 'success' | 'warn' = 'info';
  isSaving = false;
  hasUnsavedChanges = false;
  cloneSourceRole = '';

  ngOnInit(): void {
    this.rolePermissions = this.accessService.getCurrentMatrix();
    this.accessService.permissions$.subscribe(matrix => {
      this.rolePermissions = JSON.parse(JSON.stringify(matrix));
    });
  }

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
    
    // Auto-save immediately to ensure instant responsiveness
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

  saveExplicitly(): void {
    this.isSaving = true;
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
    const exportData = {
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

  private showNotification(msg: string, type: 'info' | 'success' | 'warn' = 'info'): void {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => {
      if (this.notificationMessage === msg) {
        this.notificationMessage = '';
      }
    }, 3500);
  }
}
