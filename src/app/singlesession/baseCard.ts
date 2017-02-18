import { CardService } from '../services/card.service';
import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Card } from '../shared/models/card';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var jQuery: any;


export abstract class BaseCard implements AfterViewInit {

  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
  saveCardErrorText: string;

  constructor(public editService: EditService,
    protected conf: ConfigurationService,
    protected sessionService: SessionService,
    protected cardService: CardService,
    protected el: ElementRef,
    protected formBuilder: FormBuilder) {

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
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: ['']
      });
    }
    this.buildForm(editService, formBuilder);
  }

  protected buildForm(editService: EditService, formBuilder: FormBuilder) {

  }

  submitTextCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }
    let params = {
      type: 'long_text',
      description: this.cardForm.controls['text_question'].value,
      required: false,
      resource_url: this.cardForm.controls['image_url'].value,
      resource_type: 'image'
    };

    if (this.updateQuestionFlag === false) {
      params['position'] = Math.max.apply(this.cardService.cards.map(card => card.position));
      let observable = this.cardService.addQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.cardCreated(resp)),
        (error => this.cardError = true)
      );
    } else {
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.cardUpdated(resp)),
        (error => this.cardError = true)
      );
    }
  }

  protected onCardServiceSuccess(serviceResponse) {

  }

  private cardCreated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      return;
    }
    this.cardService.cards.push(resp.question);
    this.onCardServiceSuccess(resp);
  }


   protected updateCardAfterEdit(card: Card) {
    for (let i = 0; i < this.cardService.cards.length; i++) {
      if (this.cardService.cards[i].question_id === card.question_id) {
        this.cardService.cards[i] = card;
        break;
      }
    }

  }

  private cardUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      return;
    }
    this.updateCardAfterEdit(resp.question);
    this.onCardServiceSuccess(resp);

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

  ngAfterViewInit() {
    Materialize.updateTextFields();
  }

}
