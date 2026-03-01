export interface TrainSelectionModelResponse {
  id: number;
  number: number;
  name: string;
  date: string;
  from: string;
  to: string;
  departure: string;
  arrive: string;
  departureId: number;
  vagons: [
    {
      id: number;
      trainId: number;
      trainNumber: number;
      name: string;
      seats: null;
    },
    {
      id: number;
      trainId: number;
      trainNumber: number;
      name: string;
      seats: null;
    },
    {
      id: number;
      trainId: number;
      trainNumber: number;
      name: string;
      seats: null;
    },
  ];
}

export interface SeatResponse {
  seatId: string;
  number: string;
  price: number;
  isOccupied: boolean;
  vagonId: number;
}

export interface CarriageResponse {
  id: number;
  trainId: number;
  trainNumber: number;
  name: string;
  seats: SeatResponse[] | null;
}

export interface TicketRegisterRequest {
  trainId: number;
  date: string;
  email: string;
  phoneNumber: string;
  people: peopleModelRequest[];
}

export interface peopleModelRequest {
  seatId: string;
  name: string;
  surname: string;
  idNumber: string;
  status: string;
  payoutCompleted: boolean;
}

// export interface TrainResponse {
//   id: number;
//   trainNumber: string;
//   from: string;
//   to: string;
//   departureTime: string;
//   arrivalTime: string;
//   carriages: CarriageResponse[];
// }
