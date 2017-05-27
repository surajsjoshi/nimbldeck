import { Injectable } from '@angular/core';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { CurrentUser } from '../shared/models/currentuser';
import { Session } from '../shared/models/session';
import {Router} from '@angular/router';
import { environment } from '../../environments/environment';
import  * as  AWS  from 'aws-sdk';

declare var ga: any;
declare var mixpanel: any;

@Injectable()
export class ConfigurationService {

 private user: CurrentUser;
 private uploader: AWS.S3;

 constructor(private router: Router) {
     this.user = null;
     this.uploader = null;
 }

  getUser(): CurrentUser {
      return this.loadUser();
  }

  getUploader(): AWS.S3 {
     if(this.uploader === null){
        let user = this.getUser();
        let credentials  = new CognitoIdentityCredentials({
            IdentityPoolId: environment.identityPool,
            IdentityId: user.identityId,
            LoginId: user.emailId,
            Logins: {
                'cognito-identity.amazonaws.com': user.token
            },
            RoleSessionName: 'web' },
            { region: environment.awsRegion});
        let self = this;
        credentials.get(function (err) {
          if (err) {
            console.log(err);
            self.router.navigateByUrl('login');
        }});
         AWS.config.update({
          region: environment.awsRegion,
          credentials: credentials});

        this.uploader = new AWS.S3({credentials: credentials, region: environment.awsRegion});
     }
     return this.uploader;
  }

  private loadUser(): CurrentUser {
    
    let cookie = window.localStorage.getItem('nd_current_user');
   
    if (cookie !== null){
        let user = JSON.parse(cookie);
        this.user = new CurrentUser(user);
        this.user.emailId = user.emailId;
        if(this.user.credentials){
            if(this.user.credentials.expired){
                this.user.sessionexpired = true;
            } else {
                user.sessionexpired = false;
            }
        } else {
            this.user.sessionexpired = true;
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
