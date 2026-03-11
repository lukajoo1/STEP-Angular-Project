import { ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component/header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './features/services/auth.service';
import { AuthStore } from './features/services/auth.store';
import type { EverrestCurrentUser } from './features/types/auth.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('step-angular-project');

  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.authService
        .me()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (me: EverrestCurrentUser) => {
            console.info('[Everrest] me response (boot)', me);
            this.authStore.currentUser.set(me);
            this.authStore.needsEmailVerification.set(false);
            this.cdr.detectChanges();
          },
          error: (err: unknown) => {
            const keys = this.everrestErrorKeys(err);
            if (keys.includes('errors.user_email_not_verified')) {
              console.info('[Everrest] me blocked (boot): email not verified');
              this.authStore.needsEmailVerification.set(true);
              return;
            }
            console.warn('[Everrest] me failed (boot)', err);
          },
        });
    }
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
}
