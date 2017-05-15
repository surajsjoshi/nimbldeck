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

import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { SingleSessionService } from './singlesession.service';


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
    private el: ElementRef,
    private dragulaService: DragulaService,
    private singleSessionService: SingleSessionService
  ) {

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
    mixpanel.track('ListCards', { 'user': this.conf.getUser().getEmailId() });

    this.subscribeDropEvent();
  }

  subscribeDropEvent() {
    this.dragulaService.drop.subscribe((value) => {
      console.log(`drop: ${value[0]}`);
      this.onDrop(value.slice(1));
    });
  }

  private onDrag(args) {
    let [e, el] = args;
    //this.removeClass(e, 'ex-moved');
  }

  private onDrop(args) {
    let [el, target, source, sibling] = args;
    // Get new index of question
    let moveToIndex = -1;
    if (sibling) {
      moveToIndex = Array.prototype.indexOf.call(target.children, sibling) - 1;
    }
    else {
      moveToIndex = target.children.length - 1;
    }

    // Send service call to save this change
    this.singleSessionService.setQuestionId(el.dataset.qid, moveToIndex, this.sessionId).then((resp) => {
      console.log(resp);
    }).catch((err) => {
      console.log('err', err);
    })
  }


  private mapSession(response) {
    this.session = response;
  }

  private mapCards(response) {
    let cards = Array.from(response.questions).map(card => new Card(card));
    this.response = new CardResponse(cards, response.next_page_token);
    this.cardService.cards = cards;
    let dragSrcEl = null;

    function handleDragStart(e) {
      // Target (this) element is the source node.
      dragSrcEl = this;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.outerHTML);

      this.classList.add('dragElem');
    }
    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      this.classList.add('over');

      e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

      return false;
    }

    function handleDragEnter(e) {
      // this / e.target is the current hover target.
    }

    function handleDragLeave(e) {
      this.classList.remove('over');  // this / e.target is previous target element.
    }

    function handleDrop(e) {
      // this/e.target is current target element.

      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }

      // Don't do anything if dropping the same column we're dragging.
      if (dragSrcEl !== this) {
        // Set the source column's HTML to the HTML of the column we dropped on.
        // alert(this.outerHTML);
        // dragSrcEl.innerHTML = this.innerHTML;
        // this.innerHTML = e.dataTransfer.getData('text/html');
        this.parentNode.removeChild(dragSrcEl);
        let dropHTML = e.dataTransfer.getData('text/html');
        this.insertAdjacentHTML('beforebegin', dropHTML);
        let dropElem = this.previousSibling;
        this.addDnDHandlers(dropElem);

      }
      this.classList.remove('over');
      return false;
    }

    function handleDragEnd(e) {
      // this/e.target is the source node.
      this.classList.remove('over');

      /*[].forEach.call(cols, function (col) {
        col.classList.remove('over');
      });*/
    }

    function addDnDHandlers(elem) {
      elem.addEventListener('dragstart', handleDragStart, false);
      elem.addEventListener('dragenter', handleDragEnter, false);
      elem.addEventListener('dragover', handleDragOver, false);
      elem.addEventListener('dragleave', handleDragLeave, false);
      elem.addEventListener('drop', handleDrop, false);
      elem.addEventListener('dragend', handleDragEnd, false);

    }

    let cols = document.querySelectorAll('.sortable_columns  .column');
    [].forEach.call(cols, addDnDHandlers);


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
    (<RatingCardComponent>componentRef.instance).session = this.session;
    jQuery('#rating-card-modal').openModal();
  }

  showShortAnswerCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(ShortAnswerCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<ShortAnswerCardComponent>componentRef.instance).editService = this.editService;
    (<ShortAnswerCardComponent>componentRef.instance).session = this.session;
    jQuery('#shortanswer-card-modal').openModal();
  }

  showMcqCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(McqCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<McqCardComponent>componentRef.instance).editService = this.editService;
    (<McqCardComponent>componentRef.instance).session = this.session;
    jQuery('#mcq-card-modal').openModal();
  }

  showYesNoCard() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(YesNoCardComponent);
    this.viewContainerRef.clear();
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<YesNoCardComponent>componentRef.instance).editService = this.editService;
    (<YesNoCardComponent>componentRef.instance).session = this.session;
    jQuery('#yesno-card-modal').openModal();
  }


  shorting(index) {

    let i = 1;

    jQuery('.session_listing').each(function (index, value) {
      jQuery(this).find('.index').text(i);
      i++;
    });
  }

  /*
    openCarouselModal(event) {
  
      let num = jQuery(event.target).attr('id');
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CarouselComponent);
      this.viewContainerRef.clear();
      let componentRef = this.viewContainerRef.createComponent(componentFactory);
      (<CarouselComponent>componentRef.instance).currentCard = Number(num);
      jQuery('#myModal').openModal();
  
    } */


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.editService.resetEdits();
  }
}


