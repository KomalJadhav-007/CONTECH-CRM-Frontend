import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  private sessionCheckInterval: any = null;

  constructor() {
    this.startSessionMonitor();
  }

  private getStoredUser(): any {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem('contech_user');
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') return false;
    const token = localStorage.getItem('contech_token');
    const user = this.getCurrentUser();
    if (!token) return false;
    if (user && (user.is_active === false || user.is_active === 0 || user.is_active === '0' || user.is_active === 'false')) {
      return false;
    }
    return true;
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value || this.getStoredUser();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('contech_token', res.token);
          localStorage.setItem('contech_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          this.startSessionMonitor();
        }
      })
    );
  }

  verifySession(): Observable<any> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('contech_token') : null;
    if (!token) {
      return of({ valid: false });
    }

    return this.http.get<any>(`${this.apiUrl}/verify`).pipe(
      tap({
        next: (res) => {
          if (res && res.user) {
            const isActive = res.user.is_active === true || res.user.is_active === 1 || res.user.is_active === '1' || res.user.is_active === 'true';
            if (!isActive) {
              this.revokeSession('ACCOUNT_DEACTIVATED');
            } else {
              const current = this.getStoredUser();
              if (current) {
                const updated = { ...current, ...res.user, is_active: true };
                localStorage.setItem('contech_user', JSON.stringify(updated));
                this.currentUserSubject.next(updated);
              }
            }
          }
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            const isDeactivated = err.status === 403 || err.error?.code === 'ACCOUNT_DEACTIVATED';
            this.revokeSession(isDeactivated ? 'ACCOUNT_DEACTIVATED' : 'TOKEN_EXPIRED');
          }
        }
      })
    );
  }

  startSessionMonitor(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    if (typeof window === 'undefined') return;

    // Check on startup if authenticated
    if (this.isAuthenticated()) {
      this.verifySession().subscribe({ error: () => {} });
    }

    // Periodic heartbeat every 15 seconds to immediately detect deactivations
    this.sessionCheckInterval = setInterval(() => {
      if (this.isAuthenticated()) {
        this.verifySession().subscribe({ error: () => {} });
      }
    }, 15000);

    // Immediate check on tab focus or visibility change
    const onFocusOrVisible = () => {
      if (typeof document !== 'undefined' && !document.hidden && this.isAuthenticated()) {
        this.verifySession().subscribe({ error: () => {} });
      }
    };

    window.removeEventListener('focus', onFocusOrVisible);
    window.addEventListener('focus', onFocusOrVisible);

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      document.addEventListener('visibilitychange', onFocusOrVisible);
    }
  }

  revokeSession(reason: 'ACCOUNT_DEACTIVATED' | 'TOKEN_EXPIRED' = 'ACCOUNT_DEACTIVATED'): void {
    this.logout();
    if (this.router) {
      this.router.navigate(['/auth/login'], {
        queryParams: {
          deactivated: reason === 'ACCOUNT_DEACTIVATED' ? 'true' : undefined,
          sessionExpired: reason === 'TOKEN_EXPIRED' ? 'true' : undefined
        }
      });
    }
  }

  changePassword(data: { currentPassword?: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, data);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('contech_token');
      localStorage.removeItem('contech_user');
      localStorage.removeItem('contech_access_control_permissions');
      localStorage.removeItem('contech_user_override_permissions');
    }
    this.currentUserSubject.next(null);
  }
}
