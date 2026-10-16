import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rawRole = authService.getUserRole();
  if (!rawRole) {
    router.navigate(['/auth/login']);
    return false;
  }

  const userRole = rawRole.toUpperCase().replace(/[\s\/-]+/g, '_').trim();
  const expectedRoles = ((route.data?.['roles'] as string[]) || []).map(r =>
    r.toUpperCase().replace(/[\s\/-]+/g, '_').trim()
  );

  const isUniversalAdmin = [
    'SUPER_ADMIN',
    'ORG_ADMIN',
    'DIRECTOR',
    'ADMIN',
    'OWNER_CXO',
    'OWNER'
  ].some(adminRole => userRole.includes(adminRole) || adminRole.includes(userRole));

  if (isUniversalAdmin || expectedRoles.some(r => userRole.includes(r) || r.includes(userRole))) {
    return true;
  }

  // Redirect to their respective home if unauthorized
  if (userRole.includes('DRIVER')) {
    router.navigate(['/my-trips']);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};
