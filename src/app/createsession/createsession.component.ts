import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Component, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

declare var AWS: any;
declare var jQuery: any;
declare var ga: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'createsession',
  templateUrl: './createsession.component.html',
  styleUrls: ['./createsession.component.css']
})
export class CreatesessionComponent {
  header: string;
  logoPath: string;
  sessionCreated: boolean;
  sessionError: boolean;
  imgUploadingInProcess: boolean;
  uploadError: string;
  fileUploaded: boolean;
  addSessionForm: FormGroup;

  constructor(public editService: EditService,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private el: ElementRef,
    private router: Router,
    private formBuilder: FormBuilder) {

    this.logoPath = environment.logoPath;
    this.sessionCreated = false;
    this.sessionError = false;
    this.imgUploadingInProcess = false;
    this.uploadError = '';
    this.fileUploaded = false;
    this.header = 'Create New Session';
    this.addSessionForm = this.formBuilder.group({
      session_title: new FormControl('', Validators.required),
      organization: new FormControl(''),
      image_url: new FormControl(''),
      session_id: new FormControl('')
    });
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
       Body: file,
       Bucket: environment.imageUploadBucket
    };
    this.conf.getUploader().upload(params, function (err, data) {
      if (err) {
        self.uploadError = 'Failed to upload file';
      } else {
        self.fileUploaded = true;
        self.imgUploadingInProcess = false;
        self.addSessionForm.controls['image_url'].setValue(data.Location);
      }
    });
  }

  submitAddSession(event) {
    let btnSave = this.el.nativeElement.getElementsByClassName('btn')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.sessionError = false;
    if (!this.addSessionForm.valid) {
      return false;
    }
    if (this.editService.isEditing()) {

      mixpanel.time_event('EditSession');
      /* let observale = this.sessionService.editSession(this.editSession.value);
          observale.subscribe(
          (resp => console.log(resp)),
          (error => this.sessionError = true)
       );*/
      event.preventDefault();
      mixpanel.track('EditSession', { 'user': this.conf.getUser().getEmailId() });
    } else {
      mixpanel.time_event('CreateSession');
      let observale = this.sessionService.addSession(this.addSessionForm.value);
      observale.subscribe(
        (resp => this.onSessionCreate(resp)),
        (error => this.sessionError = true)
      );
      event.preventDefault();
      mixpanel.track('CreateSession', { 'user': this.conf.getUser().getEmailId() });
    }
  }


  onSessionCreate(resp) {
    if (resp.type === 'Failure') {
      this.sessionError = true;
      mixpanel.people.increment('CreateSessionFailed');
      mixpanel.track('CreateSessionFailed', { 'error': resp.errors[0].message });
      return;
    }
    this.sessionCreated = true;
    let session = this.sessionService.addToSessions(resp.session);
    jQuery(this.el.nativeElement.getElementsByClassName('reset-btn')).click();
    (<any>jQuery(this.el.nativeElement).find('#create-session-modal')).closeModal();
    if (environment.production) {
      mixpanel.people.increment('Sessions');
      mixpanel.people.increment('TotalSessions');
    }
    this.router.navigate(['/app/sessions', session.session_id]);

  }

  removeImage() {
    this.addSessionForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
  }


}
