import * as moment from 'moment';

export class Session {

  session_id: string;
  image_url: string;
  status: string;
  updated_at: Date;
  created_at: Date;
  organization: string;
  title: string;
  share_token: string;
  isSample: boolean;



  constructor(session: Object, sample: boolean) {
    this.isSample = sample;
    for (let key in session) {
        if (key === 'updated_at' || key === 'created_at') {
           this[key] = moment.utc(session[key]).local().toDate();
        } else {
           this[key] = session[key];
       }
    }
  }
}
