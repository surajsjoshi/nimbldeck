import { Router } from '@angular/router';
import { Component , ElementRef} from '@angular/core';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { AuthService } from '../services/auth.service';
import { ConfigurationService } from '../services/configuration.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
/**
*  This class represents the lazy loaded LoginComponent.
*/

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
   styleUrls: ['./login.component.css']
})

export class LoginComponent { 
  loginText: string;
  loginForm: FormGroup;
  inProcess: boolean;
  

  constructor(private conf: ConfigurationService,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder) {
      this.loginText = 'LOG IN';
      this.inProcess = false;
      this.loginForm = this.formBuilder.group({
        emailId: new FormControl('', Validators.required),
        password: new FormControl('' , Validators.required)
    });
    }

  login(event){
    event.preventDefault();
    this.inProcess = true;
    this.loginText = 'Logging in ...'
    this.authService.login(this.loginForm.controls['emailId'].value,this.loginForm.controls['password'].value)
      .subscribe(resp => this.onLogin(resp), error => console.log(error));
  }

  private onLogin(response: String){
      console.log(response);
  }

}
