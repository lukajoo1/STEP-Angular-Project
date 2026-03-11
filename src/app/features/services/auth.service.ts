import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AuthTokens,
  EverrestCurrentUser,
  EverrestUser,
  SignInRequest,
  SignUpRequest,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types/auth.model';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'https://api.everrest.educata.dev/auth';
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  signUp(body: SignUpRequest): Observable<EverrestUser> {
    return this.http.post<EverrestUser>(`${this.apiUrl}/sign_up`, body);
  }

  signIn(body: SignInRequest): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/sign_in`, body);
  }

  verifyEmail(body: VerifyEmailRequest): Observable<VerifyEmailResponse> {
    return this.http.post<VerifyEmailResponse>(`${this.apiUrl}/verify_email`, body);
  }

  me(): Observable<EverrestCurrentUser> {
    return this.http.get<EverrestCurrentUser>(`${this.apiUrl}`);
  }

  signOut(): void {
    this.authStore.clear();
  }
}

