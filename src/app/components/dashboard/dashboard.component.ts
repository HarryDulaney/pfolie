import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { NewsService } from '../news/news.service';
import { SessionService } from 'src/app/services/session.service';
import { CoinTableView, GlobalData } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { DashboardService } from './dashboard.service';
import { Subject } from 'rxjs';
import { map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { PieChartService } from '../charts/pie-chart/pie-chart.service';
import { ScreenService } from 'src/app/services/screen.service';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('bigCoinsTable') bigCoinsTable: Table;
  screenSize: string;
  destroySubject$ = new Subject();
  coinsByMarketCap: CoinTableView[] = [];
  topMarketShareItems: CoinTableView[] = [];
  trendingItems: CoinTableView[] = [];
  globalData: GlobalData;
  selectedCoin: CoinTableView;
  globalMarketShares: { [key: string]: number } = {};
  isTrendingSelected = false;
  hideRegisterBanner = false;
  timeInMillis: number = Date.now();
  date: string | undefined;
  first = 0;
  rows = 100;
  totalRecords = 0;

  isTrendingLoading: boolean;
  loadingIcon = 'pi pi-spin pi-spinner';
  isCoinsByMarketCapLoading: boolean;
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
    ).subscribe(screenSize => {
      this.screenSize = screenSize;
    });

  }

  loadCoinsLazy(event: LazyLoadEvent) {
    this.isCoinsByMarketCapLoading = true;
    this.dashboardService.getCoinsByMarketCap(event).pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (data) => {
        if (data) {
          this.coinsByMarketCap = data;
          this.isCoinsByMarketCapLoading = false;
          this.cd.detectChanges();
        }
      }
    });
  }


  ngOnInit(): void {
    this.isTrendingLoading = true;
    this.dashboardService.getTrending()
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (trendingView) => {
          if (trendingView) {
            this.trendingItems = trendingView;
            this.isTrendingLoading = false;
            this.cd.detectChanges();
          }
        }
      });

    this.dashboardService.coinsSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        {
          next: (coins) => {
            this.totalRecords = coins.length
            this.cd.detectChanges();
          }
        }

      )

    this.isGlobalDataLoading = true;
    this.dashboardService.getGlobalDataSource()
      .pipe(
        takeUntil(this.destroySubject$),
        tap((globalData) => {
          if (globalData) {
            this.globalData = globalData;
          }
        }),
        mergeMap((globalData) => this.dashboardService.getGlobalCoinsInfo(globalData)),
        map(result => {
          return result.map((value) => {
            return this.dashboardService.getMarketDataView(value);
          })
        })
      ).subscribe(
        {
          next: (topCoinsData) => {
            if (topCoinsData) {
              this.topMarketShareItems = topCoinsData;
              this.isGlobalDataLoading = false;
              this.cd.detectChanges();
            }
          }
        }
      );

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

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }
}

