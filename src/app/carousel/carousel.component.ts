import { Component, OnInit, OnDestroy , AfterViewInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigurationService } from '../services/configuration.service';
import { SessionAnalyticsService } from '../services/sessionanalytics.service';
import { QueriesService } from '../services/queries.service';
import * as moment from 'moment';

declare var jQuery: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'nd-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit , OnDestroy, AfterViewInit {

  sessionId: string;
  analytics: Array<any>;
  queries: Array<any>;
  totalCards: number;
  currentCard: number;
  analysisFetched: boolean;
  queriesFetched: boolean;
  private subscription: Subscription;

  constructor(private conf: ConfigurationService,
  private analyticsService: SessionAnalyticsService,
  private route: ActivatedRoute,
  private queryService: QueriesService) {
    this.totalCards = 0;
    this.currentCard = 1;
    this.analysisFetched = false;
    this.queriesFetched = false;
 }

  ngOnInit() {
     this.subscription = this.route.params.subscribe(params => {
        this.sessionId = params['id'];
        mixpanel.time_event('ViewCarousel');
        if (!this.analytics) {
           this.analyticsService.getSessionAnalysis(this.sessionId)
            .subscribe(response => this.mapAnalysis(response),
               (error => console.log(error)),
              () => this.analysisFetched = true);
        } else {
          this.analysisFetched = true;
          this.totalCards = this.analytics.length;
         
        }
        if (!this.queries) {
          this.queryService.getQueries(this.sessionId)
           .subscribe(response => this.mapQueries(response),
              (error => console.log(error)),
              () => this.queriesFetched = true);
        } else {
          this.queriesFetched = true;
        }
    });
  }

  ngAfterViewInit() {
     jQuery('.carousel-inner .item').removeClass( 'active' );
     jQuery('#s'+this.currentCard).addClass( 'active' );
  }

private mapQueries(response) {
    this.queries = response.queries;
    this.queries.forEach(element => {
       element.created_at = moment.utc(element.created_at).local().fromNow();
    });
  }

  private mapAnalysis(response) {
    if (response.type === 'Success') {
       this.analytics = response.answers;
       this.currentCard = 1;
       this.totalCards = this.analytics.length;
    } else {
      this.analytics = [];
    }
  }


 ngOnDestroy() {
    this.subscription.unsubscribe();
    mixpanel.track('ViewCarousel', {'user': this.conf.getUser().emailId});
 }

  nextModal(event) {
    if (this.currentCard !== this.totalCards) {
          jQuery('.carousel-inner .item').removeClass( 'active' );
           this.currentCard = Number(this.currentCard) + 1;
          jQuery('#s' + this.currentCard).addClass('active');
    }
   }


  previousModal(event) {
        if (1 !== this.currentCard) {
          jQuery('.carousel-inner .item').removeClass( 'active' );
           this.currentCard = Number(this.currentCard) - 1;
          jQuery('#s' + this.currentCard).addClass('active');
        }
   }

   showChart(event) {
        jQuery('.image_video_container .carousel-charts').css({'display': 'block'});
        jQuery('.choice_percent').css({'display': 'block'});
        jQuery('.image_video_container .image_container, .image_video_container .video_container ').css({'display': 'none'});
   }

   hideChart(event) {
        jQuery('.image_video_container .carousel-charts').css({'display': 'none'});
        jQuery('.choice_percent').css({'display': 'none'});
        jQuery('.image_video_container .image_container, .image_video_container .video_container').css({'display': 'block'});
   }

}
