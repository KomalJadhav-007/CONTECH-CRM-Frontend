import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getStoredUser(): any {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem('contech_user');
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem('contech_token');
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('contech_token', res.token);
          localStorage.setItem('contech_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  changePassword(data: { currentPassword?: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, data);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('contech_token');
      localStorage.removeItem('contech_user');
    }
    this.currentUserSubject.next(null);
  }
}
