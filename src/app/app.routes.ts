import {Routes} from '@angular/router';
import {PlanDashboardComponent} from './component/plan-dashboard/plan-dashboard.component';
import {PlannerComponent} from './component/planner/planner.component';
import {LoginComponent} from './component/login/login.component';
import {authGuard} from './auth.guard';
import {TripForumComponent} from './component/trip-forum/trip-forum.component';
import {ForumComponent} from './component/forum/forum.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: PlanDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'trip',
    component: PlannerComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forum',
    component: TripForumComponent
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
