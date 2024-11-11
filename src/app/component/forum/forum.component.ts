import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DividerComponent} from '../../widget/divider/divider.component';
import {Forum} from '../../interface/forum';
import {DatePipe} from '@angular/common';
import {LinkifyPipe} from '../../pipe/linkify.pipe';
import {IconComponent} from '../../widget/icon/icon.component';

@Component({
  selector: 'trip-forum',
  standalone: true,
  imports: [
    DividerComponent,
    DatePipe,
    LinkifyPipe,
    IconComponent
  ],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.sass'
})
export class ForumComponent {
  @Input('forum') forum!: Forum;
  @Input('editMode') editMode: boolean = false;
  @Output('action') action: EventEmitter<string> = new EventEmitter();

  get formattedDate(): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dateToCheck = new Date(this.forum.date);
    if (dateToCheck.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateToCheck.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return dateToCheck.toLocaleDateString();
    }
  }
  cancelEdit(){
    this.editMode = false;
    this.action.emit('cancel');
  }

  editForum() {
    this.editMode = false;
    this.action.emit('edit');
  }

  deleteForum() {
    this.editMode = false;
    this.action.emit('delete');
  }
}
