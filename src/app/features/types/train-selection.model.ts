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
