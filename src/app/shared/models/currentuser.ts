
import { environment } from '../../../environments/environment';
import { Router } from "@angular/router";
import { CognitoIdentityCredentials } from 'aws-sdk';
export class CurrentUser {

  userId: string;
  userName: string;
  emailId: string;
  token: string;
  identityId: string;
  sessionId: string;
  sessionexpired: boolean;
  credentials: CognitoIdentityCredentials;
  constructor(user) {
      this.userId = user.user_id;
      this.userName = user.user_name;
      this.emailId = user.email_id;
      this.token = user.token;
      this.identityId = user.identityId;
      this.sessionexpired = false;
      this.credentials = user.credentials;
  }

  getInitialLetter() {
    return this.userName.charAt(0).toUpperCase();
  }

  getUserId() {
    return this.userId;
  }

  getEmailId() {
    return this.emailId;
  }

  logout() {
      this.sessionexpired = true;
      window.localStorage.removeItem('nd_current_user');
      //window.location.href = environment.basePath;
  }
}
