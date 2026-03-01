import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Railway } from '../../services/railway.service';
import { TicketRegisterRequest } from '../../types/train-selection.model';

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './passenger-details.component.html',
  styleUrls: ['./passenger-details.component.scss'],
})
export class PassengerDetailsComponent implements OnInit {
  train = signal<any>(null);
  selectedVagon = signal<any>(null);
  selectedSeats = signal<string[]>([]);
  maxPassengers = signal<number>(1);
  totalPrice = signal<number>(0);
  isBooked = signal<boolean>(false);

  passengerForm: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private railwayService = inject(Railway);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.passengerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      people: this.fb.array([]),
    });
  }

  get people(): FormArray {
    return this.passengerForm.get('people') as FormArray;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const trainId = params['trainId'];
      const count = params['passengers'] || params['ticketCount'];
      this.maxPassengers.set(count ? +count : 1);
      if (trainId) this.loadTrainDetails(trainId);
    });
  }

  getSeatNumber(seatId: string): string {
    const seat = this.selectedVagon()?.seats?.find((s: any) => s.seatId === seatId);
    return seat?.number || '';
  }

  loadTrainDetails(id: string) {
    this.railwayService.getTrainById(id).subscribe({
      next: (data: any) => {
        this.train.set(data);
        const vagonsList = data.vagons || data.carriages || [];
        if (vagonsList.length > 0) {
          this.selectVagon(vagonsList[0]);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading train:', err),
    });
  }

  selectVagon(vagon: any) {
    this.selectedSeats.set([]);
    this.totalPrice.set(0);
    this.syncPeopleForm(0);

    this.railwayService.getVagonSeats(vagon.id).subscribe({
      next: (carriage: any) => {
        const vagonData = Array.isArray(carriage) ? carriage[0] : carriage;
        const realSeats = vagonData?.seats || [];

        const seats = realSeats
          .map((s: any) => ({
            ...s,
            isAvailable: !s.isOccupied,
          }))
          .sort((a: any, b: any) => {
            const numA = parseInt(a.number);
            const numB = parseInt(b.number);
            const letterA = a.number.replace(/[0-9]/g, '');
            const letterB = b.number.replace(/[0-9]/g, '');

            if (numA !== numB) return numA - numB;
            return letterA.localeCompare(letterB);
          });

        this.selectedVagon.set({ ...vagonData, seats });
        this.cdr.detectChanges();
      },
    });
  }

  onSeatClick(seat: any): void {
    if (!seat.isAvailable || seat.isOccupied) return;

    this.selectedSeats.update((seats) => {
      let newSeats;
      if (seats.includes(seat.seatId)) {
        newSeats = seats.filter((s) => s !== seat.seatId);
      } else if (seats.length < this.maxPassengers()) {
        newSeats = [...seats, seat.seatId];
      } else {
        alert(`მაქსიმუმ ${this.maxPassengers()} სკამი`);
        return seats;
      }

      this.syncPeopleForm(newSeats.length);
      this.calculateTotalPrice(newSeats);
      return newSeats;
    });
  }

  private calculateTotalPrice(currentSeatIds: string[]) {
    const vagonSeats = this.selectedVagon()?.seats || [];
    const total = currentSeatIds.reduce((sum, seatId) => {
      const seatObj = vagonSeats.find((s: any) => s.seatId === seatId);
      return sum + (seatObj?.price || 0);
    }, 0);
    this.totalPrice.set(total);
  }

  private syncPeopleForm(count: number) {
    while (this.people.length !== count) {
      if (this.people.length < count) {
        this.people.push(
          this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            surname: ['', [Validators.required, Validators.minLength(2)]],
            idNumber: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
            status: ['Regular'],
            payoutCompleted: [true],
          }),
        );
      } else {
        this.people.removeAt(this.people.length - 1);
      }
    }
  }

  confirmBooking() {
    if (this.passengerForm.valid && this.selectedSeats().length > 0) {
      const request: TicketRegisterRequest = {
        trainId: Number(this.train().id),
        date: new Date().toISOString(),
        email: this.passengerForm.value.email,
        phoneNumber: this.passengerForm.value.phoneNumber,
        people: this.people.value.map((p: any, index: number) => {
          const seatId = this.selectedSeats()[index];
          return {
            seatId: seatId,
            name: p.name,
            surname: p.surname,
            idNumber: p.idNumber,
            status: p.status || 'Regular',
            payoutCompleted: p.payoutCompleted ?? true,
          };
        }),
      };

      console.log('request:', JSON.stringify(request, null, 2));

      this.railwayService.registerTicket(request).subscribe({
        next: () => {
          this.isBooked.set(true);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('error full:', err);
          alert('შეცდომა: ' + JSON.stringify(err.error));
        },
      });
    } else {
      console.log('form valid:', this.passengerForm.valid);
      console.log('form errors:', this.passengerForm.errors);
      console.log('selected seats:', this.selectedSeats());
      this.passengerForm.markAllAsTouched();
    }
  }

  closeModal() {
    this.router.navigate(['/']);
  }
}
