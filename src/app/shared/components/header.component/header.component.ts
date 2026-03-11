import { ChangeDetectorRef, Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthStore } from '../../../features/services/auth.store';
import { AuthService } from '../../../features/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { VerifyEmailResponse } from '../../../features/types/auth.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  menuOpen = signal(false);
  // direct references to store signals so changes propagate correctly
  isAuthenticated = this.authStore.isAuthenticated;
  user = this.authStore.currentUser;
  needsVerification = this.authStore.needsEmailVerification;
  email = this.authStore.email;
  verifyStatus = signal<string | null>(null);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.signOut();
    this.closeMenu();
    void this.router.navigate(['/home']);
  }

  sendVerificationEmail(): void {
    const email = this.authStore.email();
    if (!email) {
      this.verifyStatus.set('No email found for this session.');
      return;
    }

    this.verifyStatus.set(null);
    this.authService
      .verifyEmail({ email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: VerifyEmailResponse) => {
          console.info('[Everrest] verify_email response', res);
          this.verifyStatus.set(res.message);
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          console.warn('[Everrest] verify_email failed', err);
          this.verifyStatus.set('Failed to send verification email. Please try again.');
          this.cdr.detectChanges();
        },
      });
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.closeMenu();
  }
}
