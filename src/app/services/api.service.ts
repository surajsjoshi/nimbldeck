import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { CurrentUser } from "../shared/models/currentuser";
import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {

  private headers: Headers;
  private user: CurrentUser;

  constructor(private http: Http) {
    this.headers = new Headers();
    this.headers.append('X-API-KEY', environment.apiKey);
  }


  getUser(): CurrentUser {
      return this.loadUser();
  }
  post(url, data): Observable<Response> {
    this.addAuthenticationHeader();
    return this.http.post(environment.apiUrl + url, data, { headers: this.headers });
  }

  put(url, data): Observable<Response> {
    this.addAuthenticationHeader();
    return this.http.put(environment.apiUrl + url, data, { headers: this.headers });
  }

  get(url): Observable<Response> {
    this.addAuthenticationHeader();
    return this.http.get(environment.apiUrl + url, { headers: this.headers });
  }

  

   private addAuthenticationHeader(){
    if(!this.headers.has('Authorization') && this.getUser() != null){
        this.headers.append('Authorization', this.getUser().userId);
    }
  }

    private loadUser(): CurrentUser {
    
    let cookie = window.localStorage.getItem('nd_current_user');
   
    if (cookie !== null){
        let user = JSON.parse(cookie);
        this.user = new CurrentUser(user);
        this.user.emailId = user.emailId;
        if(this.user.credentials){
            if(this.user.credentials.expired){
                this.user.sessionexpired = true;
            } else {
                user.sessionexpired = false;
            }
        } else {
            this.user.sessionexpired = true;
        }
    } else {
            this.user = null;
    }
    
    return this.user;
  }

}
