import { Component, OnInit, OnDestroy , AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfigurationService } from '../services/configuration.service';
import { SessionAnalyticsService } from '../services/sessionanalytics.service';
import { AnalyticsService } from '../services/analytics.service';
import { QueriesService } from '../services/queries.service';
import * as moment from 'moment';

declare var jQuery: any;
declare var mixpanel: any;

@Component({
  moduleId: module.id,
  selector: 'nd-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  private analyticsUpdateService: AnalyticsService,
  private changeDetectorRef: ChangeDetectorRef,
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

    jQuery('[data-toggle="tooltip"]').tooltip();

  }

  update(analyticsNew: Array<any>) {
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
     jQuery('.carousel-inner .item').removeClass( 'active' );
     jQuery('#s' + this.currentCard).addClass( 'active' );
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

        jQuery('.icon_chart').addClass('active');
        jQuery('.icon_view').removeClass('active');
        jQuery('.icon_chart').addClass('active');
        jQuery('.image_video_container .carousel-charts').css({'display': 'block'});
        jQuery('.choice_percent').css({'display': 'block'});
        jQuery('.image_video_container .main_container ').css({'display': 'none'});
   }

   hideChart(event) {
        jQuery('.icon_chart').removeClass('active');
        jQuery('.icon_view').addClass('active');

        jQuery('.image_video_container .carousel-charts').css({'display': 'none'});
        jQuery('.choice_percent').css({'display': 'none'});
        jQuery('.image_video_container .main_container').css({'display': 'block'});
   }


   get_youtube_frame(event) {
     let code = event.resource_code;
     let url = 'https://www.youtube.com/embed/' + code;
     let frame = '<iframe class="video_img_section"  width="400"  height="220" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
     let frame_container = jQuery('.video_container').attr('id');
     if ( frame_container === code && frame_container !== '') {
        jQuery('.video_container').html(frame);
     }
   }

   get_analitical_percent( analitic, event) {
    let analitical_total = analitic.total;
    let answer_by = event.answered_by;

    if (answer_by !== 0 ) {
      let cal = 100 * analitical_total / answer_by;
      let limit = cal.toFixed(2);
      return limit;
    } else {
      return '0';
    }
   }


    get_avg_total(event) {
    let participants = event.participants;
    let answer_by = event.answered_by;

    if (answer_by !== 0 ) {
      let cal = 100 * answer_by / participants;
      let limit = cal.toFixed();
      return limit;
    } else {
      return '0';
    }
   }

}
