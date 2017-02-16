import { ConfigurationService } from '../../services/configuration.service';
import { Component, OnInit, ElementRef, ComponentFactoryResolver, ViewContainerRef, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

declare var jQuery: any;
declare var ga: any;

@Component({
  selector: 'choosecardtype',
  templateUrl: './choosecardtype.component.html',
  styleUrls: ['./choosecardtype.component.css'],
  outputs: ['onShowTextCard', 'onShowRatingCard', 'onShowShortAnswerCard', 'onShowMcqCard', 'onShowYesNoCard']
})
export class ChoosecardtypeComponent {

  onShowTextCard: EventEmitter<boolean>;
  onShowRatingCard: EventEmitter<boolean>;
  onShowShortAnswerCard: EventEmitter<boolean>;
  onShowMcqCard: EventEmitter<boolean>;
  onShowYesNoCard: EventEmitter<boolean>;

  constructor(private conf: ConfigurationService,
    private el: ElementRef) {

      this.onShowTextCard = new EventEmitter<boolean>();
      this.onShowShortAnswerCard = new EventEmitter<boolean>();
      this.onShowRatingCard = new EventEmitter<boolean>();
      this.onShowMcqCard = new EventEmitter<boolean>();
      this.onShowYesNoCard = new EventEmitter<boolean>();

      ga('set', 'userId', this.conf.getUser().userId);
      ga('send', 'pageview', '/sessions/choosecard');

   }

 showTextCard(evt) {
    evt.preventDefault();
    jQuery(this.el.nativeElement).find('#choose-card-modal').closeModal();
    this.onShowTextCard.emit(true);

  }

  showRatingCard(evt) {
    evt.preventDefault();
    jQuery(this.el.nativeElement).find('#choose-card-modal').closeModal();
    this.onShowRatingCard.emit(true);
  }

  showShortAnswerCard(evt) {
    evt.preventDefault();
    jQuery(this.el.nativeElement).find('#choose-card-modal').closeModal();
    this.onShowShortAnswerCard.emit(true);
  }

  showMcqCard(evt) {
    evt.preventDefault();
    jQuery(this.el.nativeElement).find('#choose-card-modal').closeModal();
    this.onShowMcqCard.emit(true);
  }

  showYesNoCard(evt) {
    evt.preventDefault();
    jQuery(this.el.nativeElement).find('#choose-card-modal').closeModal();
    this.onShowYesNoCard.emit(true);
  }

}
