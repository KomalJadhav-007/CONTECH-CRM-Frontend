import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = 'director@contechcrm.com';
  password = 'password123';
  loading = false;
  errorMessage = '';

  quickLogin(role: string) {
    if (role === 'director') {
      this.email = 'director@contechcrm.com';
    } else if (role === 'manager') {
      this.email = 'manager@contechcrm.com';
    } else if (role === 'rep') {
      this.email = 'rep@contechcrm.com';
    } else if (role === 'driver') {
      this.email = 'driver@contechcrm.com';
    }
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
        this.errorMessage = err.error?.message || 'Login failed. Please check credentials.';
      }
    });
  }
}
