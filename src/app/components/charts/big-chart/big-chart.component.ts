import { Component, OnInit, Input, OnDestroy, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from "@angular/core";
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
import { BigChartService } from "./big-chart.service";
import HExportData from "highcharts/modules/export-data";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';


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
    imports: [HighchartsChartModule],
    providers: [BigChartService]
})
export class BigChartComponent implements OnInit, OnDestroy, OnChanges {
    /** price | marketcap | volume | ohlc */
    @Input('chartDataType') chartDataType: string;
    loading: EventEmitter<boolean> = new EventEmitter(false);

    @ViewChild('highchart') highchart!: HighchartsChartComponent;


    chartInstance: Highcharts.Chart;
    updateFlag: boolean;
    chartOptions: Highcharts.Options = {};
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
        public cd: ChangeDetectorRef,
        private service: BigChartService
    ) { }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.chartDataType) {
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
        this.loading.emit(true);
        this.service.dataSource$
            .pipe(takeUntil(this.destroySubject$))
            .subscribe({
                next: (responseData) => {
                    if (responseData && responseData.market_cap_chart) {
                        this.market_caps = this.sortData(responseData.market_cap_chart.market_cap);
                        this.total_volumes = this.sortData(responseData.market_cap_chart.volume);
                        this.chartOptions = this.comboChart();
                        this.cd.detectChanges();
                    }

                },
                complete: () => {
                    this.loading.emit(false);
                    this.cd.detectChanges();
                },
                error: () => {
                    this.loading.emit(false);
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



    marketCapChart(): Highcharts.Options {
        return {
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            chart: {
                type: 'area',
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
            plotOptions: {
                area: {
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
                enabled: false
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Market Cap'
                },
                height: '100%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }],
            xAxis: {
                type: 'datetime',
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
            series: [{
                name: 'Market Cap',
                type: 'area',
                data: this.market_caps,
                tooltip: {
                    valueDecimals: 2
                },
            }],
            rangeSelector: {
                selected: 5,
            },
        };
    }


    comboChart(): Highcharts.Options {
        return {
            credits: {
                enabled: false
            },
            title: {
                text: ''
            },
            chart: {
                type: 'area',
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
            plotOptions: {
                series: {
                    showInLegend: true,
                    accessibility: {
                        exposeAsGroupOnly: true
                    }
                },
                area: {
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
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: ''
                },
                height: '100%',
                lineWidth: 2,
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
                    enabled: true,
                    definitions: {
                        fullScreen: {
                            symbol: 'url(https://static.thenounproject.com/png/1985-200.png)'
                        }
                    }
                }
            },
            series: [{
                name: 'Market Cap',
                type: 'area',
                data: this.market_caps,
                tooltip: {
                    valueDecimals: 2
                },
            }, {
                type: 'column',
                id: 'volume',
                name: 'Volume',
                data: this.total_volumes,
                yAxis: 1
            }],
            rangeSelector: {
                selected: 5,
            },
        };
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
            lineWidth: 2,
            offset: 0,
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
            lineWidth: 2,
            offset: 0,
            resize: {
                enabled: true
            }
        }];


        baseOptions.stockTools = {
            gui: {
                enabled: true,
            }
        };

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
}
