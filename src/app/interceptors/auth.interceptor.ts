import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
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
      // If 401 Unauthorized or 403 Account Inactive from any protected API
      if ((error.status === 401 || error.status === 403) && !req.url.includes('/auth/login')) {
        const isExpired = error.error?.code === 'TOKEN_EXPIRED';
        const isDeactivated = error.error?.code === 'ACCOUNT_DEACTIVATED';
        
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('contech_token');
          localStorage.removeItem('contech_user');
        }

        router.navigate(['/auth/login'], {
          queryParams: {
            sessionExpired: isExpired ? 'true' : undefined,
            deactivated: isDeactivated ? 'true' : undefined
          }
        });
      }
      return throwError(() => error);
    })
  );
};
