import { Component, OnInit, Input , OnDestroy} from '@angular/core';
import { EditService } from '../../services/edit.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'rate',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit, OnDestroy {

  max = 5;
  rate = 2;
  index = [1, 2, 3, 4, 5];
  @Input() answer: any;
  overStar: number;
  percent: number;
  averageRate: number;
  ratings = {};
  titles: string[];
  subscription: Subscription;

  constructor(private editService: EditService) {
   this.titles = ['One Star', 'Two Star', 'Three Star', 'Four Star', 'Five Star'];
   this.subscription = this.editService.updateSubscription()
              .subscribe(data => this.updateChart(data));
  }

  updateChart(data) {
      this.averageRate = this.getRating(this.answer.average);
      this.answer.analytics.forEach(chartData => {
            this.ratings[this.getRating(chartData.label)] = chartData.total;
       });
  }

  ngOnInit() {
      this.updateChart(null);
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

    ngOnDestroy() {
    this.subscription.unsubscribe();
 }
}
