import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { CurrentUser } from '../shared/models/currentuser';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

declare var ga: any;
declare var mixpanel: any;

@Component({
  selector: 'userdropdown',
  templateUrl: './userdropdown.component.html',
  styleUrls: ['./userdropdown.component.css'],
  providers: [ ConfigurationService]
})
export class UserdropdownComponent {


  constructor(private conf: ConfigurationService, 
    private router: Router) {
  }


  getInitialLetter() {
    return this.conf.getUser().getInitialLetter();
  }

  getUserName() {
    return this.conf.getUser().userName;
  }

   logoutUser() {
    let user = this.conf.getUser();
    mixpanel.time_event('Logout');
    ga('set', 'userId', user.getUserId());
    ga('send', 'pageview', '/logout');
    mixpanel.track('Logout', {'user': user.getEmailId()});
    user.logout();
    this.router.navigateByUrl('/login');
  }

}
