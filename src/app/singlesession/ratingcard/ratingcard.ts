import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'ratingcard',
  templateUrl: './ratingcard.html',
  styles: ['./ratingcard.css'],
})
export class RatingCardComponent  implements OnInit, AfterViewInit, OnDestroy {

  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
  saveCardErrorText: string;
  sessionId: string;
  private subscription: Subscription;

  constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private cardService: CardService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {

      this.uploadError = '';
      this.fileUploaded = false;
      this.imgUploadingInProcess = false;
      this.cardError = false;
      this.updateQuestionFlag = false;
      this.saveCardErrorText = '';

      this.updateQuestion = this.editService.getCurrent();
      ga('set', 'userId', this.conf.getUser().userId);
      if (editService.isEditing()) {
         this.updateQuestionFlag = true;
         this.cardForm = formBuilder.group({
          text_question: [this.updateQuestion.description, Validators.required],
          image_url: [this.updateQuestion.resource_url]
      });

      if (this.updateQuestion.resource_url) {
        this.fileUploaded = true;
      }
        ga('send', 'pageview', '/sessions/ratingcard/edit');
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: ['']
      });
      ga('send', 'pageview', '/sessions/ratingcard/add');
    }
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
    });
  }
  submitRatingCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }
    let params = {
      type: 'rating',
      description: this.cardForm.controls['text_question'].value,
      required: false,
      resource_url: this.cardForm.controls['image_url'].value,
      resource_type: 'image'

    };
    if (this.updateQuestionFlag === false) {
      mixpanel.time_event('CreateRatingCard');
      params['position'] = 1;
      if (this.cardService.cards.length > 0) {
        params['position'] = Math.max.apply(null, this.cardService.cards.map(card => card.position)) + 1;
      }
      let observable = this.cardService.addQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this.questionCreated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('CreateRatingCard', {'user': this.conf.getUser().emailId});
    } else {
      mixpanel.time_event('EditRatingCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.questionUpdated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('EditRatingCard', {'user': this.conf.getUser().emailId});
    }


  }

  questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('CreateRatingCardFailed');
      mixpanel.track('CreateRatingCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
     this.cardService.cards.push(new Card(resp.question));
     jQuery(this.el.nativeElement).find('#rating-card-modal').closeModal();
     mixpanel.people.increment('Cards');
     mixpanel.people.increment('RatingCards');
  }

  questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditRatingCardFailed');
      mixpanel.track('EditRatingCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
     this.cardService.updateCardAfterEdit(new Card(resp.question));
     jQuery(this.el.nativeElement).find('#rating-card-modal').closeModal();

  }


  ngAfterViewInit() {
    Materialize.updateTextFields();

    let cardRating = this.el.nativeElement.getElementsByClassName('card-rating');
    jQuery(cardRating[0]).rateYo({
      starWidth: '40px',
      readOnly: true
    });

  }

  ngOnDestroy() {
    // this._editService.resetEdits();
  }

}
