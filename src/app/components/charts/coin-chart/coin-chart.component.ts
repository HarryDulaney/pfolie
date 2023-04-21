declare var require: any;
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import * as Highcharts from 'highcharts/highstock';
import HIndicatorsAll from "highcharts/indicators/indicators-all";
import HAccessability from "highcharts/modules/accessibility";
import HDragPanes from "highcharts/modules/drag-panes";
import HHightContrastDark from "highcharts/themes/high-contrast-dark"
import HAnnotationsAdvanced from "highcharts/modules/annotations-advanced";
import HPriceIndicator from "highcharts/modules/price-indicator";
import HStockTools from "highcharts/modules/stock-tools";
import { CoinMarketChartResponse } from "src/app/models/coin-gecko";
import { ChartService } from "../chart.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CHART_TYPE } from "src/app/constants";
import { HighchartsChartModule } from "highcharts-angular";

HIndicatorsAll(Highcharts);
HDragPanes(Highcharts);
HAnnotationsAdvanced(Highcharts);
HPriceIndicator(Highcharts);
HStockTools(Highcharts);
HHightContrastDark(Highcharts);
HAccessability(Highcharts);

@Component({
  selector: 'app-coin-chart',
  templateUrl: './coin-chart.component.html',
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HighchartsChartModule]
})
export class CoinChartComponent implements OnInit, OnDestroy, OnChanges {
  /** price | marketcap | volume | ohlc */
  @Input('chartDataType') chartDataType: string;
  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  chartOptions: Highcharts.Options = {};
  prices: Array<Array<number>>;
  market_caps: Array<Array<number>>;
  total_volumes: Array<Array<number>>;

  upColor = '#ec0000';
  upBorderColor = '#8A0000';
  downColor = '#00da3c';
  downBorderColor = '#008F28';

  Highcharts: typeof Highcharts = Highcharts;
  ohlc = [];
  volume = [];
  destroySubject$ = new Subject();

