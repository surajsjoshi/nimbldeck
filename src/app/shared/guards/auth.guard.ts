import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { CurrentUser } from "../models/currentuser";
import { ConfigurationService } from "../../services/configuration.service";

@Injectable()
export class AuthGuard implements CanActivate {
   
    constructor(private router: Router, private conf: ConfigurationService){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<boolean>  {
        let user = this.conf.getUser();
        if (user != null && !user.sessionexpired){
            return Observable.of(true);
        } else {
            this.router.navigateByUrl('login');
        }
        return Observable.of(false);
    }

}
