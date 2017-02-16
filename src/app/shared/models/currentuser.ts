
import { environment } from '../../../environments/environment';
import { Cookie } from 'ng2-cookies/ng2-cookies';

export class CurrentUser {

  userId: string;
  userName: string;
  emailId: string;
  token: string;
  identityId: string;
  sessionId: string;
  sessionexpired: boolean;
  constructor() {
    let user = JSON.parse(Cookie.get('nd_current_user'));
    if (null === user) {
       window.location.href = environment.basePath;
      return;
    }
    this.userId = user.user_id;
    this.userName = user.user_name;
    this.emailId = user.email_id;
    this.token = user.token;
    this.identityId = user.identityId;
    this.sessionexpired = true;
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
      Cookie.set('nd_current_user', JSON.stringify(this));
      window.location.href = environment.basePath;
  }
}
