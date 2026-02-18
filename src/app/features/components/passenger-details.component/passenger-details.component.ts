import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Railway } from '../../services/railway.service';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './passenger-details.component.html',
  styleUrls: ['./passenger-details.component.scss'],
})
export class PassengerDetailsComponent implements OnInit {
  train: any = null;
  selectedVagon: any = null;
  selectedSeats: number[] = [];
  maxPassengers: number = 1;
  totalPrice: number = 0;
  isBooked: boolean = false;

  passengerForm: FormGroup;

  classPrices: { [key: string]: number } = {
    'II კლასი': 25,
    'I კლასი': 60,
    ბიზნესი: 120,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private railwayService: Railway,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.passengerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      personalId: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const trainId = params['trainId'];

      const count = params['passengers'] || params['ticketCount'];
      this.maxPassengers = count ? +count : 1;

      if (trainId) {
        this.loadTrainDetails(trainId);
      }
    });
  }

  loadTrainDetails(id: string) {
    this.railwayService.getTrainById(id).subscribe({
      next: (data) => {
        this.train = data;
        if (this.train.vagons && this.train.vagons.length > 0) {
          this.selectVagon(this.train.vagons[0]);
        }
        this.cdr.detectChanges();
      },
    });
  }

  selectVagon(vagon: any) {
    this.selectedVagon = vagon;
    this.selectedSeats = [];
    this.totalPrice = 0;

    if (!this.selectedVagon.seats || this.selectedVagon.seats.length === 0) {
      this.selectedVagon.seats = [];
      for (let i = 1; i <= 32; i++) {
        this.selectedVagon.seats.push({
          number: i,
          isAvailable: Math.random() > 0.2,
        });
      }
    }
    this.cdr.detectChanges();
  }

  onSeatClick(seat: any) {
    if (!seat.isAvailable) return;

    const index = this.selectedSeats.indexOf(seat.number);

    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      if (this.selectedSeats.length < this.maxPassengers) {
        this.selectedSeats.push(seat.number);
      } else {
        alert(`თქვენ მიუთითეთ ${this.maxPassengers} მგზავრი. მეტი ადგილის არჩევა შეუძლებელია.`);
      }
    }

    const basePrice = this.classPrices[this.selectedVagon.name] || 25;
    this.totalPrice = basePrice * this.selectedSeats.length;

    this.cdr.detectChanges();
  }

  confirmBooking() {
    if (this.passengerForm.valid && this.selectedSeats.length > 0) {
      this.isBooked = true;
    } else {
      this.passengerForm.markAllAsTouched();
    }
  }

  closeModal() {
    this.isBooked = false;
    this.router.navigate(['/']);
  }
}
