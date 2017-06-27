import { Observable } from 'rxjs';
import  * as  AWS  from 'aws-sdk';
import {Router} from '@angular/router';
import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { Session } from '../shared/models/session';
import { CognitoIdentityCredentials } from 'aws-sdk';
import {TranslateService} from '@ngx-translate/core';
import { CurrentUser } from '../shared/models/currentuser';
import { environment } from '../../environments/environment';

declare var ga: any;
declare var mixpanel: any;

@Injectable()
export class ConfigurationService {

 private user: CurrentUser;
 private uploader: AWS.S3;

 constructor(private api: ApiService, private router: Router,  private translator: TranslateService) {
     this.user = null;
     this.uploader = null;
 }

  getUser(): CurrentUser {
      return this.api.getUser();
  }

  translate(key: string | Array<string>, interpolateParams?: Object): Observable<string> {
      return this.translator.get(key, interpolateParams);
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

  private home(){
    this.router.navigateByUrl('login');
  }


}
