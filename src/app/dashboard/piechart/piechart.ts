

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
   //private pieChartColor: any[] =  [{ backgroundColor: ['#E9722B', '#276AAD'] }];
    pieChartColor=  [];




   constructor() {
  }



 private pieChartOptions = {


tooltips: {
      callbacks: {
        title: function() {
          return '';
        },
        label: function(tooltipItem, data) {
          var dataLabel = data.labels[tooltipItem.index];
          var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

          

          return dataLabel+value;
        }
      }
}


 };

  ngOnInit() {

      this.pieChartData = [];
      this.pieChartLabels = [];
      this.analytics.forEach(data => {
           this.pieChartData.push(data.total);
           this.pieChartLabels.push(data.label);



           let a= 1;

          if(a!=1){ 
          this.pieChartColor = [{ backgroundColor: ['#E9722B', '#276AAD'] }];

          }

          else{
          let wrong_answer='#FF2101';
          let right_answer='#97CF58';
          this.pieChartColor = [{ backgroundColor: [right_answer,wrong_answer] }];
          }



      });
  }

  // Pie
}
