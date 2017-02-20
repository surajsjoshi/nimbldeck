import { Component, OnInit, Input } from '@angular/core';

declare var jQuery: any;

@Component({
  selector: 'wordcloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.css']
})
export class WordcloudComponent implements OnInit {

  @Input() answer: any;
  words = [];

  constructor() {

  }



  ngOnInit() {
     this.answer.analytics.forEach(data => {
          let old = JSON.stringify(data).replace('label', 'text').replace('total', 'weight');
          this.words.push(JSON.parse(old));
    });
    let tagName = '#jqcloud' + this.answer.question_id;
    setTimeout(function() {
       jQuery(tagName).jQCloud(this.words, {
          width: 400,
          height: 250
       });
    }.bind(this), 1500);
  }

}
