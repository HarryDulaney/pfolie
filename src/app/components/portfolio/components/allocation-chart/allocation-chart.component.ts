import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as Highcharts from "highcharts/highcharts";
import { OwnedAssetView } from 'src/app/models/portfolio';
import HBrandDark from "highcharts/themes/dark-blue"
import HAccessability from "highcharts/modules/accessibility";
import { ChartModule } from 'primeng/chart';
import { Observable } from 'rxjs';
import { PortfolioService } from '../../services/portfolio.service';
import { UtilityService } from 'src/app/services/utility.service';

HBrandDark(Highcharts);
HAccessability(Highcharts);

@Component({
  selector: 'app-allocation-chart',
  templateUrl: './allocation-chart.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule],
  providers: [UtilityService]
})
export class AllocationChartComponent implements OnInit {
  @Input('title') title: string;
  @Input('height') height: string;

  data: any;
  chartData: any[] = [];
  chartOptions: any;
  textColor: string;
  donutChartColorPallete: string[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    private portfolioService: PortfolioService,
    private utilityService: UtilityService
  ) { }


  ngOnInit(): void {
    let documentStyle = getComputedStyle(document.documentElement);
    this.textColor = documentStyle.getPropertyValue('--text-color');
    this.donutChartColorPallete = this.utilityService.getThemeColorPallete();
    this.portfolioService.portfolioAssetViewSource$.subscribe((data) => {
      this.setData(data);
      this.cd.markForCheck();
    });
  }



  setData(assetData: OwnedAssetView[]) {
    this.chartData = [];
    this.setupChartData(assetData, this.chartData);
    this.chartOptions = {
      cutout: '60%',
      plugins: {
        legend: {
          labels: {
            color: this.textColor
          }
        }
      }
    };

  }


  setupChartData(assetData: OwnedAssetView[], chartData: any[]) {
    let readyData = this.parseChartData(assetData);
    chartData.push(...readyData[0]);
    this.data = {
      labels: readyData[1],
      datasets: [{
        label: 'Allocation',
        data: this.chartData,
        hoverOffset: 4
      }]
    };

  }


  parseChartData(assetViews: OwnedAssetView[]): any[][] {
    let formatedData = [];
    let labels = [];
    let sortedAssetViews = this.sortByAllocation(assetViews);

    for (let i = 0; i < sortedAssetViews.length; i++) {
      let asset = sortedAssetViews[i];
      labels.push(asset.coinFullInfo.name);
      formatedData.push(asset.allocation);
    }

    return [formatedData, labels];
  }

  sortByAllocation(assetViews: OwnedAssetView[]): OwnedAssetView[] {
    let result = Array.from(assetViews);
    result.sort((a, b) => a.allocation > b.allocation ? 1 : -1);
    return result;
  }

}

