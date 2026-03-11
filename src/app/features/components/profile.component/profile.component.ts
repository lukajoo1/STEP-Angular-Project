import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly authStore = inject(AuthStore);

  user = computed(() => this.authStore.currentUser());
}

