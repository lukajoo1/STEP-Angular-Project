import { Routes } from '@angular/router';
import { SearchComponent } from './features/components/search.component/search.component';
import { TrainSelectionComponent } from './features/components/train-selection.component/train-selection.component';
import { PassengerDetailsComponent } from './features/components/passenger-details.component/passenger-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: SearchComponent },
  { path: 'trains', component: TrainSelectionComponent },
  { path: 'passengers', component: PassengerDetailsComponent },
];
