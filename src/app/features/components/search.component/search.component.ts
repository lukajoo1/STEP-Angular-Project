import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Railway } from '../../services/railway.service';
import { StationModelResponse } from '../../types/station.model';

@Component({
  selector: 'app-search.component',
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  searchForm: FormGroup;
  cities = signal<StationModelResponse[]>([]);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private railwayService = inject(Railway);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.searchForm = this.fb.group({
      fromCity: ['', Validators.required],
      toCity: ['', Validators.required],
      travelDate: ['', Validators.required],
      ticketCount: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.railwayService.getStations().subscribe((data) => {
      this.cities.set(data);
      console.log(data);
      this.cdr.detectChanges();
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      const queryParams = this.searchForm.value;
      this.router.navigate(['/trains'], { queryParams });
    }
  }
}
