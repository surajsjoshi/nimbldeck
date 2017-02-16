import { environment } from '../../environments/environment';
import { CurrentUser } from '../shared/models/currentuser';
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {

   private headers: Headers;

    constructor(private http: Http, private user: CurrentUser) {
       this.headers = new Headers();
       this.headers.append('X-API-KEY', environment.apiKey);
    }

    post(url, data): Observable<Response> {
      return this.http.post(environment.apiUrl + url, data, { headers: this.headers });
   }

   put(url, data): Observable<Response> {
      return this.http.put(environment.apiUrl + url, data, { headers: this.headers });
   }

   get(url): Observable<Response> {
      return this.http.get(environment.apiUrl + url, { headers: this.headers });
   }

}
