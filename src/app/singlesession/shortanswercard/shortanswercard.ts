import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';
import { Session } from '../../shared/models/session';
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
  selector: 'shortanswercard',
  templateUrl: './shortanswercard.html',
  styles: ['./shortanswercard.css'],
})
export class ShortAnswerCardComponent implements OnInit, AfterViewInit, OnDestroy {

  uploadError: string;
  fileUploaded: boolean;
  filestaus: string;
  imgUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
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
      this.filestaus='';
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
          image_url: [''],
          video_url: [''],
          youtube_url: [''],
          video_code: ['']
      });

       if (this.updateQuestion.resource_type) {
            if (this.updateQuestion.resource_type === 'image' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus='image';
                this.cardForm.controls['image_url'].setValue(this.updateQuestion.resource_url);
            } else  if (this.updateQuestion.resource_type === 'video' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus='video';
                let video_thumbnail_url = 'https://img.youtube.com/vi/' + this.updateQuestion.resource_code + '/0.jpg';
                this.cardForm.controls['video_url'].setValue(video_thumbnail_url);
                this.cardForm.controls['video_code'].setValue(this.updateQuestion.resource_code);
            }
      }
        ga('send', 'pageview', '/sessions/shortanswercard/edit');
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: [''],
        video_url: [''],
        youtube_url: [''],
        video_code: ['']
      });
      ga('send', 'pageview', '/sessions/shortanswercard/add');
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
        this.filestaus='';
        _this.imgUploadingInProcess = false;
        _this.cardForm.controls['image_url'].setValue(data.Location);

        jQuery('.video-upload, .or_text').css('display','none');
        jQuery('.img-upload').addClass('fullWidth');
      }
    });
  }


    uploadVideo(){

    let files = jQuery('input.video-upload').val();
    let resource_code = files.replace("https://www.youtube.com/watch?v=","");
    let video_thumbnail_url="https://img.youtube.com/vi/"+resource_code+"/0.jpg";
    this.fileUploaded = true;
    this.filestaus='';
    this.imgUploadingInProcess = false;
    this.cardForm.controls['video_url'].setValue(video_thumbnail_url);

    if(this.cardForm.controls['video_url'].value!=''){
      jQuery('.img-upload, .or_text').css('display','none');
      jQuery('.video-upload').addClass('fullWidth');
    }    
    this.cardForm.controls['video_code'].setValue(resource_code);
}


   removeImage() {
    this.cardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
    this.filestaus='';
    jQuery('.video-upload, .or_text').css('display','block');
    jQuery('.img-upload').removeClass('fullWidth');
  }

  removeVideo() {
    this.cardForm.controls['video_url'].setValue(null);
    this.cardForm.controls['youtube_url'].setValue(null);
    this.cardForm.controls['video_url'].setValue(null);
    this.cardForm.controls['video_code'].setValue(null);
    this.fileUploaded = false;
    this.filestaus='';
    jQuery('.img-upload, .or_text').css('display','block');
    jQuery('.video-upload').removeClass('fullWidth');
  }


  submitShortAnswerCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';

    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }


    let params;
    if(jQuery('.video-upload').hasClass("fullWidth")){ 
      params = {
          type: 'short_text',
          description: this.cardForm.controls['text_question'].value,
          required: false,
          resource_url:  this.cardForm.controls['youtube_url'].value,
          resource_type: 'video',
          resource_code: this.cardForm.controls['video_code'].value
        };

    } else {
         params = {
          type: 'short_text',
          description: this.cardForm.controls['text_question'].value,
          required: false,
          resource_url: this.cardForm.controls['image_url'].value,
          resource_type: 'image'


        };
    }

    if (this.updateQuestionFlag === false) {
      params['position'] = 1;
      if (this.cardService.cards.length > 0) {
        params['position'] = Math.max.apply(null, this.cardService.cards.map(card => card.position)) + 1;
      }
      mixpanel.time_event('CreateShortAnswerCard');
      let observable = this.cardService.addQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this.questionCreated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('CreateShortAnswerCard', {'user': this.conf.getUser().emailId});
    } else {
      mixpanel.time_event('EditShortAnswerCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
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
    this.cardService.cards.push(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#shortanswer-card-modal').closeModal();
    mixpanel.people.increment('Cards');
     mixpanel.people.increment('ShortAnswerCards');
  }


   questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditTextCardFailed');
      mixpanel.track('EditTextCardFailed', {'error' : this.saveCardErrorText});
      return;
    }
    this.cardService.updateCardAfterEdit(new Card(resp.question));
    (<any>jQuery(this.el.nativeElement).find('#shortanswer-card-modal')).closeModal();

  }


  ngAfterViewInit() {
    Materialize.updateTextFields();
  }

  ngOnDestroy() {

  }
}