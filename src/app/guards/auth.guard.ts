import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && (user.is_active === false || user.is_active === 0 || user.is_active === '0' || user.is_active === 'false')) {
    authService.revokeSession('ACCOUNT_DEACTIVATED');
    return false;
  }

  // Live session check on route activation
  return authService.verifySession().pipe(
    map((res) => {
      if (res && res.user) {
        const isActive = res.user.is_active === true || res.user.is_active === 1 || res.user.is_active === '1' || res.user.is_active === 'true';
        if (!isActive) {
          authService.revokeSession('ACCOUNT_DEACTIVATED');
          return false;
        }
      }
      return true;
    }),
    catchError(() => {
      authService.revokeSession('ACCOUNT_DEACTIVATED');
      return of(false);
    })
  );
};
