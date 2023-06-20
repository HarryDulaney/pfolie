import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as Highcharts from "highcharts/highcharts";
import { OwnedAssetView } from 'src/app/models/portfolio';
import HBrandDark from "highcharts/themes/dark-blue"
import HAccessability from "highcharts/modules/accessibility";
import HExporting from "highcharts/modules/exporting";
import { PortfolioService } from '../../../services/portfolio.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HighchartsChartComponent, HighchartsChartModule } from 'highcharts-angular';

HBrandDark(Highcharts);
HAccessability(Highcharts);
HExporting(Highcharts);
@Component({
  selector: 'app-allocation-chart',
  templateUrl: './allocation-chart.component.html',
  standalone: true,
  imports: [HighchartsChartModule],
})
export class AllocationChartComponent implements OnInit, OnDestroy {
  @ViewChild('highchart') chart: HighchartsChartComponent;

  updateFlag: boolean;
  Highcharts: typeof Highcharts = Highcharts;
  chartInstance: Highcharts.Chart;

  destroySubject$ = new Subject();

  constructor(
    private portfolioService: PortfolioService,
    private cd: ChangeDetectorRef
  ) { }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  ngOnInit(): void {
    this.portfolioService.portfolioAssetViewSource$.pipe(
      takeUntil(this.destroySubject$))
      .subscribe(
        views => {
          this.setData(views);
          this.cd.detectChanges();
        }
      )
  }

  setData(assetData: OwnedAssetView[]) {
    this.chartData = [];
    this.chartData = this.setupChartData(assetData, this.chartData);
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
        type: 'pie',
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
        text: '',
      },
      plotOptions: {
        pie: {
          accessibility: {
            description: 'Portfolio allocation pie chart.',
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
        name: 'Allocation',
        colorByPoint: true,
        data: this.chartData
      }]
    }
  }


  setupChartData(assetData: OwnedAssetView[], chartData: any[]): any[] {
    let readyData = this.getChartData(assetData);
    chartData.push(...readyData);
    return chartData;

  }

  chartData: any[] = [];

  chartOptions: any;


  getChartData(assetViews: OwnedAssetView[]): any[] {
    let formatedData = [];
    let sortedAssetViews = this.sortByAllocation(assetViews);

    for (let i = 0; i < sortedAssetViews.length; i++) {
      let asset = sortedAssetViews[i];
      if (i === 0) {
        formatedData.push({ name: asset.coinFullInfo.name, y: asset.allocation, sliced: true, selected: true });
      } else {
        formatedData.push({ name: asset.coinFullInfo.name, y: asset.allocation });
      }
    }

    return formatedData;
  }

  sortByAllocation(assetViews: OwnedAssetView[]): OwnedAssetView[] {
    let result = Array.from(assetViews);
    result.sort((a, b) => a.allocation > b.allocation ? 1 : -1);

    return result;
  }

}

