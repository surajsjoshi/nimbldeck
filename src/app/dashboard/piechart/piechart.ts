
import { Component, Input, OnInit, OnDestroy  , ViewChild } from '@angular/core';
import { EditService } from '../../services/edit.service';
import { Subscription }   from 'rxjs/Subscription';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';


@Component({
  selector: 'piechart',
  templateUrl: './piechart.html',
  styles: ['./piechart.css']

})
export class PieChartComponent implements OnInit, OnDestroy {

   @Input() chartdata: any;
   @Input() answer: any;
   public pieChartData = [];
   pieChartLabels = [];
   pieChartType = 'pie';
   pieChartColor: any[] =  [{ backgroundColor: ['#E9722B', '#276AAD'] }];

   subscription: Subscription;
   @ViewChild(BaseChartDirective) chart: BaseChartDirective;

   pieChartOptions = {
      tooltips: {
        enabled: false,
        callbacks: {
          title: function() {
            return '';
         },
      label: function(tooltipItem, data) {
          let dataLabel = data.labels[tooltipItem.index];
          let value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return dataLabel + value;
        }
      }
 },

   animation: {
        onComplete: function() {
           this.chart.controller.draw();
           let ctx = this.chart.ctx;
           ctx.textAlign = 'center';
           ctx.textBaseline = 'bottom';
           this.data.datasets.forEach(function (dataset) {
            for (let i = 0; i < dataset.data.length; i++) {
              let model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
              total = dataset._meta[Object.keys(dataset._meta)[0]].total,
              mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
              start_angle = model.startAngle,
              end_angle = model.endAngle,
              mid_angle = start_angle + (end_angle - start_angle)/2;

              let x = mid_radius * Math.cos(mid_angle);
              let y = mid_radius * Math.sin(mid_angle);

              ctx.fillStyle = '#fff';
              if (i === 3)  { // Darker text color for lighter background
                ctx.fillStyle = '#444';
              }
            let percent = String(Math.round(dataset.data[i] / total* 100)) + ' % ';
            ctx.fillText(dataset.data[i], model.x + x, model.y + y);
          // Display percent in another line, line break doesn't work for fillText
            ctx.fillText(percent, model.x + x, model.y + y + 15);
        }
      });


        }
   }
  }
 constructor(private editService: EditService) {
    this.subscription = this.editService.updateSubscription()
              .subscribe(data => this.updateChart(data));

}

 updateChart(data) {
   this.chart.chart.data.datasets[0].data = Array.from(this.answer.analytics).map(record => record['total']);
   this.chart.chart.update();
 }

  ngOnInit() {

      this.pieChartData = [];
      this.pieChartLabels = [];
      this.answer.analytics.forEach(data => {
           this.pieChartData.push(data.total);
           this.pieChartLabels.push(data.label);
           let a = 1;
           if (this.answer.question_scope === 'survey') {
              this.pieChartColor = [{ backgroundColor: ['#E9722B', '#276AAD'] }];
           } else {
               let wrong_answer = '#FF2101';
               let right_answer = '#97CF58';
            this.pieChartColor = [{ backgroundColor: [right_answer, wrong_answer] }];
        }



      });
  }

    ngOnDestroy() {
    this.subscription.unsubscribe();
 }
}

