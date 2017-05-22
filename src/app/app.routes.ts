import { DashboardComponent } from './dashboard/dashboard';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const routes: Routes = [
  {
    path: 'app/:new', component: MysessionsComponent
  },
  {
    path: 'app', component: MysessionsComponent
  },
  {
    path: 'app/dashboard/:id',component: DashboardComponent
  },
  {
    path: 'app/sessions/:id',component: SinglesessionComponent
  },
  {
      path: 'login', component: LoginComponent
  },
  {
      path: 'signup', component: SignupComponent
  },
  {
      path: '', redirectTo: 'login', pathMatch: 'full'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
