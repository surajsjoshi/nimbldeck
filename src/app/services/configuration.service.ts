import { Observable } from "rxjs";
import { Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Session } from '../shared/models/session';
import {TranslateService} from '@ngx-translate/core';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { CurrentUser } from '../shared/models/currentuser';
import { environment } from '../../environments/environment';

declare var AWS: any;
declare var ga: any;
declare var mixpanel: any;

@Injectable()
export class ConfigurationService {

  constructor(private user: CurrentUser, private api: ApiService) {
   let data = Cookie.get('nd_current_user');
   if (typeof data !== 'undefined' && data !== null) {
      this.login(JSON.parse(data));
   } else {
      this.home();
   }
 }

  getUser(): CurrentUser {
      return this.user;
  }

  getVideoUploadPolicy(name: string): Observable<Response> {
    return this.api.get('/videos/keys?tag='+name);
  }

  uploadVideo(url, postData) : Observable<Response> {
    return this.api.vdocipherUpload(url, postData);
  }

  deleteVideo(videoId): Observable<Response> {
    return this.api.vdocipherDelete(videoId);
  }

  login(user): any {
   ga('set', 'userId', user.userId); // Set the user ID using signed-in user_id.
   mixpanel.identify(user.userId);
   mixpanel.people.set({
      '$email': user.emailId,
      '$last_login': new Date()
   });
   if (user.sessionexpired) {
       this.home();
   } else {
   let self = this;
   let credentials = new CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:709d954c-b58c-4d42-94a0-d1f7e494d226',
            IdentityId: user.identityId,
            Logins: {
                    'cognito-identity.amazonaws.com': user.token
                },
            RoleSessionName: 'web' // optional name, defaults to web-identity,
        });
      AWS.config.update({
        region: 'us-east-1',
        credentials: credentials
      });
        AWS.config.credentials.get(function (err) {
    if (err) {
       self.home();
    }
  });
   }
  }
  home(): any {
      window.location.href = environment.basePath;
  }

  logout() {
      Cookie.delete('nd_current_user');
      window.location.href = environment.basePath;
  }
}
