import { Injectable } from '@angular/core';
import * as APP_CONSTANTS from '../app-constants';
import { CurrentUser } from '../shared/models/currentuser';

import { ConfigurationService } from '../services/configuration.service';
import { SessionService } from '../services/session.service';
import { ApiService } from '../services/api.service';

@Injectable()
export class SingleSessionService {

    constructor(
        private configService: ConfigurationService,
        private sessionService: SessionService,
        private apiService: ApiService) { }

    setQuestionId(questionId: any, moveTo: number, sessionId: any): Promise<any> {
        let user: CurrentUser = this.configService.getUser();
        debugger
        let body = {
            user_id: user.userId,
            session_id: sessionId,
            move_to: moveTo + 1
        }
        return this.apiService
            .post(APP_CONSTANTS.apiRoutes.moveQuestionUrl
                .replace('{question-id}', questionId), body)
            .map(res => res.json()).toPromise();
    }
}
