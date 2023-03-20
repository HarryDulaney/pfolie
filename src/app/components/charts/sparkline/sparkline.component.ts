import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-sparkline',
  templateUrl: './sparkline.component.html',
  styleUrls: ['./sparkline.component.scss']
})
export class SparklineComponent implements AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas: ElementRef;
  lineChart: any;

  @Input('chart-data') chartData: any[];
  @Input('xaxis-labels') xAxisLabels: string[];
  @Input('maxHeight') maxHeight: string;
  @Input('maxWidth') maxWidth: string;


  ngAfterViewInit(): void {
    this.draw();
  }


  afterContentChecked(): void {
    this.draw();
  }

  draw() {
    this.lineChart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.xAxisLabels,
        datasets: [
          {
            data: this.chartData,
            fill: true
          }
        ]
      },
      options: {
        hover: {
          mode: null
        },
        responsive: true,
        elements: {
          line: {
            backgroundColor: 'transparent',
            borderColor: '#006aff',
            borderWidth: 2,
            borderJoinStyle: 'round'
          },
          point: {
            radius: 0,
          }
        },
        scales: {
          y:
          {
            display: false
          },
          x:
          {
            display: false
          },
        },
        plugins: {
          tooltip: {
            enabled: false
          },
          legend: {
            display: false
          },
        }
      }
    });
  }
}
