import { Component, ElementRef, ViewContainerRef } from '@angular/core';
import { environment } from '../environments/environment';
import { AppSharedService } from './app-shared.service';
import { ConfigurationService } from "./services/configuration.service";
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
declare var jQuery: any;

@Component({
  selector: 'app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isHelpNeeded: boolean = false;
  nimblDeckLogo = environment.logoPath;
  url = 'https://nimbldeck.com';
  public isGetStartedActive = true;
  
  constructor(private el: ElementRef, 
  private appSharedService: AppSharedService,
  private conf: ConfigurationService, 
  private toastr: ToastsManager,
  private containerRef: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(containerRef);
   }

  ngOnInit() {
    this.appSharedService.askQuery$.subscribe((resp) => {
      this.openModal();
    })
  }

  sessionExpired():boolean {
    let expired = true;
    let user = this.conf.getUser();
    if(user != null && !user.sessionexpired){
      expired = false;
    }
    return expired;
  }

  openModal(evt?) {
    if (evt) {
      evt.preventDefault();
    }
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

  onHelpClosed() {
    this.isHelpNeeded = false;
  }

  onHelpFinish() {
    this.appSharedService.emitHelpFinish({});
  }

  onAskQuery() {
    this.openModal();
  }
}
