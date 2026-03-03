import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StationModelResponse } from '../types/station.model';
import {
  CarriageResponse,
  SeatResponse,
  TicketRegisterRequest,
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

  registerTicket(request: TicketRegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/register`, request, { responseType: 'text' });
  }

  getVagonSeats(vagonId: number): Observable<CarriageResponse[]> {
    return this.http.get<CarriageResponse[]>(`${this.apiUrl}/getvagon/${vagonId}`);
  }
}
