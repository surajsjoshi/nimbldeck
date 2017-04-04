

import { ConfigurationService } from '../services/configuration.service';
import { QueriesService } from '../services/queries.service';
import { SessionService } from '../services/session.service';
import { SessionAnalyticsService } from '../services/sessionanalytics.service';
import { Session } from '../shared/models/session';
import { ElementRef, Component, ViewContainerRef, OnInit, OnDestroy , ComponentFactoryResolver} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import {CarouselComponent} from '../carousel/carousel.component';


import * as moment from 'moment';

declare var jQuery: any;
declare var ga: any;
declare var mixpanel: any;

@Component({
  selector: 'dashboard',
  moduleId: module.id,
  templateUrl: './dashboard.html',
  styles: ['./dashboard.css']
})
export class DashboardComponent implements OnInit , OnDestroy {

  activePage = 1;
  title  = 'Dashboard';
  sessionId: string;
  sessionFetched: boolean;
  analysisFetched: boolean;
  queriesFetched: boolean;
  session: Session;
  queries;
  analytics;
  timer: any;
  activeSlideIndex: number;
  private subscription: Subscription;


  constructor(public sessionService: SessionService,
   private analyticsService: SessionAnalyticsService,
   private conf: ConfigurationService,
   private queryService: QueriesService,
   private route: ActivatedRoute,
   private componentFactoryResolver: ComponentFactoryResolver,
   private viewContainerRef: ViewContainerRef) {
    this.analysisFetched = false;
    this.sessionFetched = false;
    this.queries = [];
    this.analytics = [];
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
        this.loadDashboard();
        //this.timeOut();
        mixpanel.time_event('ViewDashboard');
    });
  }

  private loadDashboard() {
      mixpanel.time_event('LoadDashboard');
        this.sessionService.getSession(this.sessionId)
        .subscribe(sess => this.mapSession(sess),
            (error => console.log(error)),
        () => this.sessionFetched = true);

        this.queryService.getQueries(this.sessionId)
        .subscribe(response => this.mapQueries(response),
          (error => console.log(error)),
          () => this.queriesFetched = true);

        this.analyticsService.getSessionAnalysis(this.sessionId)
        .subscribe(response => this.mapAnalysis(response),
          (error => console.log(error)),
        () => this.analysisFetched = true);
  }


  private mapQueries(response) {
    this.queries = response.queries;
    this.queries.forEach(element => {
       element.created_at = moment.utc(element.created_at).local().fromNow();
    });
  }

  private mapAnalysis(response) {
    if (response.type === 'Success') {
       this.analytics = Array.from(response.answers).filter(answer => answer['answered_by'] > 0);
    } else {
      this.analytics = [];
    }
  }

  private mapSession(response) {
    this.session = response;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
   // clearTimeout(this.timer);
    mixpanel.track('ViewDashboard', {'user': this.conf.getUser().emailId});
 }


  pageChanged(pageNo) {
    this.activePage = pageNo;
  }


  /*private timeOut() {
    let self = this;
    this.timer =  setTimeout(function(){
          self.load();
     }, environment.dashboardReloadInterval);
  }*/

  private load() {
      this.loadDashboard();
      // this.timeOut();
  }

openModal(event) {

    let num: number = jQuery(event.target).attr('id');
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CarouselComponent);
    this.viewContainerRef.clear();

    let cardNo = Number(Number(num) +Number( 4* (Number(this.activePage - 1))));
   
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<CarouselComponent>componentRef.instance).analytics = this.analytics;
    (<CarouselComponent>componentRef.instance).currentCard = Number(cardNo);
    (<CarouselComponent>componentRef.instance).queries = this.queries;
    jQuery('#myModal').openModal();

}

};
