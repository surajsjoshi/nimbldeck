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
barChartColor=  [];
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


 };
 //private barChartColor: any[] = [{ backgroundColor: ['#E9722B', '#276AAD','#46782C', '#612B96'], borderColor: '#97BBCD', borderWidth: 0} ];



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
          let a= 1;

          if(a!=1){ 
          this.barChartColor = [{ backgroundColor: ['#E9722B', '#276AAD','#46782C', '#612B96'], borderColor: '#97BBCD', borderWidth: 0} ];

          }

          else{
          let wrong_answer='#FF2101';
          let right_answer='#97CF58';
          this.barChartColor = [{ backgroundColor: [wrong_answer, wrong_answer,right_answer, wrong_answer], borderColor: '#97BBCD', borderWidth: 0} ];
          }
      });
      this.barChartData.push(barData);

  
}
}

