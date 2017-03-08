import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { CurrentUser } from '../shared/models/currentuser';
import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  moduleId: module.id,
  selector: 'contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css'],
  providers: [ConfigurationService, CurrentUser]
})
export class ContactusComponent {

  logoPath = 'https://app.nimbldeck.com/assets/img/nimbldeck-logo.jpg';
  contactSent = false;
  contactError = false;
  contactForm: FormGroup;

  constructor(private conf: ConfigurationService,
    private el: ElementRef,
    private formBuilder: FormBuilder) {

    this.contactForm = formBuilder.group({
      message: new FormControl('message', Validators.required)
    });
   }


    submitContact(event) {

    }
}
