import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ShortAnswerService } from '../../services/shortanswer.service';
import {Session} from '../../shared/models/session';
import { Router } from '@angular/router';
import * as moment from 'moment';

declare var jQuery: any;

@Component({
  selector: 'wordcloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.css']
})
export class WordcloudComponent implements OnInit , AfterViewInit {

  @Input() answer: any;
  @Input() session: Session;
  words = [];
  answerList;

  constructor(private answerService: ShortAnswerService,
  private router: Router) {
    this.answerList = [];
  }


  ngOnInit() {

    try {
     this.answerService.getAnswers(this.session.session_id,
      this.answer.question_id,
       this.populateAnswers.bind(this));
    }  catch (e) {
      this.router.navigate(['/app/sessions']);
    }

  }

  ngAfterViewInit() {
   this.answer.analytics.forEach(data => {
          let old = JSON.stringify(data).replace('label', 'text').replace('total', 'weight');
          this.words.push(JSON.parse(old));
    });
    let tagName = '#jqcloud' + this.answer.question_id;
    jQuery('#answer' + this.answer.question_id).attr('data-target', '#myModal' + this.answer.question_id);
    setTimeout(function() {
       jQuery(tagName).jQCloud(this.words, {
          width: 400,
          height: 250
       });
    }.bind(this), 1500);
  }


  public populateAnswers(response) {
      this.answerList = response.answers;
      this.answerList.forEach(element => {
          element.created_at = moment.utc(element.created_at).local().fromNow();
      });
  }
}
