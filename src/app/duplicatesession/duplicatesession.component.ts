import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare var AWS: any;
declare var Materialize: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;

@Component({
  selector: 'app-duplicatesession',
  templateUrl: './duplicatesession.component.html',
  styleUrls: ['./duplicatesession.component.css']
})
export class DuplicatesessionComponent implements OnInit {

  logoPath = 'assets/img/nimbldeck-logo.jpg';
  sessionCreated: boolean;
  sessionError: boolean;
  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  duplicateSessionForm: FormGroup;

  constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private el: ElementRef,
    private router: Router,
    private formBuilder: FormBuilder) {

    this.sessionCreated = false;
    this.sessionError = false;
    this.uploadError = '';
    this.fileUploaded = false;
    this.imgUploadingInProcess = false;

    let session = this.editService.getCurrent();
    this.duplicateSessionForm = formBuilder.group({
      session_title: ['', Validators.required],
      organization: [session.organization],
      image_url: [''],
      parent_session_id: [session.session_id],
      user_id: [this.conf.getUser().getUserId()]
    });


  }

  ngOnInit() {
      ga('set', 'userId', this.conf.getUser().getUserId());
      ga('send', 'pageview', '/sessions/duplicate');
  }

  uploadFile() {
    let self = this;
    this.imgUploadingInProcess = true;
    let files = this.el.nativeElement.getElementsByClassName('file-upload')[0];
    let file = files.files[0];
    let objKey = 'public/' + this.conf.getUser().identityId + '/' + file.name;
    let params = {
      Key: objKey,
      ContentType: file.type,
      Body: file
    };
    let bucketName = 'nimbldeckapp-userfiles-mobilehub-964664152';
    let bucket = new AWS.S3({
      params: {
        Bucket: bucketName
      }
    });
    bucket.upload(params, function (err, data) {
      if (err) {
         self.uploadError = 'Failed to upload file';
      } else {
        self.fileUploaded = true;
        self.imgUploadingInProcess = false;
        self.duplicateSessionForm.controls['image_url'].setValue(data.Location);
      }
    });
  }
  cancelUploadedImg() {
    this.fileUploaded = false;
  }

   removeImage() {
    this.duplicateSessionForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
  }

  submitDuplicateSession(event) {
    if (!this.duplicateSessionForm.valid) {
      return false;
    }
    let btnSave = this.el.nativeElement.getElementsByClassName('btn')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    event.preventDefault();
    mixpanel.time_event('DuplicateSession');
    this.sessionService
      .duplicateSession(this.duplicateSessionForm.value)
      .subscribe(
        (resp => this.sessionCloned(resp)),
        (error => this.sessionError = true),
        (() => console.log(''))
      );
      mixpanel.track('DuplicateSession', {'user': this.conf.getUser().emailId});
  }


  sessionCloned(resp) {
    if (resp.type === 'Failure') {
      this.sessionError = true;
      mixpanel.people.increment('DuplicateSessionFailed');
      mixpanel.track('DuplicateSessionFailed', {'error' : resp.errors[0].message});
      return;
    }
    this.sessionCreated = true;
    let session = this.sessionService.addToSessions(resp.session);
    jQuery('#duplicate-session-modal').closeModal();
    mixpanel.people.increment('DuplicateSession');
    mixpanel.people.increment('Sessions');
    this.router.navigate(['SingleSession', {sessionId: session.session_id}]);
  }

}
