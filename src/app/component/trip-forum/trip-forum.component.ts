import {Component} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {IconComponent} from '../../widget/icon/icon.component';
import {ForumComponent} from '../forum/forum.component';
import {Forum} from '../../interface/forum';
import {DividerComponent} from '../../widget/divider/divider.component';
import {ModalService} from '../../service/modal.service';
import {ModalComponent} from '../../widget/modal/modal.component';
import {TextAreaComponent} from '../../widget/text-area/text-area.component';
import {FirebaseService} from '../../service/firebase.service';
import {AuthenticationService} from '../../service/authentication.service';
import {TripService} from '../../service/trip.service';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {Router} from '@angular/router';
import {HeaderComponent} from '../../widget/header/header.component';
import {Trip} from '../../interface/trip';
import {TileComponent} from '../../widget/tile/tile.component';

@Component({
  selector: 'trip-trip-forum',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    IconComponent,
    ForumComponent,
    DividerComponent,
    ModalComponent,
    TextAreaComponent,
    LoadingComponent,
    ReactiveFormsModule,
    HeaderComponent,
    TileComponent
  ],
  templateUrl: './trip-forum.component.html',
  styleUrl: './trip-forum.component.sass'
})
export class TripForumComponent {
  modalId: string = 'comment';
  displayModal: boolean = false;
  displayHeader: boolean = false;
  forums: Array<Forum> = [] as Forum[];
  modalHeader: string = '';
  isLoading: boolean = false;
  forumControl: FormControl = new FormControl('', [Validators.required]);
  tripName: string = '';
  isLongPress: boolean = false;
  actionForum: Forum | undefined;
  private pressTimer: any;
  private holdThreshold: number = 500;
  protected deleteAction: boolean = false;
  deleteMessage: string = '';

  constructor(private router: Router, private modalService: ModalService, private firebaseService: FirebaseService, private authenticationService: AuthenticationService, private tripService: TripService) {
  }

  ngOnInit() {
    this.loadForums();
    this.tripName = this.tripService.getTripName();
  }

  openComment() {
    this.displayModal = true;
    this.displayHeader = true;
    this.modalId = 'comment';
    this.modalHeader = 'Announcement';
    this.deleteAction = false;
    this.forumControl = new FormControl('', [Validators.required]);
    this.modalService.show(this.modalId);
  }

  closeComment() {
    this.displayModal = false;
    this.displayHeader = false;
    this.modalHeader = '';
    this.isLongPress = false;
    this.actionForum = undefined;
    this.modalService.hide(this.modalId);
  }

  private loadForums() {
    this.isLoading = true;
    this.firebaseService.getForums(this.authenticationService.getUserId(), this.tripService.getTripId()).then(forums => {
      forums.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.forums = forums;
      this.isLoading = false;
    });
  }

  saveComment() {
    console.log('Forum: ', this.actionForum);
    if (this.actionForum) {
      if (this.deleteAction) {
        this.firebaseService.deleteAnnouncement(this.authenticationService.getUserId(), this.tripService.getTripId(), this.actionForum.id).then((success) => {
          this.loadForums();
          this.closeComment();
        });
        this.deleteAction = false;
      } else {
        const forum: Forum =
          {
            ...this.actionForum,
            content: this.forumControl.value,
            date: new Date().toISOString()
          };
        this.firebaseService.editAnnouncement(this.authenticationService.getUserId(), this.tripService.getTripId(), forum).then(() => {
          this.loadForums();
          this.forumControl.reset();
          this.actionForum = undefined;
          this.closeComment();
        });
      }
    } else {
      const forum: Forum = {
        id: '',
        date: new Date().toISOString(),
        content: this.forumControl.value
      } as Forum;
      this.firebaseService.addAnnouncement(this.authenticationService.getUserId(), this.tripService.getTripId(), forum).then(() => {
        this.loadForums();
        this.forumControl.reset();
        this.closeComment();
      });
    }
  }

  openTrip() {
    this.router.navigate(['/trip']).then(() => {
    });
  }

  onMouseDown(event: MouseEvent, forum: Forum): void {
    this.isLongPress = false;
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.onLongPress(forum);
    }, this.holdThreshold);
  }

  onMouseUp(event: MouseEvent, forum: Forum): void {
    clearTimeout(this.pressTimer);

    if (!this.isLongPress) {
      //
    }
  }

  onTouchStart(event: TouchEvent, forum: Forum): void {
    this.isLongPress = false;
    this.pressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.onLongPress(forum);
    }, this.holdThreshold);
  }

  onTouchEnd(event: TouchEvent, forum: Forum): void {
    clearTimeout(this.pressTimer);

    if (!this.isLongPress) {
      //
    }
  }

  onLongPress(forum: Forum): void {
    this.actionForum = forum;
  }

  handleAction(action: string, forum: Forum) {
    if (action === 'edit') {
      this.editForum(forum);
    } else if (action === 'delete') {
      this.deleteForum(forum);
    } else {
      this.actionForum = undefined;
    }
    this.isLongPress = false;
  }

  private editForum(forum: Forum) {
    this.modalId = 'edit-forum';
    this.displayModal = true;
    this.displayModal = true;
    this.displayHeader = true;
    this.deleteAction = false;
    this.modalHeader = 'Edit';
    this.actionForum = forum;
    this.forumControl = new FormControl(forum.content, [Validators.required]);
    this.modalService.show(this.modalId);
  }

  private deleteForum(forum: Forum) {
    this.modalId = 'edit-forum';
    this.displayModal = true;
    this.displayModal = true;
    this.actionForum = forum;
    this.displayHeader = true;
    this.deleteMessage = 'Are you sure you want to delete this comment?';
    this.modalHeader = 'Delete';
    this.deleteAction = true;
    this.modalService.show(this.modalId);
  }
}
