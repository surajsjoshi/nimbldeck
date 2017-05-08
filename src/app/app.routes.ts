import { DashboardComponent } from './dashboard/dashboard';
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRoutes } from './login/login.routes';
import { SignupRoutes } from './signup/signup.routes';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { SinglesessionComponent } from './singlesession/singlesession.component';


const routes: Routes = [
  {
    path: 'app/:new',
    component: MysessionsComponent
  },
  {
    path: 'app',
    component: MysessionsComponent
  },
  {
    path: 'app/dashboard/:id',
    component: DashboardComponent
  },
  {
    path: 'app/sessions/:id',
    component: SinglesessionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
