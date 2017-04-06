
import { Component, Input, OnInit } from '@angular/core';
import {Session} from '../../shared/models/session';

declare var jQuery: any;

@Component({
  selector: 'questionchartbox',
  templateUrl: './questionchartbox.html',
  styles: ['./questionchartbox.css']

})
export class QuestionChartBoxComponent implements OnInit {
  @Input() answer: any;
  @Input() index: number;
  @Input() page: number;
  @Input() perPage: number;
  @Input() session: Session;

  constructor() {}

  ngOnInit() {
  //    this.questionNumber = this.perPage * (this.page - 1) + this.index + 1;
  }


  openModal(event) {

    jQuery("#myModal").openModal();
    
  }

NextModal(event) {
   
   //let num=jQuery('.carousel-inner .item .active').index();

jQuery("#s1").hide();
  jQuery("#s2").hide();
  jQuery("#s3").hide();

      
        jQuery("#s3").show();
      
  

  


   }


}
