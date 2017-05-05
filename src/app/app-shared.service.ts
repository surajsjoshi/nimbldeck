import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AppSharedService {
    // Observable string sources
    private helpFinishChange = new Subject<any>();
    private askQueryChange = new Subject<any>();
    // Observable string streams
    helpFinish$ = this.helpFinishChange.asObservable();
    askQuery$ = this.askQueryChange.asObservable();
    // Service message commands
    emitHelpFinish(change: any) {
        this.helpFinishChange.next(change);
    }

    emitAskQuery(change: any) {
        this.askQueryChange.next(change);
    }
}