import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { CurrentUser } from '../shared/models/currentuser';
import { Component } from '@angular/core';

declare var ga: any;
declare var mixpanel: any;

@Component({
  selector: 'userdropdown',
  templateUrl: './userdropdown.component.html',
  styleUrls: ['./userdropdown.component.css'],
  providers: [ ConfigurationService, CurrentUser]
})
export class UserdropdownComponent {

  userName: string;

  constructor(private conf: ConfigurationService) {
    this.userName = this.conf.getUser().userName;
  }


  getInitialLetter() {
    try {
    return this.userName.charAt(0).toUpperCase();
    } catch (err) {
        this.conf.getUser().logout();
     }
  }

   logoutUser() {
    mixpanel.time_event('Logout');
    ga('set', 'userId', this.conf.getUser().getUserId());
    ga('send', 'pageview', '/logout');
    this.conf.getUser().logout();
    mixpanel.track('Logout', {'user': this.conf.getUser().getEmailId()});
  }

}
