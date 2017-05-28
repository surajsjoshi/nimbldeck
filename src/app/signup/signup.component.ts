import { Router } from '@angular/router';
import { Component , ElementRef} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CurrentUser } from "../shared/models/currentuser";
import {TranslateService} from '@ngx-translate/core';
/**
*  This class represents the lazy loaded SignupComponent.
*/
declare var mixpanel: any;

@Component({
  selector: 'signup',
  templateUrl: 'signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignupComponent { 

  signupText: string;
  signUpForm: FormGroup;
  inProcess: boolean;
  signupError: boolean;
  errorMessage: string;  

    constructor(private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private formBuilder: FormBuilder) {

      this.signupError = false;
      this.signupText = 'REGISTER';
      this.inProcess = false;
      this.errorMessage = '';
      this.signUpForm = this.formBuilder.group({
        emailId: new FormControl('', Validators.required),
        password: new FormControl('' , Validators.required),
        username: new FormControl('' , Validators.required),
    });

    this.translate.get('general.register').subscribe((res: string) => {
        this.signupText = res;
    });

    }

    signup(event){
      event.preventDefault();
      this.inProcess = true;
      this.signupError = false;
      let params = {
        'email_id': this.signUpForm.controls['emailId'].value,
        'password': this.signUpForm.controls['password'].value,
        'username': this.signUpForm.controls['username'].value,
        'source': 'web'
      };

      this.translate.get('signup.inprocess').subscribe((res: string) => {
        this.signupText = res;
    });

      this.authService.signup(params)
        .subscribe(resp => this.onSigup(resp), error => console.log(error));
    }

    private onSigup(response){
      this.translate.get('general.register').subscribe((res: string) => {
        this.signupText = res;
     });
      if (response.type === 'Failure') {
        this.signupError = true;
        mixpanel.track('SignupFailed', { 'error': response.errors[0].message });
        this.inProcess = false;
        this.translate.get('errors', {value: response.errors[0].code}).subscribe((res: string) => {
          this.errorMessage = res[response.errors[0].code];
       });
        return;
      }

      let params = {
        'email_id': this.signUpForm.controls['emailId'].value,
        'password':  this.signUpForm.controls['password'].value,
        'identityId': this.authService.credentials.identityId
      };
      this.authService.login(params)
        .subscribe(resp => this.onLogin(resp), error => console.log(error));

    }


  private onLogin(response){
    this.translate.get('login.login').subscribe((res: string) => {
        this.signupText = res;
    });
    if (response.type === 'Failure') {
      this.signupError = true;
      mixpanel.track('LoginFailed', { 'error': response.errors[0].message });
      this.inProcess = false;
      this.translate.get('errors', {value: response.errors[0].code}).subscribe((res: string) => {
          this.errorMessage = res[response.errors[0].code];
     });
      return;
    }
    let user = response.user;
    user.sessionexpired = false;
    user.credentials = this.authService.credentials;
    window.localStorage.setItem('nd_current_user', JSON.stringify(user));
    mixpanel.identify(response.user.userId);
    mixpanel.people.set({
          '$email': response.user.emailId, // only special properties need the $
          '$last_login': new Date() // properties can be dates...
    });
    this.router.navigateByUrl('home/new');
  }

}
