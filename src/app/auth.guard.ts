import {CanActivateFn} from '@angular/router';
import {inject} from '@angular/core';
import {AuthenticationService} from './service/authentication.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  return authenticationService.isLoggedIn();
};
