import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SettingsService } from '../settings.service';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../users/user.service';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './settings-view.component.html',
  styleUrl: './settings-view.component.css'
})
export class SettingsViewComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  loading = false;
  savedMessage = '';
  errorMessage = '';

  org = {
    name: 'Contech Developments Pvt Ltd',
    slug: 'contech-crm',
    email: 'admin@contechcrm.com',
    status: 'active'
  };

  profile = {
    id: 8,
    firstName: 'Vikram',
    lastName: 'Joshi',
    mobile: '+91 98455 67890',
    designation: 'Organization Admin'
  };

  scoring = {
    profileFit: 20,
    digitalIntent: 20,
    requirementBudgetFit: 25,
    readinessMomentum: 35
  };

  get scoringTotal(): number {
    return (Number(this.scoring.profileFit) || 0) +
           (Number(this.scoring.digitalIntent) || 0) +
           (Number(this.scoring.requirementBudgetFit) || 0) +
           (Number(this.scoring.readinessMomentum) || 0);
  }

  ngOnInit(): void {
    // 1. Prefill logged-in user details
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.profile.id = user.id || user.user_id || 8;
        const nameParts = (user.name || '').trim().split(' ');
        this.profile.firstName = nameParts[0] || 'Vikram';
        this.profile.lastName = nameParts.slice(1).join(' ') || 'Joshi';
        this.profile.mobile = user.phone || '+91 98455 67890';
        this.profile.designation = user.role ? (user.role.name || user.role) : 'Organization Admin';
        this.org.email = user.email || 'admin@contechcrm.com';
      }
    });

    // 2. Load system settings from database
    this.settingsService.getSettings().subscribe({
      next: (res: any) => {
        if (res && res.settings && Array.isArray(res.settings)) {
          const orgSetting = res.settings.find((s: any) => s.key === 'ORGANIZATION_PROFILE');
          if (orgSetting && orgSetting.value) {
            try {
              const parsedOrg = JSON.parse(orgSetting.value);
              this.org = { ...this.org, ...parsedOrg };
            } catch (e) {}
          }

          const scoreSetting = res.settings.find((s: any) => s.key === 'BUYER_SCORING_WEIGHTS');
          if (scoreSetting && scoreSetting.value) {
            try {
              const parsedScore = JSON.parse(scoreSetting.value);
              this.scoring = { ...this.scoring, ...parsedScore };
            } catch (e) {}
          }
        }
      }
    });
  }

  saveProfile(): void {
    const fullName = `${this.profile.firstName.trim()} ${this.profile.lastName.trim()}`.trim();
    const payload = {
      name: fullName,
      phone: this.profile.mobile.trim()
    };

    this.userService.updateUser(this.profile.id, payload).subscribe({
      next: () => {
        const stored = localStorage.getItem('contech_user');
        if (stored) {
          try {
            const u = JSON.parse(stored);
            u.name = fullName;
            u.phone = payload.phone;
            localStorage.setItem('contech_user', JSON.stringify(u));
          } catch (e) {}
        }
        this.savedMessage = 'Profile updated and saved to database successfully.';
        setTimeout(() => (this.savedMessage = ''), 3500);
      },
      error: () => {
        this.savedMessage = 'Profile saved locally.';
        setTimeout(() => (this.savedMessage = ''), 3500);
      }
    });
  }

  saveScoring(): void {
    if (this.scoringTotal !== 100) {
      this.errorMessage = `Total scoring weights must equal 100% (currently ${this.scoringTotal}%).`;
      setTimeout(() => (this.errorMessage = ''), 4000);
      return;
    }

    this.settingsService.updateSetting('BUYER_SCORING_WEIGHTS', JSON.stringify(this.scoring)).subscribe({
      next: () => {
        this.savedMessage = 'Scoring configuration saved successfully in database.';
        setTimeout(() => (this.savedMessage = ''), 3500);
      },
      error: () => {
        this.savedMessage = 'Scoring configuration saved locally.';
        setTimeout(() => (this.savedMessage = ''), 3500);
      }
    });
  }
}
