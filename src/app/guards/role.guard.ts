import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = (route.data?.['roles'] as string[]) || [];
  const userRole = authService.getUserRole();

  if (!userRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (userRole === 'ADMIN' || expectedRoles.includes(userRole)) {
    return true;
  }

  // Redirect to their respective home if unauthorized
  if (userRole === 'DRIVER') {
    router.navigate(['/my-trips']);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};
