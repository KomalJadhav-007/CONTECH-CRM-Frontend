import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AccessControlService } from '../../access-control/access-control.service';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private accessControl = inject(AccessControlService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser$ = this.authService.currentUser$;
  private sub = new Subscription();

  sections: { [key: string]: boolean } = {
    intelligence: true,
    pipeline: true,
    siteVisitOps: true,
    administration: true
  };

  ngOnInit(): void {
    this.sub.add(
      this.accessControl.permissions$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );
    this.sub.add(
      this.accessControl.userPermissions$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );
    this.sub.add(
      this.currentUser$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleSection(sectionKey: string): void {
    this.sections[sectionKey] = !this.sections[sectionKey];
  }

  isExpanded(sectionKey: string): boolean {
    return !!this.sections[sectionKey];
  }

  canAccess(module: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;

    const rawRole = (user.role ? (user.role.name || user.role.code || user.role) : (user.role_code || '')).toUpperCase().replace(/[\s\/-]+/g, '_').trim();

    // Universal super admins / directors have access to all modules
    if (['SUPER_ADMIN', 'ORG_ADMIN', 'DIRECTOR', 'ADMIN', 'OWNER_CXO', 'OWNER'].some(r => rawRole.includes(r) || r.includes(rawRole))) {
      return true;
    }

    // Driver: strictly only My Trips
    if (rawRole.includes('DRIVER')) {
      return module === 'My Trips';
    }

    // Special module mappings
    if (module === 'My Trips') {
      return rawRole.includes('COORDINATOR') || rawRole.includes('FLEET');
    }

    if (module === 'Control Tower') {
      return this.accessControl.checkPermissionForUser(user, 'Visit Copilot', 'VIEW') &&
             ['SALES_MANAGER', 'SALES_HEAD', 'CRM_HEAD', 'COORDINATOR'].some(r => rawRole.includes(r));
    }

    // Check module permission in AccessControlService (supports role default + user-level individual override)
    return this.accessControl.checkPermissionForUser(user, module, 'VIEW');
  }

  canAccessSection(section: 'intelligence' | 'pipeline' | 'siteVisitOps' | 'administration'): boolean {
    switch (section) {
      case 'intelligence':
        return this.canAccess('Dashboard') ||
               this.canAccess('Revenue Leakage') ||
               this.canAccess('AI Buyer Score') ||
               this.canAccess('Analytics');
      case 'pipeline':
        return this.canAccess('Prospects') ||
               this.canAccess('Follow-ups') ||
               this.canAccess('Alerts');
      case 'siteVisitOps':
        return this.canAccess('Site Visits') ||
               this.canAccess('Control Tower') ||
               this.canAccess('My Trips');
      case 'administration':
        return this.canAccess('Projects') ||
               this.canAccess('Fleet') ||
               this.canAccess('Team') ||
               this.canAccess('Access Control') ||
               this.canAccess('Settings') ||
               this.canAccess('Audit Logs');
      default:
        return false;
    }
  }

  getDisplayName(name?: string): string {
    if (!name) return 'User';
    return name.replace(/\s*\(.*?\)\s*/g, '').trim() || name;
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const clean = this.getDisplayName(name);
    const parts = clean.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}


