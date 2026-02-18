import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Railway } from '../../services/railway.service';

@Component({
  selector: 'app-passenger-details.component',
  imports: [],
  templateUrl: './passenger-details.component.html',
  styleUrl: './passenger-details.component.scss',
})
export class PassengerDetailsComponent implements OnInit {
  train: any = null;
  selectedVagon: any = null;
  selectedSeat: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private railwayService: Railway,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const trainId = this.route.snapshot.queryParams['trainId'];
    this.loadTrainDetails(trainId);
  }

  loadTrainDetails(id: string) {
    this.railwayService.getTrainById(id).subscribe((data) => {
      this.train = data;
      // ავტომატურად ავირჩიოთ პირველი ვაგონი
      if (this.train.vagons && this.train.vagons.length > 0) {
        this.selectVagon(this.train.vagons[0]);
      }
      this.cdr.detectChanges();
    });
  }

  selectVagon(vagon: any) {
    this.selectedVagon = vagon;
    this.selectedSeat = null;
  }

  onSeatClick(seat: any) {
    if (seat.isAvailable) {
      this.selectedSeat = seat.number;
    }
  }
}
