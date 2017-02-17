import { environment } from '../../environments/environment';
import { ApiService } from '../services/api.service';
import { ConfigurationService } from '../services/configuration.service';
import { Component, OnInit, OnDestroy, ElementRef, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { CardService } from '../services/card.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Card } from '../shared/models/card';
import { CardResponse } from '../shared/models/cardResponse';
import { CurrentUser } from '../shared/models/currentuser';
import { Session } from '../shared/models/session';
import { ChoosecardtypeComponent } from './choosecardtype/choosecardtype.component';
import { TextcardComponent } from './textcard/textcard.component';
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
  private questionDeleteError: boolean;


  constructor(public cardService: CardService,
              private conf: ConfigurationService,
              private sessionService: SessionService,
              public editService: EditService,
              private route: ActivatedRoute,
              private viewContainerRef: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private el: ElementRef) {
    this.nextPageToken = '';
    this.cardsFetched = false;
    this.sessionFetched = false;
    this.questionDeleteError = false;
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


 editQuestion(evt, question) {
    evt.preventDefault();
    if (question.question_type === 'yes_no') {
      this.showYesNoCard();
    } else if (question.question_type === 'multiple_choice') {
      this.showMcqCard();
    } else if (question.question_type === 'short_text') {
      this.showShortAnswerCard();
    } else if (question.question_type === 'rating') {
      this.showRatingCard();
    } else {
      this.showTextCard();
    }
    this.editService.setCurrentEdit('question', question);
    this.cardService.cards = this.response.cards;
  }

    deleteQuestion(event, questionId) {
       event.preventDefault();
       let params = {
          question_id: questionId
        };
    if (confirm('Are you sure, you want to delete this question?')) {
      let observable = this.cardService.deleteQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this.questionDeleted(resp, questionId)),
        (error => this.questionDeleteError = true)
      );
    }
  }

  questionDeleted(resp, questionId) {
    this.cardService.cards = this.cardService.cards.filter(card => card.question_id !== questionId);
    mixpanel.people.increment('Cards', -1);
  }

  openModal(evt) {
    event.preventDefault();
    let button = jQuery(this.el.nativeElement).find('.choose-card-type');
    let modal = button.attr('href');
    jQuery(modal).openModal();
  }

 showTextCard() {
  let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TextcardComponent);
     this.viewContainerRef.clear();
     let componentRef = this.viewContainerRef.createComponent(componentFactory);
     (<TextcardComponent>componentRef.instance).editService = this.editService;
    jQuery('#text-card-modal').openModal();
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
