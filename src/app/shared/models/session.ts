import * as moment from 'moment';

export class Session {

  session_id: string;
  image_url: string;
  status: string;
  updated_at: string;
  created_at: string;
  paused_at: string;
  organization: string;
  title: string;
  share_token: string;
  isSample: boolean;
  user_id: string;



  constructor(session: Object, sample: boolean) {
    this.isSample = sample;
    for (let key in session) {
        if (key === 'updated_at' || key === 'created_at') {
           this[key] = moment.utc(session[key]).local().fromNow();
        } else {
           this[key] = session[key];
       }
    }
  }
}
