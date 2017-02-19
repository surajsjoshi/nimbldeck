
import { Component, Input, OnInit } from '@angular/core';


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

  constructor() {}

  ngOnInit() {
  //    this.questionNumber = this.perPage * (this.page - 1) + this.index + 1;
  }

}
