import { ConfigurationService } from '../services/configuration.service';
import { EditService } from '../services/edit.service';
import { SessionService } from '../services/session.service';
import { Session } from '../shared/models/session';
import { Component, EventEmitter, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import * as moment from 'moment';

declare var Clipboard:any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'sessionbox',
  inputs: ['session'],
  outputs: ['onShowDuplicateModal', 'onShowEditModal'],
  templateUrl: './sessionbox.component.html',
  styleUrls: ['./sessionbox.component.css']

})
export class SessionboxComponent implements OnInit, AfterViewInit {

  session: Session;
  onShowDuplicateModal: EventEmitter<boolean>;
  onShowEditModal: EventEmitter<boolean>;
  hideClass:  string;
  playStatus: string;
  isComplete: boolean;
  textCopied: boolean;

  constructor(public sessionService: SessionService,
    private conf: ConfigurationService,
    private editService: EditService,
    private el: ElementRef) {
    this.hideClass = 'hide';
    this.textCopied = false;
    this.isComplete = false;
    this.playStatus = 'play';
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
      mixpanel.people.increment('Sessions', -1);
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
          (resp => this.onStartStop(resp, 'start')),
          (error => console.log(error))
        );
    } else {
      this.sessionService.startStopSession(this.session.session_id, 'stop')
        .subscribe(
          (resp => this.onStartStop(resp, 'stop')),
          (error => console.log(error))
        );
    }
  }

  private onStartStop(resp, action: string) {
    if ('Success' === resp.type) {
      if ('start' === action) {
          this.playStatus = 'stop';
          this.hideClass = '';
          this.session.status = 'Running';
          mixpanel.people.increment('RunningSessions');

      } else {
        this.isComplete = true;
        mixpanel.people.increment('RunningSessions', -1);
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
   ngAfterViewInit() {
    let clipboard = new Clipboard(this.el.nativeElement.getElementsByClassName('copy-btn'));
    let self = this;
    clipboard.on('success', function (e) {
      e.clearSelection();
      self.textCopied = true;
    });

    clipboard.on('error', function (e) {
    });
  }

}
