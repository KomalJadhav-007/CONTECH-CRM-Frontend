import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('contech_token') : null;

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized or 403 Account Deactivated from any protected API
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/login')) {
        const isDeactivated = error.status === 403 || error.error?.code === 'ACCOUNT_DEACTIVATED';
        authService.revokeSession(isDeactivated ? 'ACCOUNT_DEACTIVATED' : 'TOKEN_EXPIRED');
      }
      return throwError(() => error);
    })
  );
};
