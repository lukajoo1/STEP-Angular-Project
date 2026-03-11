import { ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../services/auth.store';
import type { AuthTokens, EverrestCurrentUser, SignInRequest } from '../../types/auth.model';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const body: SignInRequest = {
      email: String(this.form.value.email ?? '').trim(),
      password: String(this.form.value.password ?? ''),
    };

    this.authService
      .signIn(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tokens: AuthTokens) => {
          console.info('[Everrest] sign_in response', tokens);
          this.authStore.setTokens(tokens);
          this.authStore.setEmail(body.email);

          this.authService
            .me()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (me: EverrestCurrentUser) => {
                console.info('[Everrest] me response', me);
                this.authStore.currentUser.set(me);
                this.authStore.needsEmailVerification.set(false);
                this.isLoading.set(false);
                this.cdr.detectChanges();
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
                void this.router.navigate([returnUrl || '/home']);
              },
              error: (err: unknown) => {
                const keys = this.everrestErrorKeys(err);
                if (keys.includes('errors.user_email_not_verified')) {
                  console.info('[Everrest] me blocked: email not verified');
                  this.authStore.needsEmailVerification.set(true);
                } else {
                  console.warn('[Everrest] me failed', err);
                }
                this.isLoading.set(false);
                this.cdr.detectChanges();
                const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
                void this.router.navigate([returnUrl || '/home']);
              },
            });
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.toMessage(err));
          this.cdr.detectChanges();
        },
      });
  }

  logout(): void {
    this.authStore.clear();
    void this.router.navigate(['/home']);
  }

  private toMessage(err: unknown): string {
    const everrest = this.everrestErrorKeys(err);
    if (everrest.length) return everrest.map(this.prettyErrorKey).join(', ');

    if (
      err &&
      typeof err === 'object' &&
      'message' in err &&
      typeof (err as { message: unknown }).message === 'string'
    ) {
      return (err as { message: string }).message;
    }
    return 'Sign in failed. Please try again.';
  }

  private everrestErrorKeys(err: unknown): string[] {
    if (!err || typeof err !== 'object') return [];
    if (!('error' in err)) return [];
    const inner = (err as { error: unknown }).error;
    if (!inner || typeof inner !== 'object') return [];
    if (!('errorKeys' in inner)) return [];
    const keys = (inner as { errorKeys: unknown }).errorKeys;
    return Array.isArray(keys) && keys.every((k) => typeof k === 'string') ? keys : [];
  }

  private prettyErrorKey(key: string): string {
    if (key === 'errors.password_too_short') return 'Password is too short (min 8 characters).';
    if (key === 'errors.invalid_credentials') return 'Invalid email or password.';
    return key;
  }
}

