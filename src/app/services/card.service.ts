import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class CardService {


  constructor(private api: ApiService, private conf: ConfigurationService) { }


  getSessionQuestions(sessionId: string, nextPageToken: string): Observable<string> {
    let url = `/questions?session-id=${sessionId}&limit=&next_page_token=${nextPageToken}`;
    return this.api.get(url).map(rawResponse => rawResponse.json());
  }



}
