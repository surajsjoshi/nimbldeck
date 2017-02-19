import { environment } from '../../environments/environment';
import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Session } from '../shared/models/session';
import { Component, EventEmitter, OnInit } from '@angular/core';
import * as moment from 'moment';

declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'sessionbox',
  inputs: ['session'],
  outputs: ['onShowDuplicateModal', 'onShowEditModal'],
  templateUrl: './sessionbox.component.html',
  styleUrls: ['./sessionbox.component.css']

})
export class SessionboxComponent implements OnInit {

  session: Session;
  onShowDuplicateModal: EventEmitter<boolean>;
  onShowEditModal: EventEmitter<boolean>;
  hideClass:  string;
  playStatus: string;
  isComplete: boolean;
  textCopied: boolean;

  constructor(public sessionService: SessionService,
    private conf: ConfigurationService,
    private editService: EditService) {
    this.hideClass = 'hide';
    this.textCopied = false;
    this.isComplete = false;
    this.onShowEditModal = new EventEmitter<boolean>();
    this.onShowDuplicateModal = new EventEmitter<boolean>();
  }

   ngOnInit() {
    let image = new Image();
    image.src = this.session.image_url;
    if (this.session.status === 'Running') {
      this.playStatus = 'stop';
    } else if (this.session.status === 'Completed') {
      this.isComplete = true;
    }
  }

  deleteSession() {
    if (confirm('Are you sure, you want to delete this session?')) {
      this.sessionService.deleteSession(this.session.session_id);
      if (environment.production) {
        mixpanel.people.increment('Sessions', -1);
      }
    }
  }

   clicked(event) {
    if (this.hideClass === '') {
      this.hideClass = 'hide';
    } else {
      this.hideClass = '';
    }
  }

  startStopSession() {
    if ('play' === this.playStatus) {
      this.sessionService.startStopSession(this.session.session_id, 'start')
        .subscribe(
          (resp => console.log(resp)),
          (error => console.log(error))
        );
    } else {
      this.sessionService.startStopSession(this.session.session_id, 'stop')
        .subscribe(
          (resp => console.log(resp)),
          (error => console.log(error))
        );
    }
  }

  private onStartStop(resp, action: string) {
    if ('Success' === resp.type) {
      if ('start' === action) {
          this.playStatus = 'stop';
          this.session.status = 'Running';
          if (environment.production) {
            mixpanel.people.increment('RunningSessions');
          }
      } else {
        this.isComplete = true;
        if (environment.production) {
          mixpanel.people.increment('RunningSessions', -1);
        }
    }
    }
  }

  duplicateSession(evt, session) {
    evt.preventDefault();
    this.editService.setCurrentEdit('session', session);
    this.onShowDuplicateModal.emit(true);
  }

  editSession(evt, session) {
    evt.preventDefault();
    this.editService.setCurrentEdit('session', session);
    this.onShowEditModal.emit(true);
  }

}
