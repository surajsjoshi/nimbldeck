import { Card } from '../shared/models/card';
import { ApiService } from './api.service';
import { ConfigurationService } from './configuration.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class CardService {

  cards: Array<Card>;

  constructor(private api: ApiService, private conf: ConfigurationService) { }


  getSessionQuestions(sessionId: string, nextPageToken: string): Observable<string> {
    let url = `/questions?session-id=${sessionId}&limit=&next_page_token=${nextPageToken}`;
    return this.api.get(url).map(rawResponse => rawResponse.json());
  }

  updateQuestion(questionData, sessionId) {
    let url = `/questions`;
    questionData.session_id = sessionId;
    questionData.user_id = this.conf.getUser().userId;
    let data = JSON.stringify(questionData);
    return this.api.put(url, data)
      .map(rawResponse => rawResponse.json());
  }

  addQuestion(questionData, sessionId) {
    let url = `/questions`;
    questionData.session_id = sessionId;
    questionData.user_id = this.conf.getUser().userId;
    let data = JSON.stringify(questionData);
    return this.api.post(url, data)
      .map(rawResponse => rawResponse.json());
  }


  deleteQuestion(questionData, sessionId) {
    questionData.user_id = this.conf.getUser().userId;
    let url = `questions/${questionData['question-id']}`;
    let data = JSON.stringify(questionData);
    return this.api.post(url, data)
      .map(rawResponse => rawResponse.json());
  }

  updateCardAfterEdit(card: Card) {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i].question_id === card.question_id) {
        this.cards[i] = card;
        break;
      }
    }
  }



}
