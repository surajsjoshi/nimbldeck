
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
import 'rxjs/Rx';

@Injectable()
export class SessionAnalyticsService {



  constructor(private api: ApiService, private conf: ConfigurationService) {}


  public getSessionAnalysis(sessionId: string): Observable<any> {
    let url = `/sessions/${sessionId}/analytics`;
    return this.api.get(url)
      .map(rawResponse => rawResponse.json());
  }
}
