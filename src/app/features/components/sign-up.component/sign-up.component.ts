import { ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import type { EverrestUser, Gender, SignUpRequest } from '../../types/auth.model';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly genders: readonly Gender[] = ['MALE', 'FEMALE', 'OTHER'];

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      age: [18, [Validators.required, Validators.min(1)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.minLength(5)]],
      zipcode: ['', [Validators.required, Validators.minLength(2)]],
      avatar: ['https://api.dicebear.com/7.x/pixel-art/svg?seed=Railway', [Validators.required]],
      gender: ['MALE', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const gender = String(this.form.value.gender ?? 'MALE') as Gender;
    const body: SignUpRequest = {
      firstName: String(this.form.value.firstName ?? '').trim(),
      lastName: String(this.form.value.lastName ?? '').trim(),
      age: Number(this.form.value.age ?? 0),
      email: String(this.form.value.email ?? '').trim(),
      password: String(this.form.value.password ?? ''),
      address: String(this.form.value.address ?? '').trim(),
      phone: String(this.form.value.phone ?? '').trim(),
      zipcode: String(this.form.value.zipcode ?? '').trim(),
      avatar: String(this.form.value.avatar ?? '').trim(),
      gender,
    };

    this.authService
      .signUp(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user: EverrestUser) => {
          console.info('[Everrest] sign_up response', user);
          this.isLoading.set(false);
          this.cdr.detectChanges();
          void this.router.navigate(['/signin']);
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          this.errorMessage.set(this.toMessage(err));
          this.cdr.detectChanges();
          console.error(err);
        },
      });
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
    return 'Sign up failed. Please try again.';
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
    if (key === 'errors.user_already_exists') return 'User already exists.';
    return key;
  }
}

