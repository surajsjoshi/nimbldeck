

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
  isFirst: boolean;
  session: Session;
  queries;
  analytics;
  analyticsNew;
  timer: any;
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
    this.isFirst = true;
    this.queries = [];
    this.analytics = [];
    this.analyticsNew = [];
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
        this.loadDashboard();
        this.timeOut();
        mixpanel.time_event('ViewDashboard');
        jQuery('[data-toggle="tooltip"]').tooltip();
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
         this.analyticsNew = Array.from(response.answers).filter(answer => answer['answered_by'] > 0);
         if (this.isFirst) {
             this.analytics = this.analyticsNew;
             this.isFirst = false;
         } else {
              for (let answer of this.analyticsNew){
                  this.updateAnswer(answer);
              }
         }
    } else {
      this.analytics = [];
    }
  }

  private updateAnswer(answer: any) {
    let oldAnswer = Array.from(this.analytics).filter(ans => ans['question_id'] === answer.question_id)[0];
    let update = false;
    if (oldAnswer['analytics'].length !== answer['analytics'].length) {
          update = true;
    } else {
        for (let data of answer['analytics']) {
            let record = Array.from(oldAnswer['analytics']).filter(ans => ans['label'] === data['label'])[0];
            if (record['total'] !== data['total']) {
                update = true;
            }
        }
    }
    if (update) {
      for (let i = 0; i < this.analytics.length; i++) {
          if (this.analytics[i]['question_id'] === answer['question_id']) {
            this.analytics[i]['analytics'] = answer['analytics'];
            this.analytics[i]['answered_by'] = answer['answered_by'];
            this.analytics[i]['participants'] = answer['participants'];
          }
      }
    }
  }

  private mapSession(response) {
    this.session = response;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
   clearTimeout(this.timer);
    mixpanel.track('ViewDashboard', {'user': this.conf.getUser().emailId});
 }

  pageChanged(pageNo) {
    this.activePage = pageNo;
  }

  private timeOut() {
    let self = this;
    this.timer =  setTimeout(function(){
          self.load();
     }, environment.dashboardReloadInterval);
  }

  private load() {

      
this.loadDashboard();

       

      
      this.timeOut();
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
    //jQuery('#myModal').openModal();


    let min_width = jQuery(window).width() ;


    if (min_width>=787) {
      
        jQuery("#myModal").openModal();
    }
    
}

};
