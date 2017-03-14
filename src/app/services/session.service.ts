import { Session } from '../shared/models/session';
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
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
    let samplesUrl = '/sessions?limit=6';
    this.api.get(samplesUrl)
      .flatMap(rawResponse => rawResponse.json().sessions)
      .map(session => new Session(session, true))
      .subscribe((session) => this.samples.push(session),
         (error) => console.log(error));
    this.defaultSessions();
  }

  userSessionsFetched(response) {
      Array.from(response.sessions).forEach(session => this.userSessions.push(new Session(session, false)));
      this.totalUserSessions = parseInt(response.total_sessions, 10);
      this.nextPageToken = response.next_page_token;
   }

  defaultSessions(): Array<Session> {
    let userId = this.conf.getUser().getUserId();
    let url = `/users/${userId}/sessions?limit=6&next_page_token=${this.nextPageToken}`;
    this.api.get(url)
      .map(rawResponse => rawResponse.json())
      .subscribe(
        (resp => this.userSessionsFetched(resp)),
        (error => console.log(error)),
        (() => this.isfetched = true));
    return this.samples;
  }

  sampleSessions(): Array<Session> {
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
      .subscribe(session => this.remove(session));
  }

  private remove(currentSession: Session) {
    this.userSessions = this.userSessions.filter(session => session.session_id !== currentSession.session_id);
  }

  public getSession(sessionId: string): Observable<Session> {
    let sessions = this.userSessions.filter(sess => sess.session_id === sessionId);
    if (sessions.length > 0) {
        return Observable.of(sessions[0]);
    } else {
       let url = `/sessions/${sessionId}`;
       return this.api.get(url).map(resp => resp.json()).map(sess => new Session(sess, false));
    }
  }

   public startStopSession(sessionId: string, action: string) {
    let userId = this.conf.getUser().getUserId();
    let url = `/users/${userId}/sessions/${sessionId}/action`;
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

}
