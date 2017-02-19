

import { ConfigurationService } from '../services/configuration.service';
import { QueriesService } from '../services/queries.service';
import { SessionService } from '../services/session.service';
import { Session } from '../shared/models/session';
import { ElementRef, Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


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
  private subscription: Subscription;

  constructor(public sessionService: SessionService,
   private conf: ConfigurationService,
   private queryService: QueriesService,
   private route: ActivatedRoute,
   private viewContainerRef: ViewContainerRef) {
    this.analysisFetched = false;
    this.sessionFetched = false;
    this.queries = [];
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
        this.sessionId = params['id'];
        mixpanel.time_event('LoadDashboard');
        this.sessionService.getSession(this.sessionId)
        .subscribe(sess => this.mapSession(sess),
            (error => console.log(error)),
        () => this.analysisFetched = true);

        this.queryService.getQueries(this.sessionId)
        .subscribe(response => this.mapQueries(response),
          (error => console.log(error),
          () => this.queriesFetched = true));
      });
  }


  private mapQueries(response) {
    this.queries = response.queries;
    this.queries.forEach(element => {
       element.created_at = moment.utc(element.created_at).local().fromNow();
    });
  }

  private mapSession(response) {
    this.session = new Session(response.session, false);
  }

   ngOnDestroy() {
    this.subscription.unsubscribe();
   }

/*  title = 'Dashboard';
  activePage = 1;
  session: Session;
  sessionFetched = false;
  timer: any;
  public collection = [];
  public url;
 // private _children:ComponentRef[] = [];

  constructor(public sessionService: SessionService,
   private conf: ConfigurationService,
   private viewContainerRef: ViewContainerRef) {

  }

  ngOnInit()  {
    let observable = this.sessionService.getSession(this.session.session_id);
    observable.subscribe(
      (this._sessionFetchComplete),
      (error => console.log(error))
    );
    mixpanel.time_event('LoadDashboard');
    this._singleSessionService.setSession(null);
    this._singleSessionService.isfetched = false;
    this._singleSessionService.sessionQuestions = [];
    this._sessionAnalyticsService.setSession(this._routeParams.get('sessionId'));
    this._queriesService.setSession(this._routeParams.get('sessionId'));
    this._sessionAnalyticsService.getSessionAnalysis();
    this._queriesService.getQueries();
    this.timeOut();
    mixpanel.track('LoadDashboard', {'user': this.conf.getUser().emailId});
    ga('set', 'userId', this.conf.getUser().userId);
    ga('send', 'pageview', '/sessions/dashboard');
    mixpanel.time_event('ViewDashboard');
  }


  timeOut() {
    let self = this;
    this.timer =  setTimeout(function(){
          self.load();
     }, 15000);
  }

  load() {

      jQuery( 'div' ).removeClass( 'in, modal-backdrop' );
      jQuery( 'body' ).removeClass( 'modal-open' );
//      this._sessionAnalyticsService.getSessionAnalysis();
  //    this._queriesService.getQueries();
      this.timeOut();
  }



  _sessionFetchComplete = (session) => {
    this.sessionFetched = true;
    this.session = session;
  }

  loadMoreSessions() {
  //  this.mysessionsService.getDefaultSessions();
  }



  removeall() {
    // this._children.forEach(cmp=>cmp.dispose());
    // this._children = []; // not even necessary to get the components off the screen
  }

  ngOnDestroy() {
        clearTimeout(this.timer);
        this.removeall();
        mixpanel.track('ViewDashboard', {'user': this.conf.getUser().emailId});
    }
*/
};
