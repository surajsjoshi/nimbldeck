import {ModuleWithProviders} from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginRoutes } from './login/login.routes';
import { SignupRoutes } from './signup/signup.routes';
import { MysessionsComponent } from './mysessions/mysessions.component';
import { SinglesessionComponent } from './singlesession/singlesession.component';


const routes: Routes = [
  {
    path: '',
    component: MysessionsComponent
  },
  {
    path: 'app',
    component: MysessionsComponent
  },
  {
    path: 'sessions/:id',
    component: SinglesessionComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
