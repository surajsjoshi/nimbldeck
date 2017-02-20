import { Component, OnInit, Input } from '@angular/core';
import { D3Service } from 'd3-ng2-service';

@Component({
  selector: 'wordcloud',
  templateUrl: './wordcloud.component.html',
  styleUrls: ['./wordcloud.component.css']
})
export class WordcloudComponent implements OnInit {

  @Input() analytics: any;
  words = [];

  constructor(private d3Service: D3Service) {
    
  }



  ngOnInit() {
     this.analytics.forEach(data => {
          let old = JSON.stringify(data).replace('label', 'text').replace('total', 'weight');
          this.words.push(JSON.parse(old));
    });
  }

}
