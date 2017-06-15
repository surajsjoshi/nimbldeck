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

declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'mcqcard',
  templateUrl: './mcqcard.html',
  styles: ['./mcqcard.css'],
})
export class McqCardComponent implements OnInit, AfterViewInit, OnDestroy {
  isSurveyModeEnabled: boolean = true;
  options: any = new Array();
  optionUploadError: string;
  optionFileUploaded: boolean;
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
  choiceError: string;
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
    this.filestaus = '';
    this.imgUploadingInProcess = false;
    this.cardError = false;
    this.updateQuestionFlag = false;
    this.saveCardErrorText = '';
    this.optionFileUploaded = false;
    this.optionUploadError = '';
    this.choiceError = '';
    this.updateQuestion = this.editService.getCurrent();
    ga('set', 'userId', this.conf.getUser().userId);
    if (editService.isEditing()) {
      this.updateQuestionFlag = true;
      this.options = this.updateQuestion.choices;
      this.isSurveyModeEnabled = this.updateQuestion.question_scope === 'survey';
      this.setValidator();
      this.initQuestionData();
      if (this.updateQuestion.resource_type) {
        if (this.updateQuestion.resource_type === 'image' && this.updateQuestion.resource_url) {
          this.fileUploaded = true;
          this.filestaus = 'image';
          this.cardForm.controls['image_url'].setValue(this.updateQuestion.resource_url);
        } else if (this.updateQuestion.resource_type === 'video' && this.updateQuestion.resource_url) {
          this.fileUploaded = true;
          this.filestaus = 'video';
          let video_thumbnail_url = 'https://img.youtube.com/vi/' + this.updateQuestion.resource_code + '/0.jpg';
          this.cardForm.controls['video_url'].setValue(video_thumbnail_url);
          this.cardForm.controls['video_code'].setValue(this.updateQuestion.resource_code);
        }
      }
      ga('send', 'pageview', '/sessions/mcqcard/edit');
    } else {
      this.setValidator();
      ga('send', 'pageview', '/sessions/mcqcard/add');
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
      this.cardForm.controls['right_feed'].setValue(question.correct_description);
      this.cardForm.controls['wrong_feed'].setValue(question.incorrect_description);

      if (question.correct_answers) {
        for (let opt of question.correct_answers) {
          // Map this in options
          for (let option of this.options) {
            if (opt === option.label) {
              option.checkStatus = 'checked';
            }
          }
        }
      }
    }
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
      Body: file,
      Bucket: environment.imageUploadBucket
    };
    this.conf.getUploader().upload(params, function (err, data) {
      if (err) {
        _this.uploadError = 'Failed to upload file';
      } else {
        _this.fileUploaded = true;
        this.filestaus = '';
        _this.imgUploadingInProcess = false;
        _this.cardForm.controls['image_url'].setValue(data.Location);


        jQuery('.video-upload, .or_text').css('display', 'none');
        jQuery('.img-upload').addClass('fullWidth');
      }
    });
  }




  uploadVideo() {
    let files = jQuery('input.video-upload').val();
    let resource_code = files.replace('https://www.youtube.com/watch?v=', '');
    let video_thumbnail_url = 'https://img.youtube.com/vi/' + resource_code + '/0.jpg';
    this.fileUploaded = true;
    this.filestaus = '';
    this.imgUploadingInProcess = false;
    this.cardForm.controls['video_url'].setValue(video_thumbnail_url);

    if (this.cardForm.controls['video_url'].value !== '') {
      jQuery('.img-upload, .or_text').css('display', 'none');
      jQuery('.video-upload').addClass('fullWidth');
    }

    this.cardForm.controls['video_code'].setValue(resource_code);
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
    this.cardForm.controls['youtube_url'].setValue(null);
    this.cardForm.controls['video_code'].setValue(null);

    this.fileUploaded = false;
    this.filestaus = '';
    jQuery('.img-upload, .or_text').css('display', 'block');
    jQuery('.video-upload').removeClass('fullWidth');

  }


  submitMcqCard(event) {
    event.preventDefault();

    let option_index = this.options.length;

    // If it is test mode, check that atleast one checkbox is checked
    if (!this.isSurveyModeEnabled) {
      let flag = false;

      for (var i = 0; i < option_index; i++) {
        let check = jQuery('#isTosRead' + i).is(":checked");
        if (check === true) {
          flag = true;
          break;
        }
        else {
          flag = false;
        }
      }


      if (flag === false) {
        let check_main = jQuery('#isTosRead').is(":checked");
        if (check_main === true) {
          flag = true;
        }

      }

      if (!flag) {
        this.choiceError = 'Please select atleast one correct answer';
        //jQuery('#error_check').html('Please select atleast one correct answer').css('color', 'red');
        //alert('atleast one checkbox should be checked'); 
        return;
      }
    }


    if (!this.cardForm.valid) {
      return false;
    }
    let optionsCount = this.options.length;
    let option = this.cardForm.controls['mcqoption'].value;
    let istosRead = this.cardForm.controls['isTosRead'].value;

    // Check that none of the options are empty
    for (let opt of this.options) {
      if (!opt.label) {
        this.choiceError = 'Option cannot be the correct answer';
       // jQuery('#error_check').html('Option cannot be the correct answer').css('color', 'red');
        return;
      }
    }

    // Check that last option row is selected only if it has a label
    if (istosRead && (!option || option === '')) {
      this.choiceError = 'Option cannot be empty';
     // jQuery('#error_check').html('Option cannot be empty').css('color', 'red');
      return;
    }

    // All good, save it
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.cardError = false;

    // Push the last option row in options as well
    // and make it blank for next
    if ((optionsCount < 4) && option) {
      let choices = {};
      choices['label'] = option;
      choices['name'] = 'choices';
      choices['checkStatus'] = istosRead ? 'checked' : '';
      this.options.push(choices);
      this.cardForm.controls['mcqoption'].setValue(null);
      this.cardForm.controls['isTosRead'].setValue(null);
    }

    let params;
    if (typeof this.cardForm.controls['video_code'].value != 'undefined' && this.cardForm.controls['video_code'].value) {
      params = {
        type: 'multiple_choice',
        description: this.cardForm.controls['text_question'].value,
        required: false,
        resource_url: this.cardForm.controls['video_url'].value,
        resource_type: 'video',
        resource_code: this.cardForm.controls['video_code'].value
      };

    } else if(typeof this.cardForm.controls['image_url'].value != 'undefined' && this.cardForm.controls['image_url'].value){
      params = {
        type: 'multiple_choice',
        description: this.cardForm.controls['text_question'].value,
        required: false,
        resource_url: this.cardForm.controls['image_url'].value,
        resource_type: 'image'
      };
    } else {
      params = {
        type: 'multiple_choice',
        description: this.cardForm.controls['text_question'].value,
        required: false
      };
    }

    params.choices = this.options;
    if (!this.isSurveyModeEnabled) {
      params.correct_answers = [];
      for (let option of this.options) {
        if (option.checkStatus === 'checked') {
          params.correct_answers.push(option.label);
        }
      }
    }

    if (!this.isSurveyModeEnabled) {
      // For test mode push correct option and
      // right/wrong optional text
      params.incorrect_description = this.cardForm.controls['wrong_feed'].value;
      params.correct_description = this.cardForm.controls['right_feed'].value;
    }
    params.question_scope = this.isSurveyModeEnabled ? 'survey' : 'test';

    if (this.updateQuestionFlag === false) {
      mixpanel.time_event('CreateMCQCard');
      params['position'] = 1;
      console.log(this.cardService.cards);
      if (this.cardService.cards.length > 0) {
        params['position'] = Math.max.apply(null, this.cardService.cards.map(card => card.position)) + 1;
      }
      let observable = this.cardService.addQuestion(params, this.sessionId);
      observable.subscribe(
        (resp => this.questionCreated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('CreateMCQCard', { 'user': this.conf.getUser().emailId });
    } else {
      mixpanel.time_event('EditMCQCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.questionUpdated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('EditMCQCard', { 'user': this.conf.getUser().emailId });
    }

  }

  questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.saveCardErrorText = resp.errors[0].message;
      this.cardError = true;
      mixpanel.people.increment('CreateMCQCardFailed');
      mixpanel.track('CreateMCQCardFailed', { 'error': this.saveCardErrorText });
      return;
    }
    this.cardService.cards.push(new Card(resp.question));
    mixpanel.people.increment('Cards');
    mixpanel.people.increment('MCQCards');
    jQuery(this.el.nativeElement).find('#mcq-card-modal').closeModal();
  }

  questionUpdated(resp) {
    if (resp.type === 'Failure') {
      this.cardError = true;
      this.saveCardErrorText = resp.errors[0].message;
      mixpanel.people.increment('EditMCQCardFailed');
      mixpanel.track('EditMCQCardFailed', { 'error': this.saveCardErrorText });
      return;
    }
    this.cardService.updateCardAfterEdit(new Card(resp.question));
    jQuery(this.el.nativeElement).find('#mcq-card-modal').closeModal();

  }


  addToOptions() {
    // let index = this.options.length < 5;
    if (this.options.length < 5) {
      let option = this.cardForm.controls['mcqoption'].value;

      let check = jQuery('#isTosRead').is(":checked");

      let choices = {};
      if (option) {
        choices['label'] = option;

        if (check == true) {
          choices['checkStatus'] = 'checked';

        }
        else {
          choices['checkStatus'] = '';
        }

        // choices['resource_type'] = 'image';
        choices['name'] = 'choices';
        // if (optimg) {
        //   choices['resource_url'] = optimg;
        // } else {
        //   choices['resource_url'] = '';
        // }

        this.options.push(choices);
        this.cardForm.controls['mcqoption'].setValue(null);
        this.cardForm.controls['option_image_url'].setValue(null);

      }

      jQuery('#isTosRead').attr('checked', false);
    }
  }

  onChange(opt) {
    if (opt.checkStatus === 'checked') {
      opt.checkStatus = '';
    } else {
      opt.checkStatus = 'checked';
      this.choiceError = '';
    }
  }

  removeFromOptions(i) {
    // console.log(i);
    this.options.splice(i, 1);
  }

  onOptionKeyUp(event, index) {
    if (index < 4) {
      let choices = {};
      let option = event.target.value;
      if (option) {
        choices['label'] = option;
        choices['name'] = 'choices';
      }
      this.options.splice(index, 1, choices);
    }
    event.target.focus();
  }

  uploadOptionImageFile() {
    // console.log('Upload Option Image File');
    let files = this.el.nativeElement.getElementsByClassName('option-upload')[0];
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
    let _this = this;
    bucket.upload(params, function (err, data) {
      if (err) {
        _this.optionUploadError = 'Failed to upload file';
      } else {
        _this.cardForm.controls['option_image_url'].setValue(data.Location);
        _this.optionFileUploaded = true;
      }
    });
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
      let rightFeedback = this.cardForm.controls['right_feed'].value;
      let wrongFeedback = this.cardForm.controls['wrong_feed'].value;
      let mcqoption = this.cardForm.controls['mcqoption'].value;
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
        this.cardForm = new FormGroup({
          text_question: new FormControl(question, Validators.required),
          image_url: new FormControl(imageUrl),
          mcqoption: new FormControl(mcqoption),
          isTosRead: new FormControl(''),
          video_url: new FormControl(videoUrl),
          youtube_url: new FormControl(youtubeUrl),
          video_code: new FormControl(videoCode),
          right_feed: new FormControl(rightFeedback),
          wrong_feed: new FormControl(wrongFeedback),
          option_image_url: new FormControl('')
        });
      } else {
        // Test type form validator
        setTimeout(() => {
          this.cardForm = new FormGroup({
            text_question: new FormControl(question, Validators.required),
            image_url: new FormControl(imageUrl),
            mcqoption: new FormControl(mcqoption),
            isTosRead: new FormControl(),
            video_url: new FormControl(videoUrl),
            youtube_url: new FormControl(youtubeUrl),
            video_code: new FormControl(videoCode),
            right_feed: new FormControl(rightFeedback),
            wrong_feed: new FormControl(wrongFeedback),
            option_image_url: new FormControl('')
          });
        })
      }
    } else {
      if (this.isSurveyModeEnabled) {
        // Survey type form validator
        this.cardForm = new FormGroup({
          text_question: new FormControl('', Validators.required),
          image_url: new FormControl(''),
          mcqoption: new FormControl(''),
          isTosRead: new FormControl(''),
          video_url: new FormControl(''),
          youtube_url: new FormControl(''),
          video_code: new FormControl(''),
          right_feed: new FormControl(''),
          wrong_feed: new FormControl(''),
          option_image_url: new FormControl('')
        });
      } else {
        // Test type form validator
        this.cardForm = new FormGroup({
          text_question: new FormControl('', Validators.required),
          image_url: new FormControl(''),
          mcqoption: new FormControl(''),
          isTosRead: new FormControl(''),
          video_url: new FormControl(''),
          youtube_url: new FormControl(''),
          video_code: new FormControl(''),
          right_feed: new FormControl(''),
          wrong_feed: new FormControl(''),
          option_image_url: new FormControl('')
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