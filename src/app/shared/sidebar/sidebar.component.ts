import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  currentUser$ = this.authService.currentUser$;

  hasRole(allowedRoles: string[]): boolean {
    const role = this.authService.getUserRole();
    if (!role) return false;
    if (role === 'ADMIN') return true;
    return allowedRoles.includes(role);
  }
}
