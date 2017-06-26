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

  vdocipherUpload(url, data): Observable<Response> {
    let headers = new Headers();
    headers.append("enctype", "multipart/form-data");
    //headers.append("Content-Type", "multipart/form-data");
    return this.http.post(url, data, { headers: headers });
  }
  getvdocipherVideo(videoId): Observable<Response> {
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    let data = new FormData();
    data.append('clientSecretKey' , 'f7f5d67a51d63fa70d1c48ef617355cfd9ed2d1a6d6eb5860e2f94d7d2fbede0');
    return this.http.post("http://api.vdocipher.com/v2/video?id="+videoId, data, { headers: headers });
  }

    vdocipherDelete(videoId): Observable<Response> {
    let headers = new Headers();
    headers.append("Authorization", "Apisecret f7f5d67a51d63fa70d1c48ef617355cfd9ed2d1a6d6eb5860e2f94d7d2fbede0");
    return this.http.delete("https://www.vdocipher.com/dashboard/video/delete?id="+videoId, { headers: headers });
  }

   private addAuthenticationHeader(){
    if(!this.headers.has('Authorization') && this.getUser() != null){
        this.headers.append('Authorization', this.getUser().userId);
    }
  }

}
