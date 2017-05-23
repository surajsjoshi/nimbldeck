import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable , Operator} from 'rxjs/Rx';
import { CognitoIdentityCredentials } from 'aws-sdk';
import { environment } from '../../environments/environment';
import 'rxjs/Rx';

@Injectable()
export class AuthService {


  credentials: CognitoIdentityCredentials;

  constructor(private api: ApiService,
    private conf: ConfigurationService) {

       this.credentials = new CognitoIdentityCredentials({
            IdentityPoolId: environment.identityPool,
            RoleSessionName: 'web'
      },{ 
        region: 'us-east-1'
      });

      this.credentials.get(function (err) {
          if (err) {
            console.log(err);
        }});

  }

  login(loginData): Observable<string>  {
      loginData['identityId'] =  this.credentials.identityId;
      return this.api.post('/users/authenticate', loginData).map(res => res.json());
  }

  signup(singupData): Observable<string>  {
    return this.api.post('/users', singupData).map(res => res.json());
  }

}