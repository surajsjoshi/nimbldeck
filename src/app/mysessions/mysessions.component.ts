import { environment } from '../../environments/environment';
import { CreatesessionComponent } from '../createsession/createsession.component';
import { DuplicatesessionComponent } from '../duplicatesession/duplicatesession.component';
import { EditsessionComponent } from '../editsession/editsession.component';
import { ApiService } from '../services/api.service';
import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { SessionService } from '../services/session.service';
import { CurrentUser } from '../shared/models/currentuser';
import { Session } from '../shared/models/session';

declare var jQuery: any;
declare var ga: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'mysessions',
  templateUrl: './mysessions.component.html',
  styleUrls: ['./mysessions.component.css']
})
export class MysessionsComponent  implements OnInit, OnDestroy, AfterViewInit {

  public title = 'My Sessions';

 constructor(public sessionService: SessionService,
   private conf: ConfigurationService,
   private viewContainerRef: ViewContainerRef,
   private editService: EditService,
   private componentFactoryResolver: ComponentFactoryResolver,
   private el: ElementRef) {
 }

  ngOnInit() {
    if (environment.production) {
       mixpanel.time_event('ListSessions');
    }
    this.sessionService.init();
   if (environment.production) {
       mixpanel.track('ListSessions', {'user': this.conf.getUser().emailId});
    }
    ga('set', 'userId', this.conf.getUser().getUserId());
    ga('send', 'pageview', 'sessions');
  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {

  }

  loadMoreSessions() {
    this.sessionService.defaultSessions();
  }

  openModal(event) {
    event.preventDefault();
    let button = jQuery(this.el.nativeElement).find('.add-new-session');
    let modal = button.attr('href');
    jQuery(modal).openModal();
  }

  onShowEditModal(event) {
     let componentFactory = this.componentFactoryResolver.resolveComponentFactory(EditsessionComponent);
     this.viewContainerRef.clear();
     let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<EditsessionComponent>componentRef.instance).editService = this.editService;
    jQuery('#edit-session-modal').openModal();
  }

  onShowDuplicateModal(event) {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(DuplicatesessionComponent);
     this.viewContainerRef.clear();
     let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<DuplicatesessionComponent>componentRef.instance).editService = this.editService;
    jQuery('#duplicate-session-modal').openModal();
  }

}
