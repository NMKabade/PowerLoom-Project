import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];
  const currentRole = authService.getRole();

  if (!currentRole) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRole) {
    const roles = Array.isArray(expectedRole) ? expectedRole : [expectedRole];
    if (!roles.includes(currentRole)) {
      router.navigate(['/']); 
      return false;
    }
  }

  return true;
};
