import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor() {
  }

  private tripId!: string;
  private tripName!: string;

  setTripName(tripName: string) {
    this.tripName = tripName;
  }

  getTripName(): string {
    return this.tripName;
  }

  setTripId(id: string): void {
    this.tripId = id;
  }

  getTripId(): string {
    return this.tripId;
  }
}
