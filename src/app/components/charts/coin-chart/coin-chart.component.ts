declare var require: any;
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from "@angular/core";
import * as Highcharts from 'highcharts/highstock';
import HIndicatorsAll from "highcharts/indicators/indicators-all";
import HIndicators from "highcharts/indicators/indicators";
import HAccessability from "highcharts/modules/accessibility";
import HDragPanes from "highcharts/modules/drag-panes";
import HExporting from "highcharts/modules/exporting"
import HHightContrastDark from "highcharts/themes/high-contrast-dark"
import HAnnotationsAdvanced from "highcharts/modules/annotations-advanced";
import HPriceIndicator from "highcharts/modules/price-indicator";
import HStockTools from "highcharts/modules/stock-tools";
import { CoinMarketChartResponse } from "src/app/models/coin-gecko";
import { ChartService } from "../chart.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CHART_TYPE } from "src/app/constants";
import { HighchartsChartComponent, HighchartsChartModule } from "highcharts-angular";
import { ThemeService } from "src/app/services/theme.service";

HIndicators(Highcharts);
HIndicatorsAll(Highcharts);
HDragPanes(Highcharts);
HExporting(Highcharts);
HAnnotationsAdvanced(Highcharts);
HPriceIndicator(Highcharts);
HStockTools(Highcharts);
HHightContrastDark(Highcharts);
HAccessability(Highcharts);

@Component({
  selector: 'app-coin-chart',
  templateUrl: './coin-chart.component.html',
  styles: [``],
  standalone: true,
  imports: [HighchartsChartModule]
})
export class CoinChartComponent implements OnInit, OnDestroy, OnChanges {
  /** price | marketcap | volume | ohlc */
  @Input('chartDataType') chartDataType: string;
  @Input('themeProvider') themeProvider: ThemeService

  @Output() loading: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('highchart') highchart!: HighchartsChartComponent;
  chartInstance: Highcharts.Chart;
  updateFlag: boolean;
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

  private theme: string;
  private isInitialized = false;

  constructor(
    public chartService: ChartService,
    public cd: ChangeDetectorRef
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
    this.themeProvider.themeSource$.subscribe(
      (theme) => {
        this.theme = theme;
        this.reload();
      });
  }

  reflow() {
    this.chartInstance.reflow();
  }

