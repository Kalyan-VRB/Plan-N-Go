import {Component} from '@angular/core';
import {IconComponent} from '../../widget/icon/icon.component';
import {DividerComponent} from '../../widget/divider/divider.component';
import {TileComponent} from '../../widget/tile/tile.component';
import {DayActivity} from '../../interface/day-activity';
import {Trip} from '../../interface/trip';
import {TextInputComponent} from '../../widget/text-input/text-input.component';
import {FirebaseService} from '../../service/firebase.service';
import {Router} from '@angular/router';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {AuthenticationService} from '../../service/authentication.service';
import {TripService} from '../../service/trip.service';
import {ModalComponent} from '../../widget/modal/modal.component';
import {ModalService} from '../../service/modal.service';

@Component({
  selector: 'trip-plan-dashboard',
  standalone: true,
  imports: [
    IconComponent,
    DividerComponent,
    TileComponent,
    TextInputComponent,
    ReactiveFormsModule,
    LoadingComponent,
    ModalComponent
  ],
  templateUrl: './plan-dashboard.component.html',
  styleUrl: './plan-dashboard.component.sass'
})
export class PlanDashboardComponent {
  trips: Array<Trip> = [];
  addTrip: boolean = true;
  addIcon: string = 'add';
  tripNameControl = new FormControl('', [Validators.required]);
  isLoading: boolean = false;
  isLongPress: boolean = false;
  deleteTrip: Trip | undefined;
  private pressTimer: any;
  private holdThreshold: number = 500;
  modalId: string = 'delete-trip';

  constructor(private modalService: ModalService, private firebaseService: FirebaseService, private router: Router, private authenticationService: AuthenticationService, private tripService: TripService) {
  }

  addNewTrip() {
    if (this.addTrip) {
      this.addTrip = false;
      this.addIcon = 'check';
    } else {
      this.isLoading = true;
      this.saveTrip().then(r => {
        this.loadTrips().then(r => {
          this.isLoading = false;
        });
      });
    }
  }

  async saveTrip() {
    const tripName = this.tripNameControl.value;
    const userId = this.authenticationService.getUserId();
    if (!tripName || tripName.trim() === '') {
      return;
    }
    if (tripName) {
      try {
        await this.firebaseService.addTripForUser(userId, {
          name: tripName,
          id: ''
        });
        this.tripNameControl.reset();
        this.resetAdd();
      } catch (error) {
        console.error('Error saving trip:', error);
      }
    }
  }

  ngOnInit() {
    this.isLoading = true;
    this.loadTrips().then(r => {
      this.isLoading = false;
    });
  }

  openTrip(trip: Trip) {
    if (!this.isLongPress) {
      this.tripService.setTripId(trip.id);
      this.tripService.setTripName(trip.name);
      this.router.navigate(['/trip']).then(() => {
      });
    }
  }

  async loadTrips() {
    this.trips = await this.firebaseService.getUserTrips(this.authenticationService.getUserId());
  }

  resetAdd() {
    this.addTrip = true;
    this.addIcon = 'add';
  }

  onMouseDown(event: MouseEvent, trip: Trip): void {
    this.isLongPress = false;
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.onLongPress(trip);
    }, this.holdThreshold);
  }

  onMouseUp(event: MouseEvent, trip: Trip): void {
    clearTimeout(this.pressTimer);

    if (!this.isLongPress) {
      this.openTrip(trip);
    }
  }

  onTouchStart(event: TouchEvent, trip: Trip): void {
    this.isLongPress = false;
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.onLongPress(trip);
    }, this.holdThreshold);
  }

  onTouchEnd(event: TouchEvent, trip: Trip): void {
    clearTimeout(this.pressTimer);

    if (!this.isLongPress) {
      this.openTrip(trip);
    }
  }

  onLongPress(trip: Trip): void {
    this.deleteTrip = trip;
    this.modalService.show(this.modalId);
  }

  deleteTripPlan() {
    if (this.deleteTrip) {
      this.firebaseService.deleteTripForUser(this.authenticationService.getUserId(), this.deleteTrip.id).then(() => {
        this.modalService.hide(this.modalId);
        this.isLongPress = false;
        this.deleteTrip = undefined;
        this.isLoading = true;
        this.loadTrips().then(r => {
          this.isLoading = false;
        });
      });
    }
  }

  resetAction() {
    this.isLongPress = false;
    this.deleteTrip = undefined;
  }
}
