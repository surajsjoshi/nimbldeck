import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { CurrentUser } from '../shared/models/currentuser';
import { environment } from '../../environments/environment';


@Injectable()
export class ApiService {

  private headers: Headers;

  constructor(private http: Http, private user: CurrentUser) {
    this.headers = new Headers();
    this.headers.append('X-API-KEY', environment.apiKey);
  }


  getUser(): CurrentUser {
      return this.user;
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

  postExternal(url, data): Observable<Response> {
    let headers = new Headers();
    headers.append("Content-Type", "multipart/form-data");
    return this.http.post(url, data, { headers: headers });
  }

   private addAuthenticationHeader(){
    if(!this.headers.has('Authorization') && this.getUser() != null){
        this.headers.append('Authorization', this.getUser().userId);
    }
  }

}
