import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
import 'rxjs/Rx';

@Injectable()
export class ShortAnswerService {

    
  public isfetched:boolean = false;
  
  constructor(private api: ApiService, 
    private conf: ConfigurationService) {

  }
  
  public getAnswers(session_id, question_id, callback) {
      let userId = this.conf.getUser().userId;
      let url = `/users/${userId}/sessions/${session_id}/answers?question_id=${question_id}`;                                                                                         
      return this.api.get(url)
      .map(rawResponse => rawResponse.json())
      .filter(response => response.type === 'Success')
      .subscribe(
          ((res:any) => callback(res)),
          (error => console.log(error)),
          (() => this.isfetched = true)
      );
 
 }
}
