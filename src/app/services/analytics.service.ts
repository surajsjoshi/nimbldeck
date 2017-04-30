import { environment } from '../../environments/environment';
import { CurrentUser } from '../shared/models/currentuser';
import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs';

@Injectable()
export class AnalyticsService {

   updateAnalytics(newAnalytics, oldAnalytics): boolean {
      let changed = false;
      for (let answer of newAnalytics){
          if (!changed) {
            changed = this.updateAnswer(answer, oldAnalytics);
          } else {
              this.updateAnswer(answer, oldAnalytics);
          }
    }
    return changed;
}


private updateAnswer(answer: any, oldAnalytics: any): boolean {
    let oldAnswers = Array.from(oldAnalytics).filter(ans => ans['question_id'] === answer.question_id);
    let oldAnswer = null;
    let update = false;
    if (oldAnswers.length > 0) {
        oldAnswer = oldAnswers[0];
        if (oldAnswer['analytics'].length !== answer['analytics'].length) {
          update = true;
        } else {
        for (let data of answer['analytics']) {
            let record = Array.from(oldAnswer['analytics']).filter(ans => ans['label'] === data['label'])[0];
            if (record['total'] !== data['total']) {
                update = true;
            }
        }
    }
    if (update) {
      for (let i = 0; i < oldAnalytics.length; i++) {
          if (oldAnalytics[i]['question_id'] === answer['question_id']) {
                oldAnalytics[i]['analytics'] = answer['analytics'];
                oldAnalytics[i]['answered_by'] = answer['answered_by'];
                oldAnalytics[i]['participants'] = answer['participants'];
          }
        }
      }
    } else {
        oldAnalytics.push(answer);
    }
    return update;
  }

}
