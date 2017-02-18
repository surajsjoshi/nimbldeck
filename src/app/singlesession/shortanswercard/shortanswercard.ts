import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'shortanswercard',
  template: require('./shortanswercard.html'),
  styles: [require('./shortanswercard.css')],
})
export class ShortAnswerCardComponent implements OnInit, AfterViewInit, OnDestroy {

  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
  saveCardErrorText: string;

    constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private cardService: CardService,
    private el: ElementRef,
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
        ga('send', 'pageview', '/sessions/shortanswercard/edit');
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: ['']
      });
      ga('send', 'pageview', '/sessions/shortanswercard/add');
    }
  }

  ngOnInit() {

  }


 uploadFile() {
    let _this = this;
    this.imgUploadingInProcess = true;
    let files = this.el.nativeElement.getElementsByClassName('file-upload')[0];
    let file = files.files[0];
    let objKey = 'public/' + this.conf.getUser().identityId + '/' + file.name;
    let params = {
      Key: objKey,
      ContentType: file.type,
      Body: file
    };
    let bucketName = 'nimbldeckapp-userfiles-mobilehub-964664152'; // Enter your bucket name
    let bucket = new AWS.S3({
      params: {
        Bucket: bucketName
      }
    });


    bucket.upload(params, function (err, data) {
      if (err) {
        _this.uploadError = 'Failed to upload file';
      } else {
        _this.fileUploaded = true;
        _this.imgUploadingInProcess = false;
         this.textCardForm.controls['image_url'].setValue(data.Location);
      }
    });
  }

  removeImage() {
    this.cardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
  }


  submitShortAnswerCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';

    // let sessionQuestionCount = this._singleSessionService.sessionQuestions.length;
    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }
    let params = {
      type: 'short_text',
      description: this.cardForm.controls['text_question'].value,
      required: false,
      resource_url: this.cardForm.controls['image_url'].value,
      resource_type: 'image'
    };
    if (this.updateQuestionFlag === false) {
      mixpanel.time_event('CreateShortAnswerCard');
      params['position'] = Math.max.apply(this.cardService.cards.map(card => card.position));
      let observable = this.cardService.addQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.questionCreated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('CreateShortAnswerCard', {'user': this.conf.getUser().emailId});
    } else {
      mixpanel.time_event('EditShortAnswerCard');
      params['question_id'] = this.updateQuestion.question_id;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.questionUpdated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('EditShortAnswerCard', {'user': this.conf.getUser().emailId});
    }
  }

  questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('CreateShortAnswerCardFailed');
      mixpanel.track('CreateShortAnswerCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.cardService.cards.push(resp.question);
    jQuery(this.el.nativeElement).find('#shortanswer-card-modal').closeModal();
    mixpanel.people.increment('Cards');
     mixpanel.people.increment('ShortAnswerCards');
  }




   private updateCardAfterEdit(card: Card) {
    for (let i = 0; i < this.cardService.cards.length; i++) {
      if (this.cardService.cards[i].question_id === card.question_id) {
        this.cardService.cards[i] = card;
        break;
      }
    }

  }

   questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditTextCardFailed');
      mixpanel.track('EditTextCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.updateCardAfterEdit(resp.question);
    (<any>jQuery(this.el.nativeElement).find('#shortanswer-card-modal')).closeModal();

  }


  ngAfterViewInit() {
    Materialize.updateTextFields();
  }

  ngOnDestroy() {

  }
}
