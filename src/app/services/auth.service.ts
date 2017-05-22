import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
import 'rxjs/Rx';

@Injectable()
export class AuthService {

  constructor(private api: ApiService,
    private conf: ConfigurationService) {

  }

  login(loginData): Observable<string>  {
      let url = '/users/authenticate';
      return this.api.post(url, loginData).map(res => res.json());
  }

  signup(emailId: string, password: string, userName: string): Observable<string>  {

    let url = '/users';
    let data = {'email_id' : emailId, 'password': password, 'username': userName, 'source':'web'}

    return this.api.post(url, data).map(res => res.json());
  }

}