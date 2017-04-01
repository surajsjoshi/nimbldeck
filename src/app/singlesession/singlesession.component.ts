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
import { McqCardComponent } from './mcqcard/mcqcard';
import { RatingCardComponent } from './ratingcard/ratingcard';
import { ShortAnswerCardComponent } from './shortanswercard/shortanswercard';
import { TextcardComponent } from './textcard/textcard.component';
import { YesNoCardComponent } from './yesnocard/yesnocard';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {CarouselComponent} from '../carousel/carousel.component';

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
      mixpanel.time_event('ListCards');
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
      mixpanel.track('ListCards', {'user': this.conf.getUser().getEmailId()});

  }

  private mapSession(response) {
    this.session = response;
  }

   private mapCards(response) {
    let cards = Array.from(response.questions).map(card => new Card(card));
    this.response = new CardResponse(cards, response.next_page_token);
    this.cardService.cards = cards;
  }


 editQuestion(evt, question) {
    evt.preventDefault();
    this.editService.setCurrentEdit('question', question);
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
  }

    deleteQuestion(event, questionId) {
       event.preventDefault();
       let params = {
          question_id: questionId,
          session_id: this.sessionId
        };
    if (confirm('Are you sure, you want to delete this question?')) {
      let observable = this.cardService.deleteQuestion(params);
      observable.subscribe(
        (resp => this.questionDeleted(resp, questionId)),
        (error => this.questionDeleteError = true)
      );
    }
  }

  questionDeleted(resp, questionId) {
    let index = -1;
    for (let i = 0, len = this.cardService.cards.length; i < len; i++) {
      if (this.cardService.cards[i].question_id === questionId) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      this.cardService.cards.splice(index, 1);
    }
    mixpanel.people.increment('Cards', -1);
  }

  openModal(evt) {
    evt.preventDefault();
    this.editService.resetEdits();
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
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(RatingCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<RatingCardComponent>componentRef.instance).editService = this.editService;
    jQuery('#rating-card-modal').openModal();
  }

  showShortAnswerCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ShortAnswerCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<ShortAnswerCardComponent>componentRef.instance).editService = this.editService;
    jQuery('#shortanswer-card-modal').openModal();
  }

  showMcqCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(McqCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<McqCardComponent>componentRef.instance).editService = this.editService;
    jQuery('#mcq-card-modal').openModal();
  }

  showYesNoCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(YesNoCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<YesNoCardComponent>componentRef.instance).editService = this.editService;
    jQuery('#yesno-card-modal').openModal();
  }

  openCarouselModal(event) {

    let num=jQuery(event.target).attr('id');
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CarouselComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<CarouselComponent>componentRef.instance).currentCard = Number(num);
    jQuery('#myModal').openModal(); 

}


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.editService.resetEdits();
   }
}
