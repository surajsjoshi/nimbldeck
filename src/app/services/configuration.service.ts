import { Injectable } from '@angular/core';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { Cookie } from 'ng2-cookies/ng2-cookies';
//import { environment } from '../../environments/environment';
import { CurrentUser } from '../shared/models/currentuser';
import { Session } from '../shared/models/session';
import {Router} from '@angular/router';

declare var AWS: any;
declare var ga: any;
declare var mixpanel: any;

@Injectable()
export class ConfigurationService {

    private user: CurrentUser;

 constructor(private router: Router) {
     this.user = null;
 }

  getUser(): CurrentUser {
      return this.loadUser();
  }

  private loadUser(): CurrentUser {
    
    let cookie = window.localStorage.getItem('nd_current_user');
    if (cookie !== null){
        let user = JSON.parse(cookie);
        if(!user.sessionexpired) {
            this.user = new CurrentUser(user);
        } else {
            this.user = null;
        }
    } else {
            this.user = null;
    }
    
    return this.user;
  }

  private home(){
      this.router.navigateByUrl('login');
  }

}
