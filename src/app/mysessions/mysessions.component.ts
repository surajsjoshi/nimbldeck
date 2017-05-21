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
import { AppSharedService } from '../app-shared.service';
import { ActivatedRoute } from '@angular/router';

declare var jQuery: any;
declare var ga: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'mysessions',
  templateUrl: './mysessions.component.html',
  styleUrls: ['./mysessions.component.scss']
})
export class MysessionsComponent implements OnInit, OnDestroy, AfterViewInit {

  public title = 'My Sessions';
  public isNewUser: boolean;
  private sub: any;
  
  constructor(public sessionService: SessionService,
    private conf: ConfigurationService,
    private viewContainerRef: ViewContainerRef,
    private editService: EditService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private el: ElementRef,
    private appSharedService: AppSharedService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.isNewUser = params['new'];
        this.appSharedService.helpFinish$.subscribe((resp) => {
          // Help finished
          this.openModal();
        });
        mixpanel.time_event('ListSessions');
        this.sessionService.init();
        mixpanel.track('ListSessions', { 'user': this.conf.getUser().emailId });
        ga('set', 'userId', this.conf.getUser().getUserId());
        ga('send', 'pageview', 'sessions');
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {

  }

  loadMoreSessions() {
    this.sessionService.defaultSessions();
  }

  openModal(event?) {
    if (event) {
      event.preventDefault();
    }
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

  onHelpFinish() {
    this.openModal();
  }

  onAskQuery() {
    this.appSharedService.emitAskQuery({});
  }

}
