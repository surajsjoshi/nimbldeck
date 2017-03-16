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
   scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              max: 2,
              min: 0,
              stepSize: 1
            }
          }]
        },

 };
 private pieChartColor: any[] = [{ backgroundColor: ["#EAF1F5", "#DCDCDC"], borderColor: '#97BBCD', borderWidth: 2}]

 constructor() {

 }

 chartClicked(e) {
  }

  chartHovered(e) {

  }

   ngOnInit() {
    this.barChartData = [];
    this.barChartLabels = [];
    let barData = new Array();

    this.analytics.forEach(data => {
          barData.push(data.total);
          this.barChartLabels.push(data.label);
      });
      this.barChartData.push(barData);
  }
}

