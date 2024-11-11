import {Component, ElementRef, ViewChild} from '@angular/core';
import {DayActivityComponent} from '../day-activity/day-activity.component';
import {IconComponent} from '../../widget/icon/icon.component';
import {DividerComponent} from '../../widget/divider/divider.component';
import {FirebaseService} from '../../service/firebase.service';
import {ButtonComponent} from '../../widget/button/button.component';
import {DayActivity} from '../../interface/day-activity';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {Activity} from '../../interface/activity';
import {AuthenticationService} from '../../service/authentication.service';
import {TripService} from '../../service/trip.service';
import {HeaderComponent} from '../../widget/header/header.component';

@Component({
  selector: 'trip-planner',
  standalone: true,
  imports: [
    DayActivityComponent,
    IconComponent,
    DividerComponent,
    ButtonComponent,
    LoadingComponent,
    HeaderComponent
  ],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.sass'
})
export class PlannerComponent {
  activities: Array<DayActivity> = [];
  private tripId!: string;
  isLoading: boolean = false;
  dayActivityLength: number = 0;
  tripName!: string;

  constructor(private firebaseService: FirebaseService, private router: Router, private route: ActivatedRoute, private authenticationService: AuthenticationService, private tripService: TripService) {
  }

  addDayActivity() {
    const newActivity = {
      id: `${this.dayActivityLength + 1}`,
      name: '',
      activities: [],
      isNew: true,
      date: ''
    };
    this.activities.push(newActivity);
    this.activities.sort((a, b) => {
      if (a.isNew !== b.isNew) {
        return a.isNew ? -1 : 1;
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  }

  ngOnInit() {
    this.tripId = this.tripService.getTripId();
    this.tripName = this.tripService.getTripName();
    this.loadActivities().then(r => {
    });
  }

  async fetchActivities(tripId: string) {
    try {
      this.activities = await this.firebaseService.getTripActivities(this.authenticationService.getUserId(), tripId);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }

  openDashboard() {
    this.router.navigate(['/dashboard']).then(() => {
    });
  }

  createTrips() {
    this.firebaseService.createUserWithTrips(this.authenticationService.getUserId()).then(r => {
    });
  }

  handleCancel(isNew: boolean, activity: DayActivity) {
    if (this.activities && isNew) {
      this.activities = this.activities.filter(a => a.id !== activity.id);
    }
  }

  handleSave() {
    this.loadActivities().then(r => {
    });
  }

  private async loadActivities() {
    this.isLoading = true;
    await this.fetchActivities(this.tripId).then(response => {
      this.dayActivityLength = this.activities.length;
      this.activities.sort((a, b) => {
        if (a.isNew !== b.isNew) {
          return a.isNew ? -1 : 1;
        } else {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
      });
      this.isLoading = false;
    });
  }

  openForum() {
    this.router.navigate(['/forum']).then(() => {

    });
  }
}
