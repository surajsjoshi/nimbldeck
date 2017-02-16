import { Component, ElementRef } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  nimblDeckLogo = 'https://www.nimbldeck.com/assets/img/nimble-deck-logo.png';
  url = 'https://nimbldeck.com';
  constructor(private el: ElementRef) {}

  openModal(evt) {
    evt.preventDefault();
    let button = jQuery(this.el.nativeElement).find('.contact-us-btn');
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-contact')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Send';

    let contactSuccess = jQuery(this.el.nativeElement).find('.contact-success');
    contactSuccess.hide();
    let contactTextBox = jQuery(this.el.nativeElement).find('.contact-texbox');
    contactTextBox.val('');
    let modal = button.attr('href');
    jQuery(modal).openModal();
  }
}
