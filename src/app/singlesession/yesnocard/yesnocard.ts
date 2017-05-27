import { CardService } from '../../services/card.service';
import { ConfigurationService } from '../../services/configuration.service';
import { EditService } from '../../services/edit.service';
import { SessionService } from '../../services/session.service';
import { Card } from '../../shared/models/card';
import { Session } from '../../shared/models/session';
import { Component, OnInit, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'yesnocard',
  templateUrl: './yesnocard.html',
  styles: ['./yesnocard.css'],
})
export class YesNoCardComponent implements OnInit, AfterViewInit, OnDestroy {
  isSurveyModeEnabled: boolean = true;
  uploadError: string;
  fileUploaded: boolean;
  filestaus: string;
  imgUploadingInProcess: boolean;
  videoUploadingInProcess: boolean;
  cardError: boolean;
  cardForm: FormGroup;
  updateQuestionFlag: boolean;
  updateQuestion: Card;
  saveCardErrorText: string;
  sessionId: string;
  session: Session;
  public rightFeedback;
  public wrongFeedback;
  private subscription: Subscription;
  public question;

  constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private cardService: CardService,
    private el: ElementRef,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {

    this.uploadError = '';
    this.fileUploaded = false;
    this.filestaus = '';
    this.imgUploadingInProcess = false;
    this.videoUploadingInProcess = false;
    this.cardError = false;
    this.updateQuestionFlag = false;
    this.saveCardErrorText = '';

    this.updateQuestion = this.editService.getCurrent();
    ga('set', 'userId', this.conf.getUser().userId);
    if (this.editService.isEditing()) {
      this.updateQuestionFlag = true;
      this.isSurveyModeEnabled = this.updateQuestion.question_scope === 'survey';
      this.setValidator();
      this.initQuestionData();
      if (this.updateQuestion.resource_type) {
        if (this.updateQuestion.resource_type === 'image' && this.updateQuestion.resource_url) {
          this.fileUploaded = true;
          this.filestaus = 'image';
          this.cardForm.controls['image_url'].setValue(this.updateQuestion.resource_url);

          //jQuery('.img-upload').addClass('fullWidth');
        } else if (this.updateQuestion.resource_type === 'video' && this.updateQuestion.resource_code) {
          this.fileUploaded = true;
          this.filestaus = 'video';
          let video_thumbnail_url = 'https://img.youtube.com/vi/' + this.updateQuestion.resource_code + '/0.jpg';
          this.cardForm.controls['video_url'].setValue(video_thumbnail_url);
          this.cardForm.controls['video_code'].setValue(this.updateQuestion.resource_code);
          //jQuery('.video-upload').addClass('fullWidth');
        }
      }
      ga('send', 'pageview', '/sessions/yesnocard/edit');
    } else {
      this.setValidator();
      ga('send', 'pageview', '/sessions/yesnocard/add');
    }
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.sessionId = params['id'];
    });
    jQuery('[data-toggle="tooltip"]').tooltip();
  }

  initQuestionData() {
    let question = this.updateQuestion;
    this.cardForm.controls['text_question'].setValue(question.description);
    if (!this.isSurveyModeEnabled) {
      this.cardForm.controls['rightFeedback'].setValue(question.correct_description);
      this.cardForm.controls['wrongFeedback'].setValue(question.incorrect_description);
      this.cardForm.controls['choice'].setValue(question.correct_answers[0]);
    }
  }

  uploadFile() {
    let _this = this;
    this.imgUploadingInProcess = true;
    let files = this.el.nativeElement.getElementsByClassName('file-upload')[0];
    let file = files.files[0];
    let objKey = 'public/' + this.conf.getUser().identityId + '/' + file.name;
    let bucketName = 'nimbldeckapp-userfiles-mobilehub-964664152'; // Enter your bucket name

    let params = {
      Key: objKey,
      ContentType: file.type,
      Body: file,
      Bucket: environment.imageUploadBucket
    };
  
    this.conf.getUploader().upload(params, function (err, data) {
      if (err) {
        console.log(err);
        _this.uploadError = 'Failed to upload file';
      } else {
        _this.fileUploaded = true;
        _this.imgUploadingInProcess = false;
        _this.cardForm.controls['image_url'].setValue(data.Location);

        this.filestaus = 'image';
        jQuery('.video-upload, .or_text').css('display', 'none');
        jQuery('.img-upload').addClass('fullWidth');

      }
    });
  }


  uploadVideo() {

    let files = jQuery('input.video-upload').val();
    let resource_code = files.replace('https://www.youtube.com/watch?v=', '');
    if(resource_code){
        let video_thumbnail_url = 'https://img.youtube.com/vi/' + resource_code + '/0.jpg';
        this.fileUploaded = true;
        this.imgUploadingInProcess = false;
        this.filestaus = '';
        this.cardForm.controls['video_url'].setValue(video_thumbnail_url);
        if (this.cardForm.controls['video_url'].value !== '') {
          jQuery('.img-upload, .or_text').css('display', 'none');
          jQuery('.video-upload').addClass('fullWidth');
        }

        this.cardForm.controls['video_code'].setValue(resource_code);
    }
  }


  removeImage() {
    this.cardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
    this.filestaus = '';

    jQuery('.video-upload, .or_text').css('display', 'block');
    jQuery('.img-upload').removeClass('fullWidth');

  }
  removeVideo() {
    this.cardForm.controls['video_url'].setValue(null);
    this.cardForm.controls['video_code'].setValue(null);
    this.fileUploaded = false;
    this.filestaus = '';
    jQuery('.img-upload, .or_text').css('display', 'block');
    jQuery('.video-upload').removeClass('fullWidth');
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

    if (!this.isSurveyModeEnabled && !this.cardForm.controls['choice'].value) {
      jQuery('#YesNoErrorMsg').css('display', 'block');
      return false;
    } else {
      jQuery('#YesNoErrorMsg').css('display', 'none');
    }

    let params: any = {};
    if (typeof this.cardForm.controls['video_code'].value != 'undefined' && this.cardForm.controls['video_code'].value) {
      console.log('video');
      params = {
        type: 'yes_no',
        description: this.cardForm.controls['text_question'].value,
        required: false,
        resource_url: this.cardForm.controls['video_url'].value,
        resource_type: 'video',
        resource_code: this.cardForm.controls['video_code'].value
      };

    } else if(typeof this.cardForm.controls['image_url'].value != 'undefined' && this.cardForm.controls['image_url'].value) {
      params = {
        type: 'yes_no',
        description: this.cardForm.controls['text_question'].value,
        required: false,
        resource_url: this.cardForm.controls['image_url'].value,
        resource_type: 'image'
      };
    } else {
      params = {
        type: 'yes_no',
        description: this.cardForm.controls['text_question'].value,
        required: false,
      };
    }
    if (!this.isSurveyModeEnabled) {
      // For test mode push correct option and
      // right/wrong optional text
      params.incorrect_description = this.cardForm.controls['wrongFeedback'].value;
      params.correct_description = this.cardForm.controls['rightFeedback'].value;
      params.correct_answers = [];
      params.correct_answers.push(this.cardForm.controls['choice'].value);
    }
    params.question_scope = this.isSurveyModeEnabled ? 'survey' : 'test';

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
      mixpanel.track('CreateYesNoCard', { 'user': this.conf.getUser().emailId });
    } else {
      mixpanel.time_event('EditYesNoCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this._questionUpdated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('EditYesNoCard', { 'user': this.conf.getUser().emailId });
    }

  }

  _questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('CreateYesNoCardFailed');
      mixpanel.track('CreateYesNoCardFailed', { 'error': this.saveCardErrorText });
      return;
    }
    this.cardService.cards.push(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#yesno-card-modal').closeModal();
    mixpanel.people.increment('Cards');
    mixpanel.people.increment('YesNoCards');

  }

  _questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditYesNoCardFailed');
      mixpanel.track('EditYesNoCardFailed', { 'error': this.saveCardErrorText });
      return;
    }
    this.cardService.updateCardAfterEdit(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#yesno-card-modal').closeModal();

  }

  showQuestionTextError(): boolean {
    return this.cardForm.controls['text_question'].valid || this.cardForm.controls['text_question'].pristine;
  }

  ngAfterViewInit() {
    Materialize.updateTextFields();
  }


  ngOnDestroy() {
  }

  setValidator() {
    if (this.cardForm) {
      let question = this.cardForm.controls['text_question'].value;
      let imageUrl = this.cardForm.controls['image_url'].value;
      let videoUrl = this.cardForm.controls['video_url'].value;
      let youtubeUrl = this.cardForm.controls['youtube_url'].value;
      let videoCode = this.cardForm.controls['video_code'].value;
      let rightFeedback = this.cardForm.controls['rightFeedback'].value;
      let wrongFeedback = this.cardForm.controls['wrongFeedback'].value;
      let correct = '';
      if(this.cardForm.controls['choice']){
        correct = this.cardForm.controls['choice'].value;
      } else {
        this.cardForm.addControl('choice', new FormControl('', Validators.required));
      }
  

      if (imageUrl) {
        this.fileUploaded = true;
        this.filestaus = 'image';
      }

      if (videoUrl) {
        this.fileUploaded = true;
        this.filestaus = 'video';
      }
      if (this.isSurveyModeEnabled) {
        // Survey type form validator
        setTimeout(() => {
          this.cardForm = new FormGroup({
            text_question: new FormControl(question, Validators.required),
            image_url: new FormControl(imageUrl),
            video_url: new FormControl(videoUrl),
            youtube_url: new FormControl(youtubeUrl),
            video_code: new FormControl(videoCode),
            rightFeedback: new FormControl(rightFeedback),
            wrongFeedback: new FormControl(wrongFeedback),
            choice: new FormControl(correct)
          });
        })
      } else {
        // Test type form validator
        setTimeout(() => {
          this.cardForm = new FormGroup({
            text_question: new FormControl(question, Validators.required),
            choice: new FormControl(correct, Validators.required),
            image_url: new FormControl(imageUrl),
            video_url: new FormControl(videoUrl),
            youtube_url: new FormControl(youtubeUrl),
            video_code: new FormControl(videoCode),
            rightFeedback: new FormControl(rightFeedback),
            wrongFeedback: new FormControl(wrongFeedback),
          });
        })
      }
    } else {
      if (this.isSurveyModeEnabled) {
        // Survey type form validator
        this.cardForm = new FormGroup({
          text_question: new FormControl('', Validators.required),
          image_url: new FormControl(''),
          video_url: new FormControl(''),
          youtube_url: new FormControl(''),
          video_code: new FormControl(''),
          rightFeedback: new FormControl(''),
          wrongFeedback: new FormControl('')
        });
      } else {
        // Test type form validator
        this.cardForm = new FormGroup({
          text_question: new FormControl('', Validators.required),
          choice: new FormControl('', Validators.required),
          image_url: new FormControl(''),
          video_url: new FormControl(''),
          youtube_url: new FormControl(''),
          video_code: new FormControl(''),
          rightFeedback: new FormControl(''),
          wrongFeedback: new FormControl('')
        });
      }
    }
  }

  toggle_modal_layout(event) {
    this.isSurveyModeEnabled = !this.isSurveyModeEnabled;
    // Reset to initial state
    this.setValidator();
    jQuery('#blk-' + event).show();
  }
}
