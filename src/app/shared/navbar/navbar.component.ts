import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  currentUser$ = this.authService.currentUser$;
  showProfileModal = false;

  getCleanName(name?: string): string {
    if (!name) return 'Rajesh Sharma';
    return name.replace(/\(.*?\)/g, '').trim();
  }

  getInitials(name?: string): string {
    if (!name) return 'RS';
    const cleanName = this.getCleanName(name);
    const parts = cleanName.split(' ').filter(Boolean);
    if (parts.length === 0) return 'RS';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  toggleProfileDetails(): void {
    this.showProfileModal = !this.showProfileModal;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  logout(): void {
    this.showProfileModal = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showProfileModal = false;
    }
  }
}
