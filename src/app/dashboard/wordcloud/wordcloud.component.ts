import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ShortAnswerService } from '../../services/shortanswer.service';
import { SessionService } from '../../services/session.service';
import {Session} from '../../shared/models/session';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EditService } from '../../services/edit.service';

import * as moment from 'moment';

declare var jQuery: any;

@Component({
  selector: 'wordcloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.scss']
})
export class WordcloudComponent implements OnInit , AfterViewInit, OnDestroy {

  @Input() answer: any;
  @Input() session: Session;
  words = [];
  answerList;
  private subscription: Subscription;
  private updateSubscription: Subscription;


  constructor(private answerService: ShortAnswerService,
      public sessionService: SessionService,
      private editService: EditService,
      private route: ActivatedRoute) {
    this.answerList = [];
     this.updateSubscription = this.editService.updateSubscription()
              .subscribe(data => this.updateChart(data));
  }

  updateChart(data) {
   this.ngAfterViewInit();
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
            (error => console.log(error)));
    });

  }

  private mapSession(response) {
    this.session = response;
    this.answerService.getAnswers(this.session.session_id,
          this.answer.question_id,
          this.populateAnswers.bind(this));
  }

  ngAfterViewInit() {
   // this.words = [];
   this.answer.analytics.forEach(data => {
          let old = JSON.stringify(data).replace('label', 'text').replace('total', 'weight');
          this.words.push(JSON.parse(old));
    });
    let tagName = '#jqcloud' + this.answer.question_id;
    jQuery(tagName).jQCloud(this.words, {
          width: 400,
          height: 250
    });

  }


  public populateAnswers(response) {
      this.answerList = response.answers;
      this.answerList.forEach(element => {
          element.created_at = moment.utc(element.created_at).local().fromNow();
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.updateSubscription.unsubscribe();
 }
}
