import {  Component, Input, OnInit, OnDestroy  , ViewChild} from '@angular/core';
import { EditService } from '../../services/edit.service';
import { Subscription }   from 'rxjs/Subscription';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';


@Component({
  selector: 'barchart',
  templateUrl: './barchart.html',
  styles: ['./barchart.css']
})
export class BarChartComponent implements OnInit, OnDestroy {

 @Input() answer: any;
 barChartData = [];
 barChartType = 'bar';
 barChartLabels = [];
 barChartColor=  [];

 subscription: Subscription;
 @ViewChild(BaseChartDirective) chart: BaseChartDirective;

 barChartOptions = {
   scaleShowVerticalLines: false,
   responsive: true,
   tooltips: {
      enabled: false,
      mode: 'label',
   },
   hover: {
      mode: 'single',
      intersect: false,
  },
  scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              min: 0
            }
          }]
   },

  animation: {
        onComplete: function() {
           this.chart.controller.draw();
           let ctx = this.chart.ctx;
           let width = this.chart.width;
           let height = this.chart.height;
           let fontSize = (height / 114).toFixed(2);
           ctx.font = '10px  Verdana';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'top';
           this.data.datasets.forEach(function (dataset) {
            for (let i = 0; i < dataset.data.length; i++) {
              let model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
              ctx.fillStyle = '#fff';
              ctx.fillText(dataset.data[i], model.x, model.y);
            }
      });
    }
  }


 };



 constructor(private editService: EditService) {
    this.subscription = this.editService.updateSubscription()
              .subscribe(data => this.updateChart(data));
 }

 updateChart(data) {

   this.chart.chart.data.datasets[0].data = Array.from(this.answer.analytics).map(record => record['total']);
   this.chart.chart.update();

 }

 chartClicked(e) {
  }

  chartHovered(e) {
// console.log(e);
  }

   ngOnInit() {
    this.update();
  }


  update() {
    this.barChartData = [];
    this.barChartLabels = [];
    let barData = new Array();
    
    this.answer.analytics.forEach(data => {
          barData.push(data.total);
          let splittedlabel = data.label;
          if (data.label.length > 7) {
             splittedlabel = data.label.substring(0, 7 ) + '...';
             this.barChartLabels.push(splittedlabel);
          } else {
             this.barChartLabels.push(data.label);
          }
      });
    if (this.answer.question_scope === 'survey')  {
        this.barChartColor = [{ backgroundColor: ['#E9722B', '#276AAD', '#46782C', '#612B96'], borderColor: '#97BBCD', borderWidth: 0} ];
    } else {
        let wrong_answer = '#FF2101';
        let right_answer = '#97CF58';
        let colors = [];
        for(let label of this.barChartLabels) {
            if(this.answer.correct_answers && this.answer.correct_answers.includes(label)){
              colors.push(right_answer);
            } else {
              colors.push(wrong_answer);
            }
        }
        this.barChartColor = [{ backgroundColor: colors,
                borderColor: '#97BBCD', borderWidth: 0} ];
    }
    this.barChartData.push(barData);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
 }
}