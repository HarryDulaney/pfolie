import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ViewChild } from "@angular/core";
import { GlobalMarketCapData } from "src/app/models/coin-gecko";
import { Observable, Subject, takeUntil } from "rxjs";
import { ChartModule, UIChart } from "primeng/chart";
import * as Const from '../../../constants'

@Component({
  selector: 'app-line-chart',
  styles: [``],
  standalone: true,
  imports: [ChartModule],
  templateUrl: './line-chart.component.html',
})
export class LineChartComponent implements OnInit, OnDestroy {
  @Input('title') title: string;
  @Input('type') type: string;
  @Input('provider') dataProvider: Observable<GlobalMarketCapData>;
  @Input('fillColor') fillColor: string;
  @Input('lineColor') lineColor: string;
  @Input('textColor') textColor: string;
  @Input('backgroundColor') backgroundColor: string;

  @ViewChild('chart') chart: UIChart;

  loading: boolean;
  data: any;
  options: any

  market_cap_labels: Array<string>;
  total_volume_labels: Array<string>;
  market_caps: Array<number>;
  total_volumes: Array<number>;

  destroySubject$ = new Subject();

  constructor(
    public cd: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.create();
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  create() {
    this.loading = true;
    this.dataProvider
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (responseData) => {
          const rawVolumes = responseData.market_cap_chart['volume'];
          const rawMarketCap = responseData.market_cap_chart['market_cap'];
          this.market_cap_labels = this.getLabels(rawMarketCap);
          this.market_caps = this.getValues(rawMarketCap);
          this.total_volume_labels = this.getLabels(rawVolumes);
          this.total_volumes = this.getValues(rawVolumes);
          this.drawChart();
          this.cd.detectChanges();
        },
        complete: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });

  }
  drawChart() {
    switch (this.type) {
      case Const.CHART_TYPE.MARKET_CAP:
        this.data = this.createMarketCapChart(this.market_cap_labels, this.market_caps);
        this.options = this.getOptions();
        break;
      case 'volume':
        this.data = this.createVolumeChart(this.total_volume_labels, this.total_volumes);
        this.options = this.getOptions();
        break;
      default:
        console.log('No chart type provided.');
    }
  }

  getLabels(data: Array<any>): Array<string> {
    let labels = [];
    for (let i = data.length - 1; i >= 0; i--) {
      labels.push(new Date(data[i][0]).toLocaleDateString('en-US'));
    }

    return labels;

  }

  getValues(data: Array<any>): Array<number> {
    let values = [];
    for (let i = data.length - 1; i >= 0; i--) {
      values.push(data[i][1]);
    }

    return values;

  }



  createMarketCapChart(labels: string[], values: any[]): any {
    return {
      labels: labels,
      datasets: [
        {
          label: 'Market Cap',
          data: values,
          fill: true,
        }
      ]
    }
  }


  createVolumeChart(labels: string[], values: any[]) {
    return {
      labels: labels,
      datasets: [
        {
          label: 'Volume',
          data: values,
          fill: true,
          /*           tension: 1,
                    borderJointStyle: 'round',
                    borderColor: this.lineColor,
                    backgroundColor: this.backgroundColor,
                    color: this.fillColor,
                    borderWidth: 2,
                    pointBackgroundColor: this.fillColor,
                    pointBorderColor: this.lineColor,
                    pointBorderWidth: 0, */
        }
      ]
    }
  }
  getOptions() {
    return {
      elements: {
        point: {
          radius: 0,
        },
        line: {
          tension: 1,
          borderColor: this.lineColor,
          backgroundColor: this.backgroundColor,
          color: this.fillColor,
          borderWidth: 2,
          pointBackgroundColor: this.fillColor,
          pointBorderColor: this.lineColor,
          pointBorderWidth: 0, 
          borderJoinStyle: 'round'
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';

              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              }
              return label;
            }
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: this.textColor
          },
          grid: {
            display: false,
          }
        },
        y: {
          ticks: {
            color: this.textColor,
            callback: function (value, index, ticks) {
              return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            }
          },
          grid: {
            display: false,
          }
        }
      }
    }
  }

}