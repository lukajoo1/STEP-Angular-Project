import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StationModelResponse } from '../types/station.model';
import {
  CarriageResponse,
  SeatResponse,
  TicketRegisterRequest,
  TicketRegisterResponse,
  TrainSelectionModelResponse,
} from '../types/train-selection.model';

@Injectable({
  providedIn: 'root',
})
export class Railway {
  private apiUrl = 'https://railway.stepprojects.ge/api';
  private http = inject(HttpClient);

  constructor() {}

  getStations(): Observable<StationModelResponse[]> {
    return this.http.get<StationModelResponse[]>(`${this.apiUrl}/stations`);
  }

  getTrains(from: string, to: string, date: string): Observable<TrainSelectionModelResponse[]> {
    return this.http.get<TrainSelectionModelResponse[]>(
      `${this.apiUrl}/trains?from=${from}&to=${to}&date=${date}`,
    );
  }

  getTrainById(id: string | number): Observable<TrainSelectionModelResponse> {
    return this.http.get<TrainSelectionModelResponse>(`${this.apiUrl}/trains/${id}`);
  }

  getVagonSeats(vagonId: number): Observable<CarriageResponse[]> {
    return this.http.get<CarriageResponse[]>(`${this.apiUrl}/getvagon/${vagonId}`);
  }

  registerTicket(request: TicketRegisterRequest): Observable<TicketRegisterResponse> {
    return this.http.post<TicketRegisterResponse>(`${this.apiUrl}/tickets/register`, request);
  }

  checkTicketStatus(ticketId: string): Observable<TicketRegisterResponse> {
    return this.http.get<TicketRegisterResponse>(`${this.apiUrl}/tickets/checkstatus/${ticketId}`);
  }

  cancelTicket(ticketId: string): Observable<SeatResponse> {
    return this.http.delete<SeatResponse>(`${this.apiUrl}/tickets/cancel/${ticketId}`);
  }
}
