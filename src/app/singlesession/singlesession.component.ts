import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';
import { ConfigurationService } from '../services/configuration.service';
import { Component, OnInit, OnDestroy, ElementRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { CardService } from '../services/card.service';
import { SessionService } from '../services/session.service';
import { Card } from '../shared/models/card';
import { CardResponse } from '../shared/models/cardResponse';
import { CurrentUser } from '../shared/models/currentuser';
import { Session } from '../shared/models/session';
import { ChoosecardtypeComponent } from './choosecardtype/choosecardtype.component';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

declare var ga: any;
declare var jQuery: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'singlesession',
  templateUrl: './singlesession.component.html',
  styleUrls: ['./singlesession.component.css'],
  providers: []
})
export class SinglesessionComponent implements OnInit, OnDestroy {
  public response: CardResponse;
  public sessionId: string;
  public session: Session;
  public cardsFetched: boolean;
  public sessionFetched: boolean;
  private subscription: Subscription;
  private nextPageToken: string;


  constructor(public cardService: CardService,
              private conf: ConfigurationService,
              private sessionService: SessionService,
              private route: ActivatedRoute,
              private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private el: ElementRef) {
    this.nextPageToken = '';
    this.cardsFetched = false;
    this.sessionFetched = false;
   }

  ngOnInit() {
      this.subscription = this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      if (environment.production) {
        mixpanel.time_event('ListCards');
      }
      ga('set', 'userId', this.conf.getUser().getUserId());
      ga('send', 'pageview', '/sessions/' + this.sessionId);

      this.sessionService.getSession(this.sessionId)
        .subscribe(sess => this.mapSession(sess),
            (error => console.log(error)),
        () => this.sessionFetched = true);
      this.cardService.getSessionQuestions(this.sessionId, this.nextPageToken)
        .subscribe(resp => this.mapCards(resp),
        (error => console.log(error)),
        () => this.cardsFetched = true);
    });
    if (environment.production) {
       mixpanel.track('ListCards', {'user': this.conf.getUser().getEmailId()});
    }
  }

  private mapSession(response) {
    this.session = new Session(response.session, false);
  }

   private mapCards(response) {
    let cards = Array.from(response.questions).map(card => new Card(card)).values();
    this.response = new CardResponse(Array.from(cards), response.next_page_token);
  }

  openModal(evt) {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChoosecardtypeComponent);
     this.viewContainerRef.clear();
     let componentRef = this.viewContainerRef.createComponent(componentFactory);
    // (<ChoosecardtypeComponent>componentRef.instance).editService = this.editService;
    jQuery('#choose-card-modal').openModal();
  }

   showTextCard() {
  /*  this.removeall();
    this._dynamicComponentLoader
      .loadIntoLocation(TextCardComponent, this._el, 'cardModal')
      .then((ref) => {
        this._children.push(ref);
        (<any>jQuery('#text-card-modal')).openModal();
      });
*/
  }

  showRatingCard() {
  /*  this.removeall();
    this._dynamicComponentLoader
      .loadIntoLocation(RatingCardComponent, this._el, 'cardModal')
      .then((ref) => {
        this._children.push(ref);
        (<any>jQuery('#rating-card-modal')).openModal();
      });
*/
  }

  showShortAnswerCard() {
    /*this.removeall();
    this._dynamicComponentLoader
      .loadIntoLocation(ShortAnswerCardComponent, this._el, 'cardModal')
      .then((ref) => {
        this._children.push(ref);
        (<any>jQuery('#shortanswer-card-modal')).openModal();
      });
*/
  }

  showMcqCard() {
  /*  this.removeall();
    this._dynamicComponentLoader
      .loadIntoLocation(McqCardComponent, this._el, 'cardModal')
      .then((ref) => {
        this._children.push(ref);
        (<any>jQuery('#mcq-card-modal')).openModal();
      });
*/
  }

  showYesNoCard() {
 /*   this.removeall();
    this._dynamicComponentLoader
      .loadIntoLocation(YesNoCardComponent, this._el, 'cardModal')
      .then((ref) => {
        this._children.push(ref);
        (<any>jQuery('#yesno-card-modal')).openModal();
      });
*/
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
   }
}
