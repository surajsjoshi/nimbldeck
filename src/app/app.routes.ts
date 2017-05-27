import { DashboardComponent } from './dashboard/dashboard';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { SinglesessionComponent } from './singlesession/singlesession.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotComponent }  from './forgotpassword/forgot.component'
import { AuthGuard } from "./shared/guards/auth.guard";

const routes: Routes = [
  {
    path: 'home/:new', component: MysessionsComponent,  canActivate: [AuthGuard] 
  },
  {
    path: 'home', component: MysessionsComponent, canActivate: [AuthGuard] 
  },
  {
    path: 'sessions/:id',component: SinglesessionComponent, canActivate: [AuthGuard] 
  },
    {
    path: 'dashboard/:id',component: DashboardComponent, canActivate: [AuthGuard] 
  },
  {
    path: 'login', component: LoginComponent
  },
  {
     path: 'forgot-password', component: ForgotComponent
  },
    {
     path: 'signup', component: SignupComponent
  },
  {
     path: '', redirectTo: 'login', pathMatch: 'full'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {useHash: true});
