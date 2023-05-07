import { Component, OnInit, Input, OnDestroy, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, AfterViewInit } from "@angular/core";
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
import { Observable, Subject } from 'rxjs';
import { skip, skipUntil, takeUntil } from 'rxjs/operators';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from "@angular/common";
import { ThemeService } from "src/app/services/theme.service";

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

@Component({
    selector: 'app-big-chart',
    templateUrl: './big-chart.component.html',
    standalone: true,
    imports: [HighchartsChartModule, CommonModule],
    providers: [BigChartService]
})
export class BigChartComponent implements OnInit, OnDestroy, OnChanges {
    /** price | marketcap | volume | ohlc */
    @Input('chartDataType') chartDataType: string;
    @Input('themeProvider') themeProvider: ThemeService;

    @ViewChild('highchart') highchart!: HighchartsChartComponent;

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

    constructor(
        public cd: ChangeDetectorRef,
        private service: BigChartService
    ) { }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.chartDataType) {
            this.reload();
        } else {
            this.redraw();
        }

    }

    ngOnDestroy(): void {
        this.destroySubject$.next(true);
        this.destroySubject$.complete();
    }

    onChartUpdate(event) {
        this.cd.detectChanges();
    }

    ngOnInit() {
        this.themeProvider.themeSource$.pipe(
            skip(1),
            takeUntil(this.destroySubject$))
            .subscribe({
                next: (theme) => {
                    if (theme) {
                        this.redraw();
                        this.cd.detectChanges();

                    }
                },
                complete: () => {
                    this.reflow();
                    this.cd.detectChanges();
                }

            });
        this.reload();
    }

    redraw() {
        this.chartOptions = this.comboChart();
        this.chartInstance.redraw();
        this.cd.detectChanges();
    }

    reflow() {
        this.chartInstance.reflow();
        this.cd.detectChanges();
    }

    reload() {
        this.isLoading = true;
        this.service.dataSource$
            .pipe(takeUntil(this.destroySubject$))
            .subscribe({
                next: (responseData) => {
                    if (responseData && responseData.market_cap_chart) {
                        this.market_caps = this.sortData(responseData.market_cap_chart.market_cap);
                        this.total_volumes = this.sortData(responseData.market_cap_chart.volume);
                        this.chartOptions = this.comboChart();
                        this.cd.detectChanges();
                        this.isLoading = false;
                    }

                },
                complete: () => {
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
                    text: ''
                },
                height: '100%',
                lineWidth: 1,
                resize: {
                    enabled: false
                },
                labels: {
                    style: {
                        color: this.themeProvider.getCssVariableValue('--text-color')
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
                name: 'Market Cap',
                color: this.themeProvider.getCssVariableValue('--chart-line-color'),
                type: 'line',
                data: this.market_caps,
                tooltip: {
                    valueDecimals: 2
                },
            }, {
                type: 'column',
                id: 'volume',
                name: 'Volume',
                color: this.themeProvider.getCssVariableValue('--chart-volume-color'),
                data: this.total_volumes,
                yAxis: 1
            }],
        };
    }

}
