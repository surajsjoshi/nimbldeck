
import { Session } from '../shared/models/session';
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable , Operator} from 'rxjs/Rx';
import * as moment from 'moment';
import 'rxjs/Rx';

@Injectable()
export class QueriesService {



  constructor(private api: ApiService, private conf: ConfigurationService) {}




  getQueries(sessionId: string):  Observable<any> {
    let userId = this.conf.getUser().userId;
    let url = `/users/${userId}/sessions/${sessionId}/queries`;
    return this.api.get(url)
      .map(rawResponse => rawResponse.json());
  }
}