  constructor(
    public chartService: ChartService,
    private cd: ChangeDetectorRef
  ) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartDataType) {
      this.reload();
    }
  }

  ngOnDestroy(): void {
    this.chartService.masterData.next({} as CoinMarketChartResponse);
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  setChartData(responseData: CoinMarketChartResponse) {
    this.prices = responseData.prices;
    this.total_volumes = responseData.total_volumes;
    this.market_caps = responseData.market_caps;
  }


  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading.emit(true);
    this.chartService.masterData.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (responseData) => {
        this.setChartData(responseData);
        const baseOptions = this.getBaseOptions();
        switch (this.chartDataType) {
          case CHART_TYPE.OHLC:
            this.chartOptions = this.getOHLCChartOptions(baseOptions);
            break;
          case CHART_TYPE.PRICE:
            this.chartOptions = this.getPriceAreaChartOptions(baseOptions);
            break;
          case CHART_TYPE.VOLUME:
            this.chartOptions = this.getVolumeChartOptions(baseOptions);
            break;
          case CHART_TYPE.MARKET_CAP:
            this.chartOptions = this.getMarketCapChartOptions(baseOptions);
            break;
          default:
            this.chartOptions = this.getPriceAreaChartOptions(baseOptions);
        }
        this.cd.markForCheck();
      },
      complete: () => {
        this.loading.emit(false);
      },
      error: () => {
        this.loading.emit(false);
      }
    });
  }


  getBaseOptions(): Highcharts.Options {
    return {
      credits: {
        enabled: false
      },
      title: {
        text: this.chartService.coinName
      },
      chart: {
        backgroundColor: '#00000000',
        panning: {
          enabled: true,
          type: 'x',

        },
        reflow: true,
        panKey: 'shift',
        zooming: {
          type: "x",
        }
      },
      navigator: {
        enabled: false
      },
      yAxis: [],
      tooltip: {
        shared: true,
      },
      stockTools: {
        gui: {
          enabled: true,
          definitions: {
            fullScreen: {
              symbol: 'url(https://static.thenounproject.com/png/1985-200.png)'
            }
          }
        }
      },
      series: [],
      rangeSelector: {
        selected: 5,
      },
    };
  }

  getPriceAreaChartOptions(baseOptions: Highcharts.Options): Highcharts.Options {
    baseOptions.yAxis = [{
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Price'
      },
      height: '100%',
      lineWidth: 2,
      resize: {
        enabled: true
      }
    }];

    baseOptions.tooltip = {
      split: true
    };

    baseOptions.stockTools = {
      gui: {
        enabled: true,
      }
    };
    baseOptions.series = [{
      type: 'area',
      name: '$USD',
      data: this.prices,
      tooltip: {
        valueDecimals: 2
      }
    }];

    return baseOptions;
  }

  getMarketCapChartOptions(baseOptions: Highcharts.Options): Highcharts.Options {
    baseOptions.yAxis = [{

      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Market Cap'
      },
      height: '100%',
      offset: 0,
      lineWidth: 2
    }];

    baseOptions.tooltip = {
      split: true
    };

    baseOptions.series = [
      {
        type: "area",
        name: 'Total',
        data: this.market_caps,
        tooltip: {
          valueDecimals: 2
        }
      }
    ];
    return baseOptions;

  }



  getVolumeOnlyChartOptions(baseOptions: Highcharts.Options): Highcharts.Options {
    baseOptions.yAxis = [{
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Volume'
      },
      height: '100%',
      offset: 0,
      lineWidth: 2
    }];

    baseOptions.tooltip = {
      split: true
    };


    baseOptions.series = [
      {
        type: "area",
        name: 'Total',
        data: this.total_volumes,
        yAxis: 1
      }];

    return baseOptions;
  }

  getVolumeChartOptions(baseOptions: Highcharts.Options): Highcharts.Options {
    baseOptions.yAxis = [{
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Volume'
      },
      height: '100%',
      offset: 0,
      lineWidth: 2
    }];

    baseOptions.tooltip = {
      split: true
    };
    baseOptions.series = [
      {
        type: "column",
        name: 'Total',
        data: this.total_volumes,
      }];

    return baseOptions;
  }

  getOHLCChartOptions(baseOptions: Highcharts.Options): Highcharts.Options {
    return {
      chart: {
        backgroundColor: '#00000000',
        zooming: {
          type: "xy",
        }
      },
      yAxis: [
        {
          labels: {
            align: "left"
          },
          height: "80%",
          resize: {
            enabled: true
          }
        },
        {
          labels: {
            align: "left"
          },
          top: "80%",
          height: "20%",
          offset: 0
        }
      ],
      tooltip: {
        shape: "square",
        headerShape: "callout",
        borderWidth: 0,
        shadow: false,
        positioner: function (width, height, point) {
          let chart = this.chart;
          let position;
          //console.log("chart:",chart);
          if (point.isHeader) {
            position = {
              x: Math.max(
                // Left side limit
                chart.plotLeft,
                Math.min(
                  point.plotX + chart.plotLeft - width / 2,
                  // Right side limit
                  chart.chartWidth - width - (chart.chartWidth / 2)
                )
              ),
              y: point.plotY
            };
          } else {
            position = {
              x: point.series.chart.plotLeft,
              y: point.series.yAxis.max - chart.plotTop
            };
          }

          return position;
        }
      },
      series: [
        {
          type: "ohlc",
          id: this.chartService.coinId + '-ohlc',
          name: this.chartService.coinId + " Price",
          data: this.ohlc
        },
        {
          type: "column",
          id: this.chartService.coinId + "-volume",
          name: this.chartService.coinId + " Volume",
          data: this.volume,
          yAxis: 1
        }
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 800
            },
            chartOptions: {
              rangeSelector: {
                inputEnabled: false
              }
            }
          }
        ]
      }
    }
  }


}
