import {Component, effect, EventEmitter, input, Input, InputSignal, Output, SimpleChanges} from '@angular/core';
import {Activity} from '../../interface/activity';
import {IconComponent} from '../../widget/icon/icon.component';
import {TextInputComponent} from '../../widget/text-input/text-input.component';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivityAction} from '../../interface/activity-action';

@Component({
  selector: 'trip-activity',
  standalone: true,
  imports: [
    IconComponent,
    TextInputComponent,
    LoadingComponent,
    ReactiveFormsModule
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.sass'
})
export class ActivityComponent {
  @Input('action') action: string = '';
  @Output('onSave') onSave: EventEmitter<ActivityAction> = new EventEmitter();
  @Output('onCancel') onCancel: EventEmitter<void> = new EventEmitter();
  isLoading: boolean = false;
  activityControl!: FormControl;
  activity!: Activity;
  control: InputSignal<FormControl> = input.required<FormControl>();
  activityDesc!: string;
  editMode: boolean = false;
  protected deleteMode: boolean = false;

  constructor() {
    effect(() => {
      this.activityControl = this.control();
      this.activity = this.activityControl.value;
    });
  }

  ngOnInit() {
    this.activityControl = this.control();
    this.deleteMode = this.action === 'delete';
    if(this.deleteMode){
      this.editMode = false;
    }
    this.activityDesc = this.activityControl.value?.description;
    this.activity = this.activityControl.value;
    console.log('Control: ', this.activityControl);
    console.log(this.activityDesc);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['action']) {
      this.deleteMode = this.action === 'delete';
      if(this.deleteMode){
        this.editMode = false;
      }
    }
  }

  cancel() {
    if (this.editMode) {
      this.editMode = false;
      this.action = 'edit';
      this.activity = {
        ...this.activity, description: this.activityDesc || ''
      } as Activity
      this.activityControl.reset();
      this.activityControl.setValue(this.activity);
      console.log('Control: ', this.activityControl);
    } else {
      this.onCancel.emit();
    }
  }

  save(action: string) {
    this.onSave.emit({
      activity: {
        ...this.activity, description: this.activityControl?.value.description || ''
      } as Activity,
      actionType: action
    });
    if (this.activityControl) {
      this.activityControl.value.isNew = false;
    }
  }

  handleClick() {
    console.log('D: ', this.deleteMode);
    console.log('E: ', this.editMode);
    if (this.activityControl?.value.isNew || this.editMode) {
      this.save('save');
    } else if (this.deleteMode) {
      this.save('delete');
    } else if (!this.editMode && this.action === 'edit') {
      this.editMode = true;
      this.action = 'check';
    }
  }


  updateDescription(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const updatedValue = {...this.activity, description: inputElement.value};
    this.activityControl?.setValue(updatedValue);
    this.activity = updatedValue;
    console.log(this.activity);
  }

  get validActivity(): boolean {
    const value: string = this.activityControl.value.description || '';
    return this.activityControl.valid && value.trim().length > 0;
  }
}
