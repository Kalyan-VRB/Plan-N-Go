import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {ModalService} from '../../service/modal.service';
import {DividerComponent} from '../divider/divider.component';
import {IconComponent} from '../icon/icon.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'trip-modal',
  standalone: true,
  imports: [
    DividerComponent,
    IconComponent
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.sass'
})
export class ModalComponent {
  isVisible: boolean = false;
  @Input('modalId') modalId!: string;
  @Input('header') header: string = 'Alert!';
  @Input('displayHeader') displayHeader: boolean = false;
  @Input('displayFooter') displayFooter: boolean = true;
  @Output('confirm') confirm: EventEmitter<void> = new EventEmitter();
  @Output('cancel') cancel: EventEmitter<void> = new EventEmitter();

  private modalSubscription: Subscription | undefined;

  constructor(private modalService: ModalService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.modalSubscription = this.modalService.getModalState(this.modalId).subscribe((state: boolean) => {
      this.isVisible = state;
    });
  }

  ngOnDestroy(): void {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
    }
  }

  closeModal() {
    this.modalService.hide(this.modalId);
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
