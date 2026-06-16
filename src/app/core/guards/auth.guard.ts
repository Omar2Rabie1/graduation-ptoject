// src/app/core/guards/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';


// ========== Auth Guard (Protected Routes) ==========
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Check if logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  // 2. Check role if specified
  const requiredRole = route.data?.['role'];
  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/not-found']);
    return false;
  }

  return true;
};

// ========== Public Guard (Auth Pages - Login/Register) ==========
export const publicGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);

  // Allow login even with an active session (logout / switch account)
  if (state.url.includes('/login')) {
    return true;
  }

  if (authService.isLoggedIn()) {
    authService.navigateByRole();
    return false;
  }

  return true;
};