import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'rate',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {

  max = 5;
  rate = 2;
  index = [1, 2, 3, 4, 5];
  @Input() answer: any;
  overStar: number;
  percent: number;
  averageRate: number;
  ratings = {};
  titles: string[];

  constructor() {
   this.titles = ['One Star', 'Two Star', 'Three Star', 'Four Star', 'Five Star'];
  }

  ngOnInit() {
      this.averageRate = this.getRating(this.answer.average);
      this.answer.analytics.forEach(data => {
            this.ratings[this.getRating(data.label)] = data.total;
       });
  }

  public hoveringOver(value: number) {
    // this.overStar = value;
   // this.percent = 100 * (value / this.max);
  };

  public resetStar() {
    this.overStar = void 0;
  }

  private getRating(label) {
     switch (label) {
        case 'OneStar':
           return 1;
        case 'TwoStar':
            return 2;
        case 'ThreeStar':
            return 3;
        case 'FourStar':
            return 4;
        case 'FiveStar':
            return 5;
         default:
            return 0;
        }
    }
}
