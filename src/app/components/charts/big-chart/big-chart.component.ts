import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, Inject } from "@angular/core";
import * as Highcharts from 'highcharts/highstock';
import HIndicatorsAll from "highcharts/indicators/indicators-all";
import HIndicators from "highcharts/indicators/indicators";
import HAccessability from "highcharts/modules/accessibility";
import HDragPanes from "highcharts/modules/drag-panes";
import HExporting from "highcharts/modules/exporting"
import HFullScreen from "highcharts/modules/full-screen";
import HHightContrastDark from "highcharts/themes/high-contrast-dark"
import HAnnotationsAdvanced from "highcharts/modules/annotations-advanced";
import HPriceIndicator from "highcharts/modules/price-indicator";
import HStockTools from "highcharts/modules/stock-tools";
import { BigChartService } from "./big-chart.service";
import HExportData from "highcharts/modules/export-data";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';
import { CommonModule, DOCUMENT } from "@angular/common";
import { ThemeService } from "src/app/services/theme.service";
import { ProgressSpinner } from "primeng/progressspinner";

HFullScreen(Highcharts)
HExporting(Highcharts);
HExportData(Highcharts);
HIndicators(Highcharts);
HIndicatorsAll(Highcharts);
HDragPanes(Highcharts);
HAnnotationsAdvanced(Highcharts);
HPriceIndicator(Highcharts);
HStockTools(Highcharts);
HHightContrastDark(Highcharts);
HAccessability(Highcharts);


export function getDocument() {
    return document;
}

@Component({
    selector: 'app-big-chart',
    templateUrl: './big-chart.component.html',
    standalone: true,
    imports: [HighchartsChartModule, CommonModule],
    providers: [BigChartService]
})
export class BigChartComponent implements OnInit, OnDestroy {
    /** price | marketcap | volume | ohlc */
    @Input('chartDataType') chartDataType: string;
    @Input('themeProvider') themeProvider: ThemeService;

    @ViewChild('highchart') highchart!: HighchartsChartComponent;
    @ViewChild(ProgressSpinner) spinner: ProgressSpinner;

