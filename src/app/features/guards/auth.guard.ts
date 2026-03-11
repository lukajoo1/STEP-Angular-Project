import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../services/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) return true;

  void router.navigate(['/signin'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

