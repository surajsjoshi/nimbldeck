

import { ConfigurationService } from '../services/configuration.service';
import { QueriesService } from '../services/queries.service';
import { SessionService } from '../services/session.service';
import { SessionAnalyticsService } from '../services/sessionanalytics.service';
import { AnalyticsService } from '../services/analytics.service';
import { Session } from '../shared/models/session';
import { ElementRef, Component, ViewContainerRef, OnInit, OnDestroy , ComponentFactoryResolver} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import {CarouselComponent} from '../carousel/carousel.component';
import { EditService } from '../services/edit.service';
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
  queries: Array<any>;
  queriesNew: Array<any>;
  analytics: Array<any>;
  analyticsNew: Array<any>;
  timer: any;
  carousel: CarouselComponent;
  private subscription: Subscription;
  private componentFactory: any;


  constructor(public sessionService: SessionService,
   private analyticsService: SessionAnalyticsService,
   private conf: ConfigurationService,
   private queryService: QueriesService,
   private editService: EditService,
   private analyticsUpdateService: AnalyticsService,
   private route: ActivatedRoute,
   private router: Router,

   private componentFactoryResolver: ComponentFactoryResolver,
   private viewContainerRef: ViewContainerRef) {
    this.analysisFetched = false;
    this.sessionFetched = false;
    this.isFirst = true;
    this.queries = [];
    this.queriesNew = [];
    this.analytics = [];
    this.analyticsNew = [];
    this.componentFactory = this.componentFactoryResolver.resolveComponentFactory(CarouselComponent);
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
  }

  private mapQueries(response) {
    this.queriesNew = response.queries;
    this.queriesNew.forEach(element => {
       element.created_at = moment.utc(element.created_at).local().fromNow();
    });

    if (this.queriesNew.length !== this.queries.length) {
      this.queries = this.queriesNew;
      if (this.carousel) {
        this.carousel.queries = this.queries;
        this.carousel.update();
      }
    }
  }

  private mapAnalysis(response) {
    if (response.type === 'Success') {
         this.analyticsNew = Array.from(response.answers).filter(answer => answer['answered_by'] > 0);
         if (this.isFirst) {
             this.analytics = this.analyticsNew;
             this.isFirst = false;
         } else {
              let changed = this.analyticsUpdateService.updateAnalytics(this.analyticsNew, this.analytics);
              if (changed ) {
                  this.editService.announceUpdate();
                  if (this.carousel) {
                    this.carousel.update();
                  }
              }
         }
    } else {
      this.analytics = [];
    }
  }

  private mapSession(response) {
    this.session = response;
    //if(false) {
    if(!this.session.session_id || this.session.user_id !== this.conf.getUser().userId){
      alert('The session you are trying is access is invalid');
      this.router.navigateByUrl('/app');
    } else {
      this.queryService.getQueries(this.sessionId)
        .subscribe(response => this.mapQueries(response),
          (error => console.log(error)),
          () => this.queriesFetched = true);

        this.analyticsService.getSessionAnalysis(this.sessionId)
        .subscribe(response => this.mapAnalysis(response),
          (error => console.log(error)),
        () => this.analysisFetched = true);
    }
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
    this.viewContainerRef.clear();
    let cardNo = Number(Number(num) + Number( 4 * (Number(this.activePage - 1))));
    let componentRef = this.viewContainerRef.createComponent(this.componentFactory);
    this.carousel = (<CarouselComponent>componentRef.instance);
    this.carousel.analytics = this.analytics;
    this.carousel.currentCard = Number(cardNo);
    this.carousel.queries = this.queries;

    let min_width = jQuery(window).width();

    if (min_width >= 787) {
      jQuery('#myModal').openModal();
    }
}
};
