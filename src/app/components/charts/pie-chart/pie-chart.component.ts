import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as Highcharts from "highcharts/highcharts";
import { PieChartData } from 'src/app/models/portfolio';
import HAccessability from "highcharts/modules/accessibility";
import HExporting from "highcharts/modules/exporting";
import HExportData from "highcharts/modules/export-data";
import { Observable, Subject } from 'rxjs';
import { PieChartService } from './pie-chart.service';
import { takeUntil } from 'rxjs/operators';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';


HExporting(Highcharts);
HExportData(Highcharts);
HAccessability(Highcharts);

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  standalone: true,
  imports: [HighchartsChartModule],
  providers: [PieChartService]
})
export class PieChartComponent implements OnInit, OnDestroy {
  @Input('title') title: string;
  @Input('provider') provider: Observable<any>;

  @ViewChild('highchart') highchart!: HighchartsChartComponent;

  Highcharts: typeof Highcharts = Highcharts;
  chartInstance: Highcharts.Chart;
  updateFlag: boolean = true;
  chartOptions: Highcharts.Options = {};
  chartData: PieChartData[] = [];
  destroySubject$: Subject<boolean> = new Subject<boolean>();


  constructor(
    private cd: ChangeDetectorRef,
    private service: PieChartService
  ) { }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  ngOnInit(): void {
    this.service.dataSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      (result) => {
        if (result) {
          this.setData(result);
          this.reflow();
        }
      }
    )
  }

  reflow() {
    if (this.chartInstance) {
      this.chartInstance.reflow();
      this.updateFlag = true;
      this.cd.detectChanges();
    }
  }

  setData(data: any) {
    this.chartData = this.getChartData(data);
    this.chartOptions = {
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "separator",
              "downloadPNG"]
          }
        }
      },
      chart: {
        plotBackgroundColor: 'transparent',
        plotBorderColor: '#ffffff00',
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: '#ffffff00',
        plotShadow: false,
        reflow: true,
      },
      credits: {
        enabled: false,
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
        type: 'pie',
        allowPointSelect: true,
        keys: ['name', 'y', 'selected', 'sliced'],
        data: this.chartData,
        showInLegend: true
      }]

    }
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

