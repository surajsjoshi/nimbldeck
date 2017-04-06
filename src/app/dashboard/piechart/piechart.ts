

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
