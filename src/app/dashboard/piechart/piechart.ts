

import { Component, Input, OnInit, ElementRef } from '@angular/core';



@Component({
  selector: 'piechart',
  templateUrl: './piechart.html',
  styles: ['./piechart.css']

})
export class PieChartComponent implements OnInit {

   @Input() chartdata: any;
   @Input() analytics: any;
   public pieChartData = [];
   private pieChartLabels = [];
   private pieChartType = 'pie';
   private pieChartColor: any[] =  [{ backgroundColor: ['#E9722B', '#276AAD'] }];
   private pieChartOptions = {
      tooltips: {
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

 };

 constructor() {
}


  ngOnInit() {

      this.pieChartData = [];
      this.pieChartLabels = [];
      this.analytics.forEach(data => {
           this.pieChartData.push(data.total);
           this.pieChartLabels.push(data.label);
      });
  }

  // Pie
}