    chartInstance: Highcharts.Chart;
    chartOptions: Highcharts.Options = {};
    market_caps: Array<Array<number>>;
    total_volumes: Array<Array<number>>;
    isLoading: boolean = false;
    theme: string;
    Highcharts: typeof Highcharts = Highcharts;
    ohlc = [];
    volume = [];
    destroySubject$ = new Subject();
    updateFlag = true;
    textColor: string;
    volumeColor: string;
    lineColor: string;
    textSecondaryColor: string;
    chartBackgroundColor: string;
    hoverBgColor: string;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        public cd: ChangeDetectorRef,
        private service: BigChartService
    ) { }


    chartInstanceChanged(event: Highcharts.Chart) {
        this.chartInstance = event;
    }

    ngOnDestroy(): void {
        this.destroySubject$.next(true);
        this.destroySubject$.complete();
    }


    ngOnInit() {
        this.load();
        this.themeProvider.themeSource$.pipe(
            takeUntil(this.destroySubject$))
            .subscribe({
                next: (theme) => {
                    this.theme = theme;
                    this.redraw();
                    this.updateFlag = true;
                }

            });
    }

    redraw() {
        this.isLoading = true;
        this.loadThemeVariables();
        this.chartOptions = this.comboChart();
        if (this.chartInstance) {
            this.chartInstance.redraw();
        } else {
            this.updateFlag = true;
            this.cd.detectChanges();
            this.chartInstance.redraw();
        }
        this.isLoading = false;
        this.updateFlag = true;
        this.cd.detectChanges();
    }

    reflow() {
        this.isLoading = true;
        this.loadThemeVariables();
        this.chartOptions = this.comboChart();
        if (this.chartInstance) {
            this.chartInstance.reflow();
        } else {
            this.cd.detectChanges();
            this.chartInstance.reflow();
        }
        this.isLoading = false;
        this.updateFlag = true;
        this.cd.detectChanges();
    }

    load() {
        this.isLoading = true;
        this.service.dataSource$
            .pipe(takeUntil(this.destroySubject$))
            .subscribe({
                next: (responseData) => {
                    if (responseData && responseData.market_cap_chart) {
                        this.market_caps = this.sortData(responseData.market_cap_chart.market_cap);
                        this.total_volumes = this.sortData(responseData.market_cap_chart.volume);
                        this.loadThemeVariables();
                        this.chartOptions = this.comboChart();
                        this.isLoading = false;
                        this.updateFlag = true;
                        this.cd.detectChanges();

                    }

                },
                complete: () => {
                    this.updateFlag = true;
                    this.isLoading = false;
                    this.cd.detectChanges();
                },
                error: () => {
                    this.isLoading = false;
                }
            });
    }

    sortData(data: Array<any>): Array<Array<number>> {
        let values = [];
        for (let i = data.length - 1; i >= 0; i--) {
            values.push(data[i]);
        }

        return values;

    }

    loadThemeVariables() {
        this.textColor = this.themeProvider.getCssVariableValue('--text-color', getDocument());
        this.volumeColor = this.themeProvider.getCssVariableValue('--chart-volume-color', getDocument());
        this.lineColor = this.themeProvider.getCssVariableValue('--chart-line-color', getDocument());
        this.textSecondaryColor = this.themeProvider.getCssVariableValue('--text-color-secondary', getDocument());
        this.chartBackgroundColor = this.themeProvider.getCssVariableValue('--chart-bg-color', getDocument());
        this.hoverBgColor = this.themeProvider.getCssVariableValue('--hover-bg-fancy', getDocument());
        this.updateFlag = true;
    }

    comboChart(): Highcharts.Options {
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
                    color: this.textColor,
                    fontWeight: 'bold'
                },
                labelStyle: {
                    color: this.textColor,
                    fontWeight: 'bold'
                },
                buttonTheme: {
                    fill: this.chartBackgroundColor,
                    style: {
                        color: this.textColor,
                        fontWeight: 'bold'
                    },
                    states: {
                        hover: {
                            fill: this.chartBackgroundColor,
                            stroke: this.chartBackgroundColor,
                            style: {
                                color: this.textColor,
                                fontWeight: 'bold'
                            },
                        },
                        select: {
                            fill: this.chartBackgroundColor,
                            stroke: this.chartBackgroundColor,
                            style: {
                                color: this.textColor,
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
                backgroundColor: this.chartBackgroundColor,
                plotBackgroundColor: this.chartBackgroundColor,
                reflow: true,
            },
            plotOptions: {
                series: {
                    color: this.lineColor,
                    showInLegend: true,
                    accessibility: {
                        description: 'Price Chart',
                        enabled: true,
                        exposeAsGroupOnly: true
                    }
                },
                line: {
                    color: this.lineColor,
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
                    color: this.textColor
                },
                itemHoverStyle: {
                    color: this.textSecondaryColor
                },
                enabled: true,
                navigation: {
                    style: {
                        color: this.textColor
                    }
                }

            },
            yAxis: [{
                title: {
                    text: ''
                },
                height: '100%',
                lineWidth: 1,
                resize: {
                    enabled: false
                },
                labels: {
                    style: {
                        color: this.textColor
                    }
                }
            }, {
                title: {
                    text: '',
                },
                top: '80%',
                height: '20%',
                lineWidth: 1,
                labels: {
                    style: {
                        color: this.textColor
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
                        color: this.textColor
                    }
                }
            },
            stockTools: {
                gui: {
                    enabled: false,
                }
            },
            series: [{
                name: 'Market Cap',
                color: this.lineColor,
                type: 'line',
                data: this.market_caps,
                tooltip: {
                    valueDecimals: 2
                },
            }, {
                type: 'column',
                id: 'volume',
                name: 'Volume',
                color: this.volumeColor,
                data: this.total_volumes,
                yAxis: 1
            }],
        };
    }

}
