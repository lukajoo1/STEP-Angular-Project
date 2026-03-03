import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Railway } from '../../services/railway.service';
import jsPDF from 'jspdf';

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

  totalPrice = window.history.state?.totalPrice;
  request = window.history.state?.payload;

  isProcessing = false;
  isSuccess = false;

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

    this.railwayService.registerTicket(request).subscribe({
      next: () => {
        this.isProcessing = false;
        this.isSuccess = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isProcessing = false;
        alert('შეცდომა: ' + (err.error?.title || 'ვერ მოხერხდა დაჯავშნა'));
        this.cdr.detectChanges();
      },
    });
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

    doc.setDrawColor(39, 174, 96);
    doc.setLineWidth(0.8);
    doc.line(20, 30, pageWidth - 20, 30);

    doc.setFontSize(11);
    doc.setTextColor(160, 200, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('Email:', 20, 42);
    doc.text('Phone:', 20, 50);
    doc.setTextColor(255, 255, 255);
    doc.text(req.email || '-', 55, 42);
    doc.text(req.phoneNumber || '-', 55, 50);

    doc.setDrawColor(60, 80, 100);
    doc.setLineWidth(0.3);
    doc.line(20, 56, pageWidth - 20, 56);

    let y = 65;
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
      doc.text(String(person.seatId || '-'), pageWidth / 2 + 30, y + 12);

      doc.text(`Status:`, pageWidth / 2 + 5, y + 20);
      doc.text(person.status || 'Regular', pageWidth / 2 + 30, y + 20);

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

    doc.save(`ticket-${req.email}.pdf`);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
