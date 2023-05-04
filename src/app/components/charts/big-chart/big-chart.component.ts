import { Component, OnInit, Input, OnDestroy, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from "@angular/core";
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
import { CommonModule } from "@angular/common";

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
    @Input('volumeColor') volumeColor: string;
    @Input('backgroundColor') backgroundColor: string;
    @Input('lineColor') lineColor: string;
    @Input('fillColor') fillColor: string;

    @ViewChild('highchart') highchart!: HighchartsChartComponent;

    chartInstance: Highcharts.Chart;
    updateFlag: boolean;
    chartOptions: Highcharts.Options = {};
    market_caps: Array<Array<number>>;
    total_volumes: Array<Array<number>>;
    isLoading: boolean = false;

    Highcharts: typeof Highcharts = Highcharts;
    ohlc = [];
    volume = [];
    destroySubject$ = new Subject();

    constructor(
        public cd: ChangeDetectorRef,
        private service: BigChartService
    ) { }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.chartDataType || changes.volumeColor || changes.backgroundColor || changes.lineColor || changes.fillColor) {
            this.reload();
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
        this.reload();
    }

    reflow() {
        this.chartInstance.reflow();
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
                }
            },
            rangeSelector: {
                selected: 5,
            },
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            chart: {
                backgroundColor: this.backgroundColor,
                reflow: true,

            },
            plotOptions: {
                series: {
                    showInLegend: true,
                    accessibility: {
                        description: 'Price Chart',
                        enabled: true,
                        exposeAsGroupOnly: true
                    }
                },
                line: {
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
                enabled: true
            },
            yAxis: [{
                title: {
                    text: ''
                },
                height: '100%',
                lineWidth: 1,
                resize: {
                    enabled: false
                }
            }, {
                title: {
                    text: '',
                },
                top: '80%',
                height: '20%',
                lineWidth: 1,
                resize: {
                    enabled: false
                }
            }],
            xAxis: {
                type: 'datetime',
            },
            stockTools: {
                gui: {
                    enabled: false,
                }
            },
            series: [{
                name: 'Market Cap',
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
