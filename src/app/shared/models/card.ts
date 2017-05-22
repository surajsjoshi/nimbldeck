import * as moment from 'moment';

export class Card {

  question_id: string;
  session_id: string;
  image_url: string;
  status: string;
  updated_at: Date;
  created_at: Date;
  title: string;
  description: string;
  resource_url: string;
  position: number;
  choices: any;
  resource_type: string;
  resource_code: string;
  scope: string;
  question_scope: string;
  correct_description: string;
  incorrect_description: string;
  correct_answers;

  constructor(card: Object) {
    for (let key in card) {
        if (key === 'updated_at' || key === 'created_at') {
           this[key] = moment.utc(card[key]).local().toDate();
        } else {
           this[key] = card[key];
       }
    }
  }
}
