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
  selector: 'textcard',
  templateUrl: './textcard.component.html',
  styleUrls: ['./textcard.component.css']
})
export class TextcardComponent implements OnInit, AfterViewInit, OnDestroy {

  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  textCardError: boolean;
  textCardForm: FormGroup;
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
      this.textCardError = false;
      this.updateQuestionFlag = false;
      this.saveCardErrorText = '';

      this.updateQuestion = this.editService.getCurrent();
      ga('set', 'userId', this.conf.getUser().userId);
      if (editService.isEditing()) {
         this.updateQuestionFlag = true;
         this.textCardForm = formBuilder.group({
          text_question: [this.updateQuestion.description, Validators.required],
          image_url: [this.updateQuestion.resource_url]
      });

      if (this.updateQuestion.resource_url) {
        this.fileUploaded = true;
      }
        ga('send', 'pageview', '/sessions/textcard/edit');
    } else {
      this.textCardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: ['']
      });
      ga('send', 'pageview', '/sessions/textcard/add');
    }
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
    });
  }

  submitTextCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.textCardError = false;
    if (!this.textCardForm.valid) {
      return false;
    }
    let params = {
      type: 'long_text',
      description: this.textCardForm.controls['text_question'].value,
      required: false,
      resource_url: this.textCardForm.controls['image_url'].value,
      resource_type: 'image'
    };

    if (this.updateQuestionFlag === false) {
      mixpanel.time_event('CreateTextCard');
      params['position'] = 1;
      if (this.cardService.cards.length > 0) {
        params['position'] = Math.max.apply(null, this.cardService.cards.map(card => card.position)) + 1;
      }
      let observable = this.cardService.addQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this._questionCreated(resp)),
        (error => this.textCardError = true)
      );
      mixpanel.track('CreateTextCard', {'user': this.conf.getUser().emailId});
    } else {
      mixpanel.time_event('EditTextCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this._questionUpdated(resp)),
        (error => this.textCardError = true)
      );
      mixpanel.track('EditTextCard', {'user': this.conf.getUser().emailId});
    }


  }

  _questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.textCardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('CreateTextCardFailed');
      mixpanel.track('CreateTextCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.cardService.cards.push(new Card(resp.question));
    (<any>jQuery(this.el.nativeElement).find('#text-card-modal')).closeModal();
    mixpanel.people.increment('Cards');
    mixpanel.people.increment('TextCards');
  }

  _questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.textCardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditTextCardFailed');
      mixpanel.track('EditTextCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.cardService.updateCardAfterEdit(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#text-card-modal').closeModal();

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
        _this.textCardForm.controls['image_url'].setValue(data.Location);
      }
    });
  }

  removeImage() {
    this.textCardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
  }

  ngAfterViewInit() {
    Materialize.updateTextFields();
  }

   ngOnDestroy() {
   // this.editService.resetEdits();
  }

}