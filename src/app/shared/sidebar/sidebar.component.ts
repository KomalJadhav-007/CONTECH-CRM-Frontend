import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

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
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser$ = this.authService.currentUser$;

  sections: { [key: string]: boolean } = {
    intelligence: true,
    pipeline: true,
    siteVisitOps: true,
    administration: true
  };

  toggleSection(sectionKey: string): void {
    this.sections[sectionKey] = !this.sections[sectionKey];
  }

  isExpanded(sectionKey: string): boolean {
    return !!this.sections[sectionKey];
  }

  hasRole(allowedRoles: string[]): boolean {
    const role = this.authService.getUserRole();
    if (!role) return false;
    if (role === 'ADMIN' || role === 'DIRECTOR') return true;
    return allowedRoles.includes(role);
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


