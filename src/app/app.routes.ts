import { Routes } from '@angular/router';
import { authGuard } from './features/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'signin',
    loadComponent: () =>
      import('./features/components/sign-in.component/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/components/sign-up.component/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/components/search.component/search.component').then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: 'trains',
    loadComponent: () =>
      import('./features/components/train-selection.component/train-selection.component').then(
        (m) => m.TrainSelectionComponent,
      ),
  },
  {
    path: 'passengers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/passenger-details.component/passenger-details.component').then(
        (m) => m.PassengerDetailsComponent,
      ),
  },
  {
    path: 'payment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/payment.component/payment.component').then(
        (m) => m.PaymentComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/components/profile.component/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'check-ticket',
    loadComponent: () =>
      import('./features/components/ticket-check.component/ticket-check.component').then(
        (m) => m.TicketCheckComponent,
      ),
  },
  { path: '**', redirectTo: 'home' },
];
