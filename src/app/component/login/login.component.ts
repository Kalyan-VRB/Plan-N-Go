import {Component} from '@angular/core';
import {TextInputComponent} from '../../widget/text-input/text-input.component';
import {ButtonComponent} from '../../widget/button/button.component';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {DividerComponent} from '../../widget/divider/divider.component';
import {FirebaseService} from '../../service/firebase.service';
import {Router} from '@angular/router';
import {LoadingComponent} from '../../widget/loading/loading.component';
import {AuthenticationService} from '../../service/authentication.service';
import {ModalService} from '../../service/modal.service';
import {ModalComponent} from '../../widget/modal/modal.component';
import {HeaderComponent} from '../../widget/header/header.component';

@Component({
  selector: 'trip-login',
  standalone: true,
  imports: [
    TextInputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    DividerComponent,
    LoadingComponent,
    ModalComponent,
    HeaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass'
})
export class LoginComponent {
  usernameControl = new FormControl('', [Validators.required]);
  isLoading: boolean = false;
  alertMessage: string = '';
  displayModal: boolean = false;
  modalId: string = 'login';

  constructor(private firebaseService: FirebaseService, private router: Router, private authenticationService: AuthenticationService, private modalService: ModalService) {
  }

  login() {
    let userId = this.usernameControl.value || '';
    if (userId && userId !== '') {
      this.isLoading = true;
      userId = userId.toUpperCase();
      this.firebaseService.checkAndCreateUser(userId).then(userFound => {
        this.isLoading = false;
        if (!userFound) {
          this.alertMessage = 'Welcome Dear!';
          this.displayModal = true;
          this.modalService.show(this.modalId);
        } else {
          this.openDashboard();
        }
        this.authenticationService.login(userId);
      });
    }
  }

  openDashboard() {
    this.router.navigate(['/dashboard']).then(() => {
    });
  }

  closeModal() {
    this.modalService.hide(this.modalId);
    this.displayModal = false;
    this.openDashboard();
  }
}
