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
 };

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

