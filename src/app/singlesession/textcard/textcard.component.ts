import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';

import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';


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
  filestaus: string;
  imgUploadingInProcess: boolean;
  textCardError: boolean;
  textCardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
  saveCardErrorText: string;
  sessionId: string;
  private fileReader: FileReader;
  private subscription: Subscription;

  constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private cardService: CardService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
      this.fileReader = new FileReader();
      this.uploadError = '';
      this.fileUploaded = false;
      this.filestaus='';
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
          image_url: [''],
          video_url: [''],
          youtube_url: [''],
          video_code: ['']
      });

       if (this.updateQuestion.resource_type) {
            if (this.updateQuestion.resource_type === 'image' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus='image';
                this.textCardForm.controls['image_url'].setValue(this.updateQuestion.resource_url);

                jQuery('.img-upload').addClass('fullWidth');

            } else  if (this.updateQuestion.resource_type === 'video' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus='video';
                let video_thumbnail_url = 'https://img.youtube.com/vi/' + this.updateQuestion.resource_code + '/0.jpg';
                this.textCardForm.controls['video_url'].setValue(video_thumbnail_url);
                this.textCardForm.controls['video_code'].setValue(this.updateQuestion.resource_code);

                jQuery('.video-upload').addClass('fullWidth');
            }
      }
      ga('send', 'pageview', '/sessions/textcard/edit');
    } else {
      this.textCardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: [''],
        video_url: [''],
        youtube_url: [''],
        video_code: ['']
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
    let params;
    if(jQuery('.video-upload').hasClass("fullWidth")){ 
      params = {
          type: 'long_text',
          description: this.textCardForm.controls['text_question'].value,
          required: false,
          resource_url:  this.textCardForm.controls['youtube_url'].value,
          resource_type: 'video',
          resource_code: this.textCardForm.controls['video_code'].value
        };

    }else {
         params = {
          type: 'long_text',
          description: this.textCardForm.controls['text_question'].value,
          required: false,
          resource_url: this.textCardForm.controls['image_url'].value,
          resource_type: 'image'


        };
    }

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
        this.filestaus='';
        _this.imgUploadingInProcess = false;
        _this.textCardForm.controls['image_url'].setValue(data.Location);
        
        jQuery('.video-upload, .or_text').css('display','none');
        jQuery('.img-upload').addClass('fullWidth');
      }
    });
  }

  videoAPICall(video, file){
    window.URL.revokeObjectURL(video.src)
    if(video.duration < 300) {
    this.conf.getVideoUploadPolicy(file.name).map(rawResponse => rawResponse.json()).subscribe(params => {
        this.imgUploadingInProcess = true;
        let data = new FormData();
        data.append('key' , params['key']);
        data.append('x-amz-credential' , params['x-amz-credential']);
        data.append('x-amz-algorithm' , params['x-amz-algorithm']);
        data.append('x-amz-date' , params['x-amz-date']);
        data.append('x-amz-signature' , params['x-amz-signature']);
        data.append('policy' , params['policy']);
        data.append('success_action_status' , '201');
        data.append('success_action_redirect' , "");
        data.append('file' , file);
        
        let parameters = params;
        this.conf.uploadVideo(params['upload_link_secure'],data).subscribe(par => {
          this.onVideoUploadSuccess(params['video_id']);
        });
    }, error => console.log(error), () => this.imgUploadingInProcess = false);
    } else {
      this.saveCardErrorText = 'Video too long. It should be less than 5 minutes long ';
    }
  }

  onVideoUploadSuccess(videoId: string){

   /* this.conf.getVideo(videoId).map(rawResponse => rawResponse.json()).subscribe( params => {
       this.textCardForm.controls['video_url'].setValue(params['posters'][0]['posterUrl']);
       if(this.textCardForm.controls['video_url'].value!=''){
         jQuery('.img-upload, .or_text').css('display','none');
         jQuery('.video-upload').addClass('fullWidth');
      } 
    },
    error => console.log(error), () => this.imgUploadingInProcess = false);*/
    
    
    

  }


  uploadVideo(event) {
      let uploadedFile: File  = event.dataTransfer ? event.dataTransfer.files[0] : event.target.files[0];
      let video = document.createElement('video');
      video.src = URL.createObjectURL(uploadedFile);
      video.preload = 'metadata';
      let self = this;
      video.onloadedmetadata = function() {
      self.videoAPICall(video, uploadedFile);
      }
      video.src = URL.createObjectURL(uploadedFile);

}

onVideoUploadError( videoId, error){
    console.log('error' +error);
    this.conf.deleteVideo(videoId).subscribe(response => console.log(response));
}

  removeImage() {
    this.textCardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
    this.filestaus='';
    jQuery('.video-upload, .or_text').css('display','block');
    jQuery('.img-upload').removeClass('fullWidth');
  }

  removeVideo() {
    this.textCardForm.controls['video_url'].setValue(null);
    this.textCardForm.controls['youtube_url'].setValue(null);
    this.textCardForm.controls['video_url'].setValue(null);
    this.textCardForm.controls['video_code'].setValue(null);
    this.fileUploaded = false;
    this.filestaus='';
    jQuery('.img-upload, .or_text').css('display','block');
    jQuery('.video-upload').removeClass('fullWidth');
  }


  ngAfterViewInit() {
    Materialize.updateTextFields();
  }

   ngOnDestroy() {
   // this.editService.resetEdits();
  }

}