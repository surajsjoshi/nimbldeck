import { Session } from '../shared/models/session';
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
import {Response} from '@angular/http';
import 'rxjs/Rx';

@Injectable()
export class SessionService {

   private samples: Array<Session>;
   public userSessions: Array<Session>;
   public nextPageToken;
   public samplesNextPageToken;
   public isfetched: boolean;
   public totalUserSessions: number;

  constructor(private api: ApiService, private conf: ConfigurationService) {
    this.samples = [];
    this.userSessions = [];
    this.nextPageToken = '';
    this.samplesNextPageToken = '';
    this.isfetched = false;
    this.totalUserSessions = 0;
  }

  init() {
    this.samples = [];
    this.userSessions = [];
    this.nextPageToken = '';
    this.samplesNextPageToken = '';
    this.isfetched = false;
    this.totalUserSessions = 0;
    this.sampleSessions();
    this.defaultSessions();
  }

  sessionsFetched(response, isSample: boolean) {
      if (isSample) {
          Array.from(response.sessions).forEach(session => this.samples.push(new Session(session, true)));
          this.samplesNextPageToken = response.next_page_token;
      } else {
        Array.from(response.sessions).forEach(session => this.userSessions.push(new Session(session, false)));
        this.totalUserSessions = parseInt(response.total_sessions, 10);
        this.nextPageToken = response.next_page_token;
      }
   }

  defaultSessions(): Array<Session> {
    let userId = this.conf.getUser().getUserId();
    let url = `/users/${userId}/sessions?limit=6&next_page_token=${this.nextPageToken}`;
    this.api.get(url)
      .map(rawResponse => rawResponse.json())
      .subscribe(
        (resp => this.sessionsFetched(resp, false)),
        (error => console.log(error)),
        (() => this.isfetched = true));
    return this.userSessions;
  }

  sampleSessions(): Array<Session> {
    let samplesUrl = `/sessions?limit=6&next_page_token=${this.samplesNextPageToken}`;
    this.api.get(samplesUrl)
      .map(rawResponse => rawResponse.json())
      .subscribe((resp) => this.sessionsFetched(resp, true),
         (error) => console.log(error));
    return this.samples;
  }

  deleteSession(sessionId) {
    let url = `/sessions/${sessionId}`;
    let data = {
      session_id: sessionId,
      user_id: this.conf.getUser().getUserId()
    };
    let requestData = JSON.stringify(data);
    return this.api.post(url, requestData)
      .map(resp => resp.json())
      .subscribe(response => this.remove(sessionId));
  }

  private remove(currentSession: string) {
    let index = -1;
    for (let i = 0, len = this.userSessions.length; i < len; i++) {
      if (this.userSessions[i].session_id === currentSession) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      this.userSessions.splice(index, 1);
      this.totalUserSessions--;
    }
  }

  public getSession(sessionId: string): Observable<Session> {
    let sessions = this.userSessions.filter(sess => sess.session_id === sessionId);
    if (sessions.length > 0) {
        return Observable.of(sessions[0]);
    } else {
       let url = `/sessions/${sessionId}`;
       return this.api.get(url).map(resp => resp.json()).map(response => new Session(response.session, false));
    }
  }

   public startStopSession(sessionId: string, action: string) {
    let userId = this.conf.getUser().getUserId();
    let url = `/users/${userId}/sessions/${sessionId}/${action}`;
    let requestParams = {
      session_id: sessionId,
      user_id: userId,
      action: action
    };
    return this.api.post(url, JSON.stringify(requestParams))
      .map(resp => resp.json());
  }

   public addToSessions(session): Session {
    let sessionModel = new Session(session, false);
    this.userSessions.unshift(sessionModel);
    return sessionModel;
  }

   public addSession(sessionData: any): Observable<Object> {
    let url = `/sessions`;
    sessionData.user_id = this.conf.getUser().userId;
    let data = JSON.stringify(sessionData);
    return this.api.post(url, data)
      .map(rawResponse => rawResponse.json());
  }

   public duplicateSession(sessionData: any) {
    let url = `/sessions/duplicate`;
    let data = JSON.stringify(sessionData);
    return this.api.post(url, data)
      .map(rawResponse => rawResponse.json());
  }

  public editSession(sessionData: any) {
    let url = `/sessions`;
    sessionData.user_id = this.conf.getUser().userId;

    let data = JSON.stringify(sessionData);
    return this.api.put(url, data)
      .map(rawResponse => rawResponse.json());
  }

  public updateSession(session: Session): Session {
    let index = 0;
    for (let i = 0, len = this.userSessions.length; i < len; i++) {
      if (this.userSessions[i].session_id === session.session_id) {
        index = i;
        break;
      }
    }
    this.userSessions[index] = session;
    return session;
  }

  public exportSession(sessionId: string): Observable<Response> {
     let userId = this.conf.getUser().getUserId();
     let url = `/sessions/${sessionId}/export?user_id=${userId}`;
     return this.api.post(url,null);
  }

}
