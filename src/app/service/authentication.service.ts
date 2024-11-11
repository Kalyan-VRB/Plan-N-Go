import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private isAuthenticated = false;
  private userId!: string;

  constructor() {
  }

  login(userId: string) {
    this.userId = userId;
    this.isAuthenticated = true;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }
}
