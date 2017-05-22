import { Router } from '@angular/router';
import { Component , ElementRef} from '@angular/core';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ConfigurationService } from "../services/configuration.service";
import { CurrentUser } from "../shared/models/currentuser";
/**
*  This class represents the lazy loaded LoginComponent.
*/
declare var mixpanel: any;

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
   styleUrls: ['./login.component.css']
})

export class LoginComponent { 
  loginText: string;
  loginForm: FormGroup;
  inProcess: boolean;
  credentials: CognitoIdentityCredentials;
  loginError: boolean;
  errorMessage: string;  

  constructor(private authService: AuthService,
    private router: Router,
    private conf: ConfigurationService,
    private formBuilder: FormBuilder) {

      this.loginError = false;
      this.loginText = 'LOG IN';
      this.inProcess = false;
      this.errorMessage = '';
      this.loginForm = this.formBuilder.group({
        emailId: new FormControl('', Validators.required),
        password: new FormControl('' , Validators.required)
    });

    this.credentials = new CognitoIdentityCredentials({
            IdentityPoolId: environment.identityPool,
            RoleSessionName: 'web'
      },{ 
        region: 'us-east-1'
      });

      this.credentials.get(function (err) {
          if (err) {
            console.log(err);
        }});
    }

  login(event){
    event.preventDefault();
    this.inProcess = true;
    this.loginError = false;
    this.loginText = 'Logging in ...'
    let params = {
      'email_id': this.loginForm.controls['emailId'].value,
      'password':  this.loginForm.controls['password'].value,
      'identityId': this.credentials.identityId
  };
    this.authService.login(params)
      .subscribe(resp => this.onLogin(resp), error => console.log(error));
  }

  private onLogin(response){
    this.loginText = 'LOG IN';
    if (response.type === 'Failure') {
      this.loginError = true;
      mixpanel.people.increment('CreateSessionFailed');
      mixpanel.track('CreateSessionFailed', { 'error': response.errors[0].message });
      this.loginError = true;
      this.errorMessage = response.errors[0].message;
      this.inProcess = false;
      return;
    }
    let user = response.user;
    user.sessionexpired = false;
    user.credentials = this.credentials;
    window.localStorage.setItem('nd_current_user', JSON.stringify(user));
    mixpanel.identify(response.user.userId);
    mixpanel.people.set({
          '$email': response.user.emailId, // only special properties need the $
          '$last_login': new Date() // properties can be dates...
    });
    this.router.navigateByUrl('app');
  }

}
