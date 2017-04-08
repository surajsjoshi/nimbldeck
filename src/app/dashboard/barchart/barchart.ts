import {  Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'barchart',
  templateUrl: './barchart.html',
  styles: ['./barchart.css']
})
export class BarChartComponent implements OnInit {

 @Input() analytics: any;
 barChartData = [];
 barChartType = 'bar';
 barChartLabels = [];

 private barChartOptions = {
   scaleShowVerticalLines: false,
   responsive: true,
   // tooltips: { enabled: true },


  tooltips: {
      enabled: true,
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
           ctx.textAlign = 'center';
           ctx.textBaseline = 'bottom';
           this.data.datasets.forEach(function (dataset) {
            for (let i = 0; i < dataset.data.length; i++) {
              let model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
              ctx.fillText(dataset.data[i], model.x, model.y);
            }
      });
    }

  }


 };
 private pieChartColor: any[] = [{ backgroundColor: ['#E9722B', '#276AAD', '#46782C', '#612B96'], borderColor: '#97BBCD', borderWidth: 0} ];



 constructor() {

 }

 chartClicked(e) {
  }

  chartHovered(e) {
// console.log(e);
  }

   ngOnInit() {
    this.barChartData = [];
    this.barChartLabels = [];
    let barData = new Array();

    this.analytics.forEach(data => {
          barData.push(data.total);
          let splittedlabel = data.label;
          if (data.label.length > 7) {
             splittedlabel = data.label.substring(0, 7 ) + '...';
             this.barChartLabels.push(splittedlabel);
          } else {
             this.barChartLabels.push(data.label);
          }
      });
      this.barChartData.push(barData);

}
}

