import { Router , ActivatedRoute } from '@angular/router';
import { Component , ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ConfigurationService } from "../services/configuration.service";
import { CurrentUser } from "../shared/models/currentuser";
import {TranslateService} from '@ngx-translate/core';
/**
*  This class represents the lazy loaded LoginComponent.
*/
declare var mixpanel: any;

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
   styleUrls: ['./login.component.css']
})

export class LoginComponent  implements OnInit { 
  loginText: string;
  loginForm: FormGroup;
  inProcess: boolean;
  loginError: boolean;
  errorMessage: string;
  returnUrl: string;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private conf: ConfigurationService,
    private translate: TranslateService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'home';
      if(this.conf.getUser() != null && !this.conf.getUser().sessionexpired){
         this.router.navigateByUrl(this.returnUrl);
      }
      this.loginError = false;
      this.loginText = 'LOG IN';
      this.inProcess = false;
      this.errorMessage = '';
      this.loginForm = this.formBuilder.group({
        emailId: new FormControl('', Validators.required),
        password: new FormControl('' , Validators.required)
    });

    this.translate.get('login.login').subscribe((res: string) => {
        this.loginText = res;
    });

  }

  login(event){
    event.preventDefault();
    this.inProcess = true;
    this.loginError = false;

    this.translate.get('login.message').subscribe((res: string) => {
        this.loginText = res;
    });

    let params = {
      'email_id': this.loginForm.controls['emailId'].value,
      'password':  this.loginForm.controls['password'].value
  };
    this.authService.login(params)
      .subscribe(resp => this.onLogin(resp), error => console.log(error));
  }

  private onLogin(response){
    this.translate.get('login.login').subscribe((res: string) => {
        this.loginText = res;
    });
    if (response.type === 'Failure') {
      this.loginError = true;
      mixpanel.track('LoginFailed', { 'error': response.errors[0].message });
      this.loginError = true;
      this.errorMessage = response.errors[0].message;
      this.inProcess = false;
      return;
    }
    let user = response.user;
    user.sessionexpired = false;
    user.credentials = this.authService.credentials;
    window.localStorage.setItem('nd_current_user', JSON.stringify(user));
    mixpanel.identify(response.user.userId);
    mixpanel.people.set({
          '$email': response.user.emailId, // only special properties need the $
          '$last_login': new Date(), // properties can be dates...
          'username': response.user.userName
    });
    mixpanel.track('Login', { 'user': this.conf.getUser().getEmailId()});
    this.router.navigateByUrl(this.returnUrl);
  }

}
