import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab: 'signin' | 'signup' = 'signin';
  email = 'director@contechcrm.com';
  password = 'password123';
  hidePassword = true;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired']) {
        this.errorMessage = 'Your 7-day session has expired. Please sign in again.';
      } else if (params['deactivated']) {
        this.errorMessage = 'Your user account has been deactivated. Please contact an administrator.';
      }
    });
  }

  demoAccounts = [
    { label: 'Org Admin', email: 'director@contechcrm.com' },
    { label: 'Sales Head', email: 'director@contechcrm.com' },
    { label: 'Sales Manager', email: 'manager@contechcrm.com' },
    { label: 'Account Executive', email: 'rep@contechcrm.com' },
    { label: 'Visit Coordinator', email: 'coordinator@contechcrm.com' },
    { label: 'Driver', email: 'driver@contechcrm.com' },
    { label: 'Executive Viewer', email: 'director@contechcrm.com' }
  ];

  selectDemoAccount(acc: { label: string; email: string }) {
    this.email = acc.email;
    this.password = 'password123';
    this.onSubmit();
  }

  exploreLiveDemo() {
    this.email = 'director@contechcrm.com';
    this.password = 'password123';
    this.onSubmit();
  }

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user && res.user.role === 'DRIVER') {
          this.router.navigate(['/my-trips']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check credentials or try demo accounts.';
      }
    });
  }
}
