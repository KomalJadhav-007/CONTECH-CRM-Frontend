import { Component, inject, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { AlertService } from '../alert.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  currentUser$ = this.authService.currentUser$;
  showProfileModal = false;

  // Change Password Modal State
  showChangePasswordModal = false;
  isChangingPassword = false;
  changePasswordError = '';
  changePasswordSuccess = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // SOW Sec 16: In-App Alerts State
  showAlertModal = false;
  alerts: any[] = [];
  unacknowledgedCount = 0;
  criticalCount = 0;

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.alertService.getAlerts().subscribe({
      next: (res) => {
        if (res.success && res.alerts) {
          this.alerts = res.alerts;
          this.unacknowledgedCount = res.unacknowledged_count || 0;
          this.criticalCount = res.critical_count || 0;
        }
      },
      error: () => {
        // Fallback default operational alerts
        this.alerts = [
          {
            id: 1,
            alert_type: 'CRITICAL_SLA_BREACH',
            category: 'SLA_BREACH',
            severity: 'CRITICAL',
            title: '40-Day SLA Breach on Qualified Buyer',
            message: 'Buyer Sneha Kulkarni (Score 92) has had no phone callbacks for >40 days. Revenue at risk: ₹1.43 Cr.',
            is_acknowledged: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            alert_type: 'UNCONFIRMED_CAB_DISPATCH',
            category: 'CAB_UNCONFIRMED',
            severity: 'WARNING',
            title: 'Driver Unconfirmed for Imminent Visit',
            message: 'Visit scheduled in 3 hours has missing driver 4-way confirmation.',
            is_acknowledged: false,
            created_at: new Date().toISOString()
          }
        ];
        this.unacknowledgedCount = 2;
        this.criticalCount = 1;
      }
    });
  }

  toggleAlerts(): void {
    this.showAlertModal = !this.showAlertModal;
    if (this.showAlertModal) {
      this.showProfileModal = false;
      this.loadAlerts();
    }
  }

  closeAlertModal(): void {
    this.showAlertModal = false;
  }

  ackAlert(alert: any): void {
    const alertId = alert.in_app_alert_id || alert.id;
    this.alertService.acknowledgeAlert(alertId).subscribe({
      next: () => {
        alert.is_acknowledged = true;
        this.unacknowledgedCount = Math.max(0, this.unacknowledgedCount - 1);
      },
      error: () => {
        alert.is_acknowledged = true;
        this.unacknowledgedCount = Math.max(0, this.unacknowledgedCount - 1);
      }
    });
  }

  resolveAlert(alert: any): void {
    const alertId = alert.in_app_alert_id || alert.id;
    this.alertService.resolveAlert(alertId, 'Resolved via In-App Alert center').subscribe({
      next: () => {
        alert.is_resolved = true;
        alert.is_acknowledged = true;
        this.alerts = this.alerts.filter(a => (a.in_app_alert_id || a.id) !== alertId);
        this.unacknowledgedCount = Math.max(0, this.unacknowledgedCount - 1);
      },
      error: () => {
        alert.is_resolved = true;
        this.alerts = this.alerts.filter(a => (a.in_app_alert_id || a.id) !== alertId);
      }
    });
  }

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
    if (this.showProfileModal) {
      this.showAlertModal = false;
    }
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  openChangePasswordModal(): void {
    this.showProfileModal = false;
    this.showAlertModal = false;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
  }

  submitChangePassword(): void {
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword.trim().length < 6) {
      this.changePasswordError = 'New password must be at least 6 characters long.';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.changePasswordError = 'New password and confirm password do not match.';
      return;
    }

    this.isChangingPassword = true;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';

    const payload: any = {
      newPassword: this.passwordForm.newPassword.trim()
    };
    if (this.passwordForm.currentPassword && this.passwordForm.currentPassword.trim()) {
      payload.currentPassword = this.passwordForm.currentPassword.trim();
    }

    this.authService.changePassword(payload).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.changePasswordSuccess = 'Password updated successfully! Your new password is now active.';
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 1600);
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        this.changePasswordError = err.error?.message || 'Failed to update password. Please verify current credentials.';
      }
    });
  }

  logout(): void {
    this.showProfileModal = false;
    this.showAlertModal = false;
    this.showChangePasswordModal = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showChangePasswordModal) {
      // Managed through backdrop
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showProfileModal = false;
      this.showAlertModal = false;
    }
  }
}

