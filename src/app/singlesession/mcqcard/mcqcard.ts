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
  selector: 'mcqcard',
  templateUrl: './mcqcard.html',
  styles: ['./mcqcard.css'],
})
export class McqCardComponent implements OnInit, AfterViewInit, OnDestroy {



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
      this.optionFileUploaded = false;
      this.optionUploadError = '';

      this.updateQuestion = this.editService.getCurrent();
      ga('set', 'userId', this.conf.getUser().userId);
      if (editService.isEditing()) {
      this.updateQuestionFlag = true;
      this.options = this.updateQuestion.choices;
      this.cardForm = formBuilder.group({
        text_question: [this.updateQuestion.description, Validators.required],
        mcqoption: ['', Validators.required],
        isTosRead: [''],
        image_url: [''],
        video_url: [''],
        youtube_url: [''],
        video_code: [''],
        option_image_url: ['']
      });
      if (this.updateQuestion.resource_type) {
            if (this.updateQuestion.resource_type === 'image' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus = 'image';
                this.cardForm.controls['image_url'].setValue(this.updateQuestion.resource_url);

               


            } else  if (this.updateQuestion.resource_type === 'video' && this.updateQuestion.resource_url) {
                this.fileUploaded = true;
                this.filestaus = 'video';
                let video_thumbnail_url = 'https://img.youtube.com/vi/' + this.updateQuestion.resource_code + '/0.jpg';
                this.cardForm.controls['video_url'].setValue(video_thumbnail_url);
                this.cardForm.controls['video_code'].setValue(this.updateQuestion.resource_code);

               


            }
      }
      ga('send', 'pageview', '/sessions/mcqcard/edit');
    } else {
      this.cardForm = formBuilder.group({
        text_question: ['', Validators.required],
        image_url: [''],
        mcqoption: ['', Validators.required],
        isTosRead: [''],
        option_image_url: [''],
        video_url: [''],
        youtube_url: [''],
        video_code: ['']
      });
      ga('send', 'pageview', '/sessions/mcqcard/add');
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
        this.filestaus = '';
        _this.imgUploadingInProcess = false;
        _this.cardForm.controls['image_url'].setValue(data.Location);


          jQuery('.video-upload, .or_text').css('display','none');
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

    if (this.cardForm.controls['video_url'].value !== '' ) {
      jQuery('.img-upload, .or_text').css('display', 'none');
      jQuery('.video-upload').addClass('fullWidth');
    }

    this.cardForm.controls['video_code'].setValue(resource_code);
}

  removeImage() {
    this.cardForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
    this.filestaus = '';
    jQuery('.video-upload, .or_text').css('display','block');
    jQuery('.img-upload').removeClass('fullWidth');
  }

 removeVideo() {
    this.cardForm.controls['video_url'].setValue(null);
    this.cardForm.controls['youtube_url'].setValue(null);
    this.cardForm.controls['video_url'].setValue(null);
    this.cardForm.controls['video-code'].setValue(null);

    this.fileUploaded = false;
    this.filestaus='';
    jQuery('.img-upload, .or_text').css('display','block');
    jQuery('.video-upload').removeClass('fullWidth');
    
  }


  submitMcqCard(event) {
    event.preventDefault();
    let btnSave = this.el.nativeElement.getElementsByClassName('btn-submit')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.cardError = false;
    if (!this.cardForm.valid) {
      return false;
    }
    let optionsCount = this.options.length;
    let option = this.cardForm.controls['mcqoption'].value;
    if ((optionsCount < 4) && option) {
      let choices = {};
      choices['label'] = option;
      choices['name'] = 'choices';
      this.options.push(choices);
      this.cardForm.controls['mcqoption'].setValue(null);
    }

    let params;
    if (this.cardForm.controls['youtube_url'].value !== '') {
      params = {
          type: 'multiple_choice',
          description: this.cardForm.controls['text_question'].value,
          required: false,
          resource_url:  this.cardForm.controls['youtube_url'].value,
          resource_type: 'video',
          resource_code: this.cardForm.controls['video_code'].value
        };

    } else {
         params = {
          type: 'multiple_choice',
          description: this.cardForm.controls['text_question'].value,
          required: false,
          resource_url: this.cardForm.controls['image_url'].value,
          resource_type: 'image'
        };
    }

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
      mixpanel.track('CreateMCQCard', {'user': this.conf.getUser().emailId});
    } else {
      mixpanel.time_event('EditMCQCard');
      params['question_id'] = this.updateQuestion.question_id;
      params['position'] = this.updateQuestion.position;
      let observable = this.cardService.updateQuestion(params, this.updateQuestion.session_id);
      observable.subscribe(
        (resp => this.questionUpdated(resp)),
        (error => this.cardError = true)
      );
      mixpanel.track('EditMCQCard', {'user': this.conf.getUser().emailId});
    }

  }

  questionCreated(resp) {
    if (resp.type === 'Failure') {
      this.saveCardErrorText = resp.errors[0].message;
      this.cardError = true;
      mixpanel.people.increment('CreateMCQCardFailed');
      mixpanel.track('CreateMCQCardFailed', {'error' : this.saveCardErrorText});
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
      mixpanel.track('EditMCQCardFailed', {'error' : this.saveCardErrorText});
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

        if(check==true)
        {
          choices['checkStatus'] = 'checked';

        }
        else{
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
    let objKey =  'public/' + this.conf.getUser().identityId + '/' + file.name;
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

    toggle_modal_layout(event) {
            jQuery('.toHide').hide();
            jQuery('#blk-' + event).show();
    }

}
