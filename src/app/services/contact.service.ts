import { Card } from '../shared/models/card';
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Session } from '../shared/models/session';

@Injectable()
export class ContactService {

  

  constructor(private api: ApiService, private conf: ConfigurationService) {
    
   }

  postMessage(message: string){
    let data = {email_id: this.conf.getUser().emailId, message: message};
    return this.api.post('/contact-us', JSON.stringify(data))
      .map(rawResponse => rawResponse.json());
  }


  


}
