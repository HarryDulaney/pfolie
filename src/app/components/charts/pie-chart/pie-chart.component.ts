import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from "highcharts/highcharts";
import { PieChartData } from 'src/app/models/portfolio';
import HBrandDark from "highcharts/themes/dark-blue"
import HAccessability from "highcharts/modules/accessibility";
import { Subject } from 'rxjs';
import { PieChartService } from './pie-chart.service';
import { takeUntil } from 'rxjs/operators';

HBrandDark(Highcharts);
HAccessability(Highcharts);

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html'
})
export class PieChartComponent implements OnInit, OnDestroy {
  @Input('title') title: string;
  @Input() pieChartService: PieChartService;


  Highcharts: typeof Highcharts = Highcharts;

  chartData: PieChartData[] = [];
  chartOptions: any;
  destroySubject$ = new Subject();


  constructor(
    private cd: ChangeDetectorRef,
  ) { }


  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }


  ngOnInit(): void {
    this.pieChartService.pieData.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      (result) => {
        this.setData(result);
      }
    )
  }

  setData(data: any) {
    this.chartData = this.getChartData(data);
    this.chartOptions = {
      chart: {
        type: 'pie',
        plotBackgroundColor: 'transparent',
        plotBorderColor: '#ffffff00',
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: '#ffffff00',
        plotShadow: false,
      },
      title: {
        text: this.title,
      },
      plotOptions: {
        pie: {
          accessibility: {
            description: 'Pie chart.',
            enabled: true
          },

          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        name: 'Pie',
        colorByPoint: true,
        data: this.chartData
      }]
    }
    this.cd.detectChanges();
  }


  getChartData(data: any): PieChartData[] {
    let formatedData = [];
    let i = 0;
    for (const key in data) {
      let value = data[key];
      if (i === 0) {
        i++;
        formatedData.push({ name: key, y: value, sliced: true, selected: true } as PieChartData);
      } else {
        formatedData.push({ name: key, y: value } as PieChartData);
      }
    }

    return formatedData;
  }

  sortByAllocation(pieChartData: PieChartData[]): PieChartData[] {
    let result = Array.from(pieChartData);
    result.sort((a, b) => a.y > b.y ? 1 : -1);
    return result;
  }

}

