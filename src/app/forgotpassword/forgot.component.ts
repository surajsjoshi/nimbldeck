import { Router , ActivatedRoute } from '@angular/router';
import { Component , ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ConfigurationService } from "../services/configuration.service";
import { CurrentUser } from "../shared/models/currentuser";
/**
*  This class represents the lazy loaded LoginComponent.
*/
declare var mixpanel: any;

@Component({
  selector: 'forgot',
  templateUrl: 'forgot.component.html',
   styleUrls: ['./forgot.component.css']
})

export class ForgotComponent  implements OnInit { 
  forgotText: string;
  forgotForm: FormGroup;
  inProcess: boolean;
  forgotError: boolean;
  errorMessage: string;
  returnUrl: string;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private conf: ConfigurationService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'home';
      if(this.conf.getUser() != null && !this.conf.getUser().sessionexpired){
         this.router.navigateByUrl(this.returnUrl);
      }
      this.forgotError = false;
      this.inProcess = false;
      this.errorMessage = '';
      this.forgotForm = this.formBuilder.group({
        emailId: new FormControl('', Validators.required)
      });
      this.conf.translate('forgotPassword.reset').subscribe((res: string) => {
        this.forgotText = res;
     });

  }

  login(event){
    event.preventDefault();
    this.inProcess = true;
    this.forgotError = false;
    this.conf.translate('forgotPassword.inProcess').subscribe((res: string) => {
        this.forgotText = res;
     });
    this.authService.forgotPassword(this.forgotForm.controls['emailId'].value)
      .subscribe(resp => this.onForget(resp), error => console.log(error));
  }

  private onForget(response){
     this.conf.translate('forgotPassword.reset').subscribe((res: string) => {
        this.forgotText = res;
     });
    if (response.type === 'Failure') {
      this.forgotError = true;
      mixpanel.track('ResetPasswordFailed', { 'error': response.errors[0].message });
      this.errorMessage = response.errors[0].message;
      this.inProcess = false;
      return;
    }
    
    mixpanel.track('ForgotPassword');
    this.router.navigateByUrl('/login');
  }

}
