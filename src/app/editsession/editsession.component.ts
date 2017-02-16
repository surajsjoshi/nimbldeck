import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Session } from '../shared/models/session';
import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';


declare var AWS: any;
declare var ga: any;
declare var mixpanel: any;
declare var jQuery: any;


@Component({
  selector: 'app-editsession',
  templateUrl: './editsession.component.html',
  styleUrls: ['./editsession.component.css']
})
export class EditsessionComponent  {

  logoPath = 'assets/img/nimbldeck-logo.jpg';
  sessionUpdated: boolean;
  sessionError: boolean;
  uploadError: string;
  fileUploaded: boolean;
  imgUploadingInProcess: boolean;
  editSessionForm: FormGroup;

  constructor(public editService: EditService,
    private el: ElementRef,
    private conf: ConfigurationService,
    private sessionService: SessionService,
    private formBuilder: FormBuilder) {
     this.sessionUpdated = false;
     this.imgUploadingInProcess = false;
     this.fileUploaded = false;
     this.uploadError = '';
     this.sessionError = false;

     this.editSessionForm = formBuilder.group({
       session_title: new FormControl(editService.getCurrent().title, Validators.required),
       organization: new FormControl(editService.getCurrent().organization),
       image_url: new FormControl(editService.getCurrent().image_url),
       session_id: new FormControl(editService.getCurrent().session_id)
    });
    this.fileUploaded = true;
    ga('send', 'pageview', '/sessions/' + this.editService.getCurrent().session_id + '/edit');
   }

  submitEditSession(event) {
    let btnSave = this.el.nativeElement.getElementsByClassName('btn')[0];
    jQuery(btnSave).attr('disabled', 'disabled');
    btnSave.innerHTML = 'Saving...';
    this.sessionError = false;
    if (!this.editSessionForm.valid) {
      return false;
    }
    mixpanel.time_event('EditSession');
   let observale = this.sessionService.editSession(this.editSessionForm.value);
    observale.subscribe(
      (resp => console.log(resp)),
      (error => this.sessionError = true)
    );
    event.preventDefault();
    mixpanel.track('EditSession', {'user': this.conf.getUser().getEmailId()});
  }

  removeImage() {
    this.editSessionForm.controls['image_url'].setValue(null);
    this.fileUploaded = false;
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
        self.editSessionForm.controls['image_url'].setValue(data.Location);
      }
    });
  }



}