  reload() {
    this.loading.emit(true);
    this.chartService.masterData.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (responseData) => {
        this.setChartData(responseData);
        switch (this.chartDataType) {
          case CHART_TYPE.PRICE:
            this.chartOptions = this.getLineChartOptions();
            break;
          case CHART_TYPE.VOLUME:
            this.chartOptions = this.getVolumeChartOptions();
            break;
          default:
            this.chartOptions = this.getLineChartOptions();
        }
        this.cd.detectChanges();
      },
      complete: () => {
        this.loading.emit(false);
      },
      error: () => {
        this.loading.emit(false);
      }
    });
  }

  getLineChartOptions(): Highcharts.Options {
    return {
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "separator",
              "downloadPNG",]
          }
        },

      },
      rangeSelector: {
        inputStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color'),
          fontWeight: 'bold'
        },
        labelStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color'),
          fontWeight: 'bold'
        },
        buttonTheme: {
          fill: this.themeProvider.getCssVariableValue('--chart-bg-color'),
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color'),
            fontWeight: 'bold'
          },
          states: {
            hover: {
              fill: this.themeProvider.getCssVariableValue('--hover-bg-fancy'),
              stroke: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              style: {
                color: this.themeProvider.getCssVariableValue('--text-color'),
                fontWeight: 'bold'
              },
            },
            select: {
              fill: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              stroke: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              style: {
                color: this.themeProvider.getCssVariableValue('--text-color'),
                fontWeight: 'bold'
              },
            }

          }
        },
        selected: 5,
      },
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      tooltip: {
        split: false,
        valueDecimals: 2,
        valuePrefix: '$',
      },
      chart: {
        backgroundColor: this.themeProvider.getCssVariableValue('--chart-bg-color'),
        plotBackgroundColor: this.themeProvider.getCssVariableValue('--chart-bg-color'),
        reflow: true,
      },
      plotOptions: {
        series: {
          color: this.themeProvider.getCssVariableValue('--chart-line-color'),
          showInLegend: true,
          accessibility: {
            description: 'Price Chart',
            enabled: true,
            exposeAsGroupOnly: true
          }
        },
        line: {
          color: this.themeProvider.getCssVariableValue('--chart-line-color'),
          dataLabels: {
            enabled: false
          },
          enableMouseTracking: true
        }
      },
      navigator: {
        enabled: false
      },
      legend: {
        itemStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color')
        },
        itemHoverStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color-secondary')
        },
        enabled: true,
        navigation: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        }

      },
      yAxis: [{
        title: {
          text: 'Price'
        },
        height: '100%',
        resize: {
          enabled: true
        },
        lineWidth: 2,
        labels: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        }
      }],
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        }
      },
      stockTools: {
        gui: {
          enabled: false,
        }
      },

      series: [{
        type: 'line',
        name: '$USD',
        color: this.themeProvider.getCssVariableValue('--chart-line-color'),
        data: this.prices,
      }],
    };
  }


  getVolumeChartOptions(): Highcharts.Options {
    return {
      exporting: {
        buttons: {
          contextButton: {
            menuItems: [
              "viewFullscreen",
              "separator",
              "downloadPNG",]
          }
        },

      },
      rangeSelector: {
        inputStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color'),
          fontWeight: 'bold'
        },
        labelStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color'),
          fontWeight: 'bold'
        },
        buttonTheme: {
          fill: this.themeProvider.getCssVariableValue('--chart-bg-color'),
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color'),
            fontWeight: 'bold'
          },
          states: {
            hover: {
              fill: this.themeProvider.getCssVariableValue('--hover-bg-fancy'),
              stroke: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              style: {
                color: this.themeProvider.getCssVariableValue('--text-color'),
                fontWeight: 'bold'
              },
            },
            select: {
              fill: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              stroke: this.themeProvider.getCssVariableValue('--chart-bg-color'),
              style: {
                color: this.themeProvider.getCssVariableValue('--text-color'),
                fontWeight: 'bold'
              },
            }

          }
        },
        selected: 5,
      },
      credits: {
        enabled: false
      },
      title: {
        text: ''
      },
      chart: {
        backgroundColor: this.themeProvider.getCssVariableValue('--chart-bg-color'),
        plotBackgroundColor: this.themeProvider.getCssVariableValue('--chart-bg-color'),
        reflow: true,
      },
      plotOptions: {
        series: {
          color: this.themeProvider.getCssVariableValue('--chart-line-color'),
          showInLegend: true,
          accessibility: {
            description: 'Price Chart',
            enabled: true,
            exposeAsGroupOnly: true
          }
        },
        line: {
          color: this.themeProvider.getCssVariableValue('--chart-line-color'),
          dataLabels: {
            enabled: false
          },
          enableMouseTracking: true
        }
      },
      navigator: {
        enabled: false
      },
      legend: {
        itemStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color')
        },
        itemHoverStyle: {
          color: this.themeProvider.getCssVariableValue('--text-color-secondary')
        },
        enabled: true,
        navigation: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        }

      },
      yAxis: [{
        title: {
          text: 'Volume',
        },
        height: '100%',
        lineWidth: 1,
        labels: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        },
        resize: {
          enabled: false
        }

      }],
      xAxis: {
        type: 'datetime',
        labels: {
          style: {
            color: this.themeProvider.getCssVariableValue('--text-color')
          }
        }
      },
      stockTools: {
        gui: {
          enabled: false,
        }
      },
      series: [{
        type: 'column',
        id: 'volume',
        name: 'Volume',
        color: this.themeProvider.getCssVariableValue('--chart-volume-color'),
        data: this.total_volumes,
      }],
    };
  }
}