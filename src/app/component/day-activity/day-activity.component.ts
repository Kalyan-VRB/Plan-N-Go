import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ActivityComponent} from '../activity/activity.component';
import {ButtonComponent} from '../../widget/button/button.component';
import {IconComponent} from '../../widget/icon/icon.component';
import {DividerComponent} from '../../widget/divider/divider.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {TextInputComponent} from '../../widget/text-input/text-input.component';
import {Activity} from '../../interface/activity';
import {DayActivity} from '../../interface/day-activity';
import {FirebaseService} from '../../service/firebase.service';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {MatCalendar, MatDatepicker} from '@angular/material/datepicker';
import {AsyncPipe, DatePipe, Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {AuthenticationService} from '../../service/authentication.service';
import {TripService} from '../../service/trip.service';
import {ModalService} from '../../service/modal.service';
import {ModalComponent} from '../../widget/modal/modal.component';
import {ActivityAction} from '../../interface/activity-action';

@Component({
  selector: 'trip-day-activity',
  standalone: true,
  imports: [
    ActivityComponent,
    ButtonComponent,
    IconComponent,
    DividerComponent,
    FormsModule,
    TextInputComponent,
    ReactiveFormsModule,
    LoadingComponent,
    MatDatepicker,
    MatCalendar,
    DatePipe,
    AsyncPipe,
    ModalComponent
  ],
  templateUrl: './day-activity.component.html',
  styleUrl: './day-activity.component.sass'
})
export class DayActivityComponent {
  @Input('activityId') activityId: string = '';
  dayActivity: DayActivity | undefined;
  isLoading: boolean = false;
  @Input('newDayActivity') newDayActivity: boolean = false;
  editAction: boolean = false;
  deleteAction: boolean = false;
  addAction: boolean = false;
  editIcon: string = 'edit';
  deleteIcon: string = 'delete';
  addIcon: string = 'add';
  saveIcon: string = 'check';
  activityDate: string = new Date().toISOString();
  dayActivityNameControl = new FormControl('', [Validators.required]);
  selected: Date | null | undefined;
  showDate: boolean = false;
  action: string = '';
  activityLength: number = 0;
  @Output('onCancel') onCancel = new EventEmitter<boolean>();
  @Output('onSave') onSave = new EventEmitter<void>();
  private tripId!: string;
  alertMessage: string = '';
  displayHeader: boolean = false;
  protected displayModal: boolean = false;
  formGroup: FormGroup;


  constructor(private firebaseService: FirebaseService, private route: ActivatedRoute, private authenticationService: AuthenticationService, private tripService: TripService, protected modalService: ModalService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      inputs: this.formBuilder.array([])
    });
  }

  ngOnInit() {
    this.tripId = this.tripService.getTripId();
    this.isLoading = true;
    this.loadDayActivity().then(response => {
      this.isLoading = false;
    });
  }

  async loadDayActivity() {
    this.isLoading = true;
    this.formGroup = this.formBuilder.group({
      inputs: this.formBuilder.array([])
    });
    if (this.newDayActivity) {
      this.dayActivity = {
        id: '0',
        name: '',
        activities: [],
        isNew: true,
        date: new Date().toISOString()
      };
      this.isLoading = false;
      this.selected = new Date(this.activityDate);
      this.activityLength = this.dayActivity?.activities.length || 0;
      this.dayActivity?.activities.forEach(a => {
        this.addValue(a);
      });
    } else {
      await this.firebaseService.getDayActivity(this.authenticationService.getUserId(), this.tripId, this.activityId).then((data) => {
        this.dayActivity = data;
        this.activityLength = this.dayActivity?.activities.length || 0;
        this.activityDate = this.dayActivity?.date || new Date().toISOString();
        this.selected = new Date(this.activityDate);
        this.isLoading = false;
        this.dayActivity?.activities.forEach(a => {
          this.addValue(a);
        });
      });
    }
    this.dayActivityNameControl.setValue(this.dayActivity?.name || '');
  }

  addActivity() {
    this.editAction = false;
    this.deleteAction = false;
    this.addAction = true;
    if (this.dayActivity) {
      const newActivity: Activity = {
        id: `${this.activityLength + 1}`,
        description: '',
        isNew: true
      } as Activity;
      this.activityLength = this.dayActivity.activities.push(newActivity);
      this.inputs.push(new FormControl(newActivity, [Validators.required]));
    }
    this.action = '';
  }

  deleteActivities() {
    if (!this.deleteAction) {
      this.editAction = false;
      this.deleteAction = true;
      this.addAction = false;
      this.action = 'delete';
    }
  }

  async saveActivity() {
    this.isLoading = true;
    const name: string = this.dayActivityNameControl.value || '';
    if (!name || name.trim() === '') {
      this.isLoading = false;
    }
    const activities = this.inputs.controls
      .map(control => (control.value as Activity))
      .filter(activity => activity.description.length > 0);
    await this.firebaseService.saveDayActivityForTrip(this.authenticationService.getUserId(), this.tripId, {
      id: this.newDayActivity ? '' : this.dayActivity?.id || '',
      name: name,
      activities: activities || [],
      isNew: false,
      date: this.activityDate,
    }, this.newDayActivity).then(dayActivity => {
      this.removeEmptyDescriptions();
      this.dayActivity = dayActivity || undefined;
      this.isLoading = false;
      if (dayActivity) {
        this.activityId = dayActivity.id;
      }
      if (this.newDayActivity) {
        this.onSave.emit();
      }
      this.newDayActivity = false;
      this.resetAction();
      this.resetIcons();
    });
  }

  removeEmptyDescriptions() {
    this.inputs.controls
      .forEach((control, index) => !control.value.description && this.inputs.removeAt(index));
  }

  removeControlById(activityId: string) {
    const index = this.inputs.controls.findIndex(control => control.value.id === activityId);
    if (index !== -1) {
      this.inputs.removeAt(index);
    }
  }

  editActivities() {
    if (!this.editAction) {
      this.editAction = true;
      this.deleteAction = false;
      this.addAction = false;
      this.action = 'edit';
    }
  }

  private resetAction() {
    this.editAction = false;
    this.deleteAction = false;
    this.addAction = false;
  }

  resetIcons() {
    this.editIcon = 'edit';
    this.deleteIcon = 'delete';
    this.addIcon = 'add';
    this.action = '';
  }

  cancelAction() {
    this.resetAction();
    this.resetIcons();
    this.resetActivity();
  }

  openDate() {
    this.showDate = true;
  }

  closeDate() {
    this.showDate = false;
  }

  changeDate() {
    this.closeDate();
    this.activityDate = this.selected?.toISOString() || new Date().toISOString();
  }

  handleSave(activityAction: ActivityAction, activity: Activity) {
    if (activityAction.actionType === 'save') {
      this.createActivity({
        id: activity.id,
        description: activityAction.activity.description,
        isNew: false
      }, activity.isNew);
    } else if (activityAction.actionType === 'delete') {
      this.deleteActivity(activity);
    }
  }

  deleteActivity(activity: Activity) {
    if (this.dayActivity) {
      this.firebaseService.deleteActivityFromDayActivity(this.authenticationService.getUserId(), this.tripId, this.dayActivity?.id, activity.id).then(success => {
        this.loadDayActivity().then(r => {
          this.resetAction();
          this.resetIcons();
        });
      })
    }
  }

  createActivity(activity: Activity, isNew: boolean) {
    if (this.dayActivity) {
      if (this.newDayActivity) {
        this.dayActivity.activities[this.dayActivity.activities.findIndex(a => a.id === activity.id)] = activity;
        this.saveActivity().then(() => {
        });
      } else {
        this.firebaseService.saveActivityForDayActivity(this.authenticationService.getUserId(), this.tripId, this.dayActivity?.id, activity, isNew).then(r => {
          this.loadDayActivity().then(r => {
            this.resetAction();
            this.resetIcons();
          });
        });
      }
    }
  }

  handleCancel(activity: Activity) {
    console.log(activity);
    if (this.dayActivity && activity.isNew) {
      this.dayActivity.activities = this.dayActivity?.activities.filter(a => a.id !== activity.id);
      if (this.dayActivity?.activities.filter(a => a.isNew).length == 0) {
        this.editIcon = 'edit';
      }
      this.removeControlById(activity.id);
    }
  }

  resetActivity() {
    this.loadDayActivity().then(r => {
      this.removeControlsNotInActivities();
    });
    this.onCancel.emit(this.newDayActivity);
  }

  removeControlsNotInActivities() {
    this.inputs.controls = this.inputs.controls.filter(control =>
      this.dayActivity?.activities.some(activity => activity.id === control.value.id)
    );
  }

  get validForm(): boolean {
    console.log('Array', this.inputs.controls);
    return this.dayActivityNameControl.valid && (!this.inputs.controls || this.inputs.controls.length == 0 || this.inputs.controls.filter(control => control.invalid || !control.value.description || (control.value.description && control.value.description.trim().length == 0)).length == 0);
  }

  deleteDayActivity() {
    if (this.newDayActivity) {
      this.resetActivity();
    } else {
      this.firebaseService.deleteDayActivity(this.authenticationService.getUserId(), this.tripId, this.activityId).then((data) => {
        this.onSave.emit();
      });
    }
  }

  confirmDelete() {
    this.resetIcons();
    this.alertMessage = 'Are you sure you want to delete?';
    this.displayHeader = true;
    this.editAction = false;
    this.deleteAction = true;
    this.addAction = false;
    this.action = 'remove';
    this.displayModal = true;
    this.modalService.show(this.activityId);
  }

  confirmAction() {
    if (this.deleteAction) {
      this.deleteDayActivity();
    }
    this.resetModal();
  }

  private resetModal() {
    this.modalService.hide(this.activityId);
    this.alertMessage = '';
    this.displayHeader = false;
    this.displayModal = false;
    this.resetAction();
  }

  saveAction() {
    this.saveActivity().then(r => {
      this.loadDayActivity().then(r => {
        this.resetAction();
        this.resetAction();
      })
    });
  }

  get inputs(): FormArray {
    return this.formGroup.get('inputs') as FormArray;
  }

  private addValue(activity: Activity) {
    this.inputs.push(new FormControl(activity, [Validators.required]));
  }

  getFormControl(index: number): FormControl {
    return this.inputs.at(index) as FormControl;
  }
}
