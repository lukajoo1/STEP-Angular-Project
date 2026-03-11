import { Injectable, computed, signal } from '@angular/core';
import type { AuthTokens, EverrestCurrentUser } from '../types/auth.model';

const ACCESS_TOKEN_KEY = 'everrest_access_token';
const REFRESH_TOKEN_KEY = 'everrest_refresh_token';
const EMAIL_KEY = 'everrest_email';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly accessTokenSig = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  private readonly refreshTokenSig = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  private readonly emailSig = signal<string | null>(localStorage.getItem(EMAIL_KEY));

  readonly currentUser = signal<EverrestCurrentUser | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessTokenSig());
  readonly needsEmailVerification = signal(false);

  accessToken(): string | null {
    return this.accessTokenSig();
  }

  email(): string | null {
    return this.emailSig();
  }

  setEmail(email: string): void {
    const trimmed = email.trim();
    localStorage.setItem(EMAIL_KEY, trimmed);
    this.emailSig.set(trimmed);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.accessTokenSig.set(tokens.access_token);
    this.refreshTokenSig.set(tokens.refresh_token);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this.accessTokenSig.set(null);
    this.refreshTokenSig.set(null);
    this.emailSig.set(null);
    this.currentUser.set(null);
    this.needsEmailVerification.set(false);
  }
}

