import { Component, signal, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Railway } from '../../services/railway.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketRegisterResponse } from '../../types/train-selection.model';

@Component({
  selector: 'app-ticket-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-check.component.html',
  styleUrls: ['./ticket-check.component.scss'],
})
export class TicketCheckComponent {
  ticketId = signal<string>('');
  ticketData = signal<TicketRegisterResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private railwayService = inject(Railway);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  checkTicket() {
    const id = this.ticketId().trim();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.ticketData.set(null);

    this.railwayService
      .checkTicketStatus(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          console.log('Server Data:', data);
          this.ticketData.set(data);
          this.isLoading.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error.set('ბილეთი ვერ მოიძებნა');
          this.isLoading.set(false);
          console.log(err);
        },
      });
  }

  cancelTicket() {
    const id = this.ticketId().trim();
    if (!id || !confirm('ნამდვილად გსურთ ბილეთის გაუქმება?')) return;

    this.isLoading.set(true);
    this.railwayService
      .cancelTicket(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          alert('ბილეთი წარმატებით გაუქმდა');
          this.ticketData.set(null);
          this.ticketId.set('');
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 200 || err.status === 204) {
            alert('ბილეთი წარმატებით გაუქმდა');
            this.ticketData.set(null);
            this.ticketId.set('');
          } else {
            alert('ბილეთის გაუქმება ვერ მოხერხდა');
          }
          this.isLoading.set(false);
        },
      });
  }
}
