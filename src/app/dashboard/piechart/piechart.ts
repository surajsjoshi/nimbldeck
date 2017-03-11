

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
