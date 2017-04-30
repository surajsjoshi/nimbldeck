import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Session } from '../../shared/models/session';
import { environment } from '../../../environments/environment';

declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'yesnocard',
  templateUrl: './yesnocard.html',
  styles: ['./yesnocard.css'],
})
export class YesNoCardComponent  implements OnInit, AfterViewInit, OnDestroy {

  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  card: Card;
  saveCardErrorText: string;
  sessionId: string;
  session: Session;
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

      this.card = this.editService.getCurrent();
      ga('set', 'userId', this.conf.getUser().userId);
      if (this.editService.isEditing()) {
         this.updateQuestionFlag = true;
         this.cardForm = formBuilder.group({
          text_question: [this.card.description, Validators.required],
          image_url: [this.card.resource_url]
      });

      if (this.card.resource_url) {
        this.fileUploaded = true;
      }
        ga('send', 'pageview', '/sessions/yesnocard/edit');
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: ['']
      });
      ga('send', 'pageview', '/sessions/yesnocard/add');
    }
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
    });
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
         _this.cardForm.controls['image_url'].setValue(data.Location);
      }
    });
  }

  removeImage() {
    this.cardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
  }


  submitYesNoCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';

    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }
    let params = {
      type: 'yes_no',
      description: this.cardForm.controls['text_question'].value,
      required: false,
      resource_url: this.cardForm.controls['image_url'].value,
      resource_type: 'image'

    };
    if (this.updateQuestionFlag === false) {
      mixpanel.time_event('CreateYesNoCard');
      params['position'] = 1;
      if (this.cardService.cards.length > 0) {
        params['position'] = Math.max.apply(null, this.cardService.cards.map(card => card.position)) + 1;
      }
      let observable = this.cardService.addQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this._questionCreated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('CreateYesNoCard', {'user': this.conf.getUser().emailId});
    } else {

     if(this.cardService.confirmationRequiredForUpdate(this.session, this.card)){
          if(confirm(environment.updateCardWarning)){
              this.updateQuestion(params);
           } else {
              jQuery(this.el.nativeElement).find('#yesno-card-modal').closeModal();
           }
       } else {
            this.updateQuestion(params);
       }
    }

  }

  updateQuestion(params: any) {
     mixpanel.time_event('EditYesNoCard');
     params['question_id'] = this.card.question_id;
     params['position'] = this.card.position;
     let observable = this.cardService.updateQuestion(params, this.card.session_id);
     observable.subscribe((resp => this.questionUpdated(resp)),
                (error => this.cardError = true));
     mixpanel.track('EditYesNoCard', {'user': this.conf.getUser().emailId});
  }


  _questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('CreateYesNoCardFailed');
      mixpanel.track('CreateYesNoCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
     this.cardService.cards.push(new Card(resp.question));
     jQuery(this.el.nativeElement).find('#yesno-card-modal').closeModal();
     mixpanel.people.increment('Cards');
     mixpanel.people.increment('YesNoCards');

  }


  questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditYesNoCardFailed');
      mixpanel.track('EditYesNoCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.cardService.updateCardAfterEdit(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#yesno-card-modal').closeModal();

  }

  ngAfterViewInit() {
    Materialize.updateTextFields();
  }


  ngOnDestroy() {
  }
}
