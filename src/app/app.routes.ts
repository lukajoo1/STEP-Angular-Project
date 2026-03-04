import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

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
    loadComponent: () =>
      import('./features/components/passenger-details.component/passenger-details.component').then(
        (m) => m.PassengerDetailsComponent,
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./features/components/payment.component/payment.component').then(
        (m) => m.PaymentComponent,
      ),
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
