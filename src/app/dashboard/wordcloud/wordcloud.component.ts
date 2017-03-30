import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ShortAnswerService } from '../../services/shortanswer.service';
import { SessionService } from '../../services/session.service';
import {Session} from '../../shared/models/session';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

declare var jQuery: any;

@Component({
  selector: 'wordcloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.scss']
})
export class WordcloudComponent implements OnInit , AfterViewInit {

  @Input() answer: any;
  @Input() session: Session;
  words = [];
  answerList;
  private subscription: Subscription;

  constructor(private answerService: ShortAnswerService,
      public sessionService: SessionService,
      private route: ActivatedRoute) {
    this.answerList = [];
  }


  openModal(event) {
    jQuery('.wordcloud_commnet_modal').openModal();

  }
closeModal(event) {
    jQuery('.wordcloud_commnet_modal').closeModal();

  }


  ngOnInit() {
      this.subscription = this.route.params.subscribe(params => {
        let sessionId = params['id'];
        this.sessionService.getSession(sessionId)
        .subscribe(sess => this.mapSession(sess),
            (error => console.log(error)),
        () => console.log('done'));
        this.answerService.getAnswers(sessionId,
          this.answer.question_id,
          this.populateAnswers.bind(this));
    });

  }

  private mapSession(response) {
    this.session = response;
  }

  ngAfterViewInit() {
   this.answer.analytics.forEach(data => {
          let old = JSON.stringify(data).replace('label', 'text').replace('total', 'weight');
          this.words.push(JSON.parse(old));
    });
    let tagName = '#jqcloud' + this.answer.question_id;
   /* jQuery('#answer' + this.answer.question_id).click(function(){
    jQuery(this).css({'border': '1px solid red'});
    jQuery('#myModal8aa92711-8d83-4d42-87cf-f3a077d064b3').removeClass('fade').addClass('fade in', function(){
            jQuery('body').append('<div class="modal-backdrop fade in"></div>');
          }).css('display', 'block');
       });*/

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
