import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { CurrentUser } from '../shared/models/currentuser';
import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import {ContactService} from '../services/contact.service';

declare var jQuery: any;

@Component({
  moduleId: module.id,
  selector: 'contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css'],
  providers: [ConfigurationService, CurrentUser]
})
export class ContactusComponent {

  logoPath = 'https://www.nimbldeck.com/assets/img/nimbldeck-logo.jpg';
  contactSent = false;
  contactError = false;
  contactForm: FormGroup;
  sending: boolean;
  buttonText: string;

  constructor(private conf: ConfigurationService,
    private el: ElementRef,
    private contactService: ContactService,
    private formBuilder: FormBuilder) {
    this.sending = false;
    this.buttonText = "SEND";
    this.contactForm = formBuilder.group({
      message: new FormControl('message', Validators.required)
    });
   }


    submitContact(event) {
     event.preventDefault();
     this.buttonText = 'Sending...';
     this.contactService.postMessage(this.contactForm.controls['message'].value)
     .subscribe(resp => this.onSubmit(resp),  (error) => this.contactError = true);
    }

    onSubmit(response){
      this.contactSent = true;
      jQuery(this.el.nativeElement).find('#contact-us-modal').closeModal();
    }
}
