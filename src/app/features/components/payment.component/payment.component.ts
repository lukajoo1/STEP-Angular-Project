import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Railway } from '../../services/railway.service';
import jsPDF from 'jspdf';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketRegisterResponse } from '../../types/train-selection.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent {
  private router = inject(Router);
  private railwayService = inject(Railway);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  totalPrice = window.history.state?.totalPrice;
  request = window.history.state?.payload;

  isProcessing = false;
  isSuccess = false;
  registeredTicketId: string = '';

  constructor() {
    if (!window.history.state?.payload) {
      this.router.navigate(['/']);
    }
  }

  confirmPayment() {
    const request = window.history.state?.payload;

    if (!request) {
      alert('მონაცემები არასწორია, სცადეთ თავიდან');
      this.router.navigate(['/']);
      return;
    }

    this.isProcessing = true;

    this.railwayService
      .registerTicket(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: TicketRegisterResponse) => {
          this.handleSuccess(response);
        },
        error: (err) => {
          const errorText = err.error?.text || err.error || '';
          if (typeof errorText === 'string' && errorText.includes('ბილეთის ნომერია')) {
            this.handleSuccess(errorText);
          } else {
            this.isProcessing = false;
            alert('შეცდომა: ' + (err.error?.title || 'ვერ მოხერხდა დაჯავშნა'));
            this.cdr.detectChanges();
          }
        },
      });
  }

  private handleSuccess(response: any) {
    this.isProcessing = false;
    this.isSuccess = true;

    const idMatch = typeof response === 'string' ? response.match(/[0-9a-fA-F-]{36}/) : null;

    this.registeredTicketId = idMatch ? idMatch[0] : '';
    this.cdr.detectChanges();
  }

  copyTicketId() {
    if (this.registeredTicketId) {
      navigator.clipboard.writeText(this.registeredTicketId);
      alert('ბილეთის ID დაკოპირებულია!');
    }
  }

  downloadTicket() {
    const doc = new jsPDF();
    const req = this.request;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(13, 33, 55);
    doc.rect(0, 0, pageWidth, 297, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAIN TICKET', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`TICKET ID: ${this.registeredTicketId}`, pageWidth / 2, 32, { align: 'center' });

    doc.setDrawColor(39, 174, 96);
    doc.setLineWidth(0.8);
    doc.line(20, 35, pageWidth - 20, 35);

    doc.setFontSize(11);
    doc.setTextColor(160, 200, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('Email:', 20, 45);
    doc.text('Phone:', 20, 53);
    doc.setTextColor(255, 255, 255);
    doc.text(req.email || '-', 55, 45);
    doc.text(req.phoneNumber || '-', 55, 53);

    doc.setDrawColor(60, 80, 100);
    doc.setLineWidth(0.3);
    doc.line(20, 58, pageWidth - 20, 58);

    let y = 67;
    req.people?.forEach((person: any, index: number) => {
      doc.setFillColor(25, 55, 90);
      doc.roundedRect(18, y - 6, pageWidth - 36, 38, 3, 3, 'F');

      doc.setFontSize(12);
      doc.setTextColor(39, 174, 96);
      doc.setFont('helvetica', 'bold');
      doc.text(`Passenger ${index + 1}`, 24, y + 2);

      doc.setFontSize(10);
      doc.setTextColor(200, 220, 255);
      doc.setFont('helvetica', 'normal');

      doc.text(`Name:`, 24, y + 12);
      doc.text(`${person.name} ${person.surname}`, 50, y + 12);

      doc.text(`ID:`, 24, y + 20);
      doc.text(person.idNumber || '-', 50, y + 20);

      doc.text(`Seat ID:`, pageWidth / 2 + 5, y + 12);

      doc.text(String(person.seatId || '-'), pageWidth / 2 + 30, y + 12, { maxWidth: 35 });

      doc.text(`Status:`, pageWidth / 2 + 5, y + 24);
      doc.text(person.status || 'Regular', pageWidth / 2 + 30, y + 24);

      y += 46;
    });

    doc.setDrawColor(39, 174, 96);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(39, 174, 96);

    doc.text(`Total: ${this.totalPrice} GEL`, pageWidth - 20, y, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(80, 120, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 285, { align: 'center' });

    doc.save(`ticket-${this.registeredTicketId.substring(0, 8)}.pdf`);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
