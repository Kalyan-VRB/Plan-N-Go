import {Component, HostListener} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {PlannerComponent} from './component/planner/planner.component';
import {DayActivityComponent} from './component/day-activity/day-activity.component';
import {ModalService} from './service/modal.service';
import {AuthenticationService} from './service/authentication.service';
import {ModalComponent} from './widget/modal/modal.component';

@Component({
  selector: 'trip-root',
  standalone: true,
  imports: [RouterOutlet, PlannerComponent, DayActivityComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'activity-planner';
  protected modalId: string = 'reload';
  protected displayModal: boolean = false;
  protected alertMessage: string = '';
  private reloadConfirm: boolean = false;
  constructor(private router: Router, private modalService: ModalService, private authenticationService: AuthenticationService, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.addBeforeUnloadListener();
    this.router.navigate(['login']).then(() => {});
  }

  ngOnDestroy() {
    this.removeBeforeUnloadListener();
  }

  @HostListener('window:beforeunload', ['$event'])
  async handleBeforeUnload(event: Event): Promise<void> {
    if(!this.reloadConfirm){
      this.modalService.show(this.modalId);
      event.preventDefault();
    }
  }

  addBeforeUnloadListener() {
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  removeBeforeUnloadListener() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  showReloadModal() {
    this.displayModal = true;
    this.alertMessage = `It seems like you’ve been logged out. Please log in again to continue.`;
    this.modalService.show(this.modalId);
  }

  closeModal() {
    this.displayModal = false;
    this.alertMessage = '';
    this.reloadConfirm = true;
    this.modalService.hide(this.modalId);
  }
}
