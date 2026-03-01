import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Railway } from '../../services/railway.service';
import { DatePipe } from '@angular/common';
import { TrainSelectionModelResponse } from '../../types/train-selection.model';

@Component({
  selector: 'app-train-selection.component',
  imports: [DatePipe],
  templateUrl: './train-selection.component.html',
  styleUrl: './train-selection.component.scss',
})
export class TrainSelectionComponent implements OnInit {
  trains = signal<TrainSelectionModelResponse[]>([]);
  travelDate: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private railwayService = inject(Railway);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.travelDate = params['travelDate'];
      this.loadTrains(params['fromCity'], params['toCity'], params['travelDate']);
    });
  }

  loadTrains(fromName: string, toName: string, travelDate: string) {
    this.railwayService.getTrains(fromName, toName, travelDate).subscribe((data) => {
      const selectedDay = this.getGeorgianDay(travelDate);
      this.trains.set(
        data.filter((train) => {
          const matchFrom = train.from.trim().toLowerCase() === fromName.trim().toLowerCase();
          const matchTo = train.to.trim().toLowerCase() === toName.trim().toLowerCase();
          const matchDay = train.date.trim() === selectedDay;

          return matchFrom && matchTo && matchDay;
        }),
      );
      this.cdr.detectChanges();
    });
  }

  getGeorgianDay(dateString: string): string {
    const days = [
      'კვირა',
      'ორშაბათი',
      'სამშაბათი',
      'ოთხშაბათი',
      'ხუთშაბათი',
      'პარასკევი',
      'შაბათი',
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  }

  onSelectTrain(trainId: number) {
    const currentParams = this.route.snapshot.queryParams;

    this.router.navigate(['/passengers'], {
      queryParams: {
        trainId: trainId,
        passengers: currentParams['ticketCount'],
      },
    });
  }
}
