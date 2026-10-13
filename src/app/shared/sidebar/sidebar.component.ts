import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}


