import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { NewsService } from '../news/news.service';
import { SessionService } from 'src/app/services/session.service';
import { CoinTableView } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { DashboardService } from './dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PieChartService } from '../charts/pie-chart/pie-chart.service';
import { ConfigService } from 'src/app/services/config.service';
import { ScreenService } from 'src/app/services/screen.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  screenSize: string;

  destroySubject$ = new Subject();
  top250Coins: CoinTableView[] = [];
  trendingItems: CoinTableView[] = [];
  selectedCoin: CoinTableView;
  globalMarketShares: { [key: string]: number } = {};

  isTrendingSelected = false;
  hideRegisterBanner = false;
  isMarketCapCoinsLoading = false;
  timeInMillis: number = Date.now();
  date: string | undefined;

  isTrendingLoading: boolean;
  isTop250Loading: boolean;
  isGlobalDataLoading: boolean;

  mainColumnDefs = [
    { header: "Icon", field: 'image' },
    { header: "Name", field: 'name' },
    { header: "Price", field: 'current_price' },
    { header: "Rank", field: 'market_cap_rank' },
    { header: "Market Cap", field: 'market_cap' },
    { header: "24h", field: 'price_change_24h' },
    { header: "24h High", field: 'high_24h' },
    { header: "24h Low", field: 'low_24h' },
    { header: "7 Days", field: 'sparkline' },
  ];


  constructor(
    public coinDataService: CoinDataService,
    public pieChartService: PieChartService,
    public newsService: NewsService,
    public sessionService: SessionService,
    private screenService: ScreenService,
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private navService: NavService
  ) {
    this.date = this.datePipe.transform(this.timeInMillis, 'MM-dd-yyyy h:mm a')?.toString();

    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(screenSize => this.screenSize = screenSize);
    
  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }


  ngOnInit(): void {
    this.isTrendingLoading = true;
    this.dashboardService.getTrending().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (trendingView) => {
        if (trendingView) {
          this.trendingItems = trendingView;
          this.isTrendingLoading = false;
        }
      }
    });

    this.isTop250Loading = true;
    this.dashboardService.getTop250Coins().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (top250) => {
        if (top250) {
          this.top250Coins = top250;
          this.isTop250Loading = false;
        }
      }
    });

    this.isGlobalDataLoading = true;
    this.dashboardService.getGlobalData().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      {
        next: (globalView) => {
          if (globalView) {
            this.pieChartService.pieData.next(globalView.market_cap_percentage)
            this.isGlobalDataLoading = false;
          }
        }
      }
    );
    this.cd.detectChanges();

  }

  public openCoinContent(coinId: string) {
    this.navService.navigateTo(coinId);
  }

  onRowSelect(event) {
    this.openCoinContent(this.selectedCoin.id);
  }

  onCardClicked(coinView: CoinTableView) {
    this.openCoinContent(coinView.id);
  }

}
