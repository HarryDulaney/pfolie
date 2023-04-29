import { DOCUMENT, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { BasicCoin, CoinFullInfo, CoinTableView, GlobalData, GlobalMarketCapChart, GlobalMarketCapData } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { DashboardService } from './dashboard.service';
import { Observable, Subject } from 'rxjs';
import { concatMap, map, takeUntil, tap } from 'rxjs/operators';
import { ScreenService } from 'src/app/services/screen.service';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { DeltaIcon } from '../icons/change-icon/delta.component';
import { SparklineComponent } from '../charts/sparkline/sparkline.component';
import { CardModule } from 'primeng/card';
import { NewsCaroselComponent } from '../news/news-carosel/news-carosel.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollTopModule } from 'primeng/scrolltop';
import { TrendingCardComponent } from '../cards/trending-card/trending-card.component';
import * as Const from '../../constants';
import { TooltipModule } from 'primeng/tooltip';
import firebase from 'firebase/compat/app';
import { EditableCardComponent } from '../cards/editable-card/editable-card.component';
import { CoinMarket } from 'src/app/models/coin-gecko';
import { TrackedAsset } from 'src/app/models/portfolio';
import { SkeletonModule } from 'primeng/skeleton';
import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { CoinChartComponent } from '../charts/coin-chart/coin-chart.component';
import { BigChartComponent } from '../charts/big-chart/big-chart.component';
import { BigChartService } from '../charts/big-chart/big-chart.service';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { PieChartService } from '../charts/pie-chart/pie-chart.service';
import { SELECT_ITEM_EVENT } from '../../constants';
import { DashboardEvent } from 'src/app/models/events';


const documentStyle = getComputedStyle(document.documentElement);
const chartFillColor = documentStyle.getPropertyValue('--chart-fill-color');
const textColor = documentStyle.getPropertyValue('--text-color');
const chartLineColor = documentStyle.getPropertyValue('--chart-fill-color');
const chartBackgroundColor = documentStyle.getPropertyValue('--chart-fill-color');
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [EditableCardComponent,
    NgClass,
    TooltipModule,
    ScrollTopModule,
    ProgressSpinnerModule,
    SkeletonModule,
    NewsCaroselComponent,
    BigChartComponent,
    SharedModule,
    NgFor,
    CardModule,
    NgIf,
    SparklineComponent,
    TableModule,
    DeltaIcon,
    TrendingCardComponent,
    PieChartComponent]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bigCoinsTable') bigCoinsTable: Table;
  @ViewChild('globalChart') globalChart: BigChartComponent;

  @ViewChild(BigChartService, { 'static': true }) bigChartService: BigChartService;
  @ViewChild(PieChartService, { 'static': true }) pieChartService: PieChartService;


  private documentStyle: CSSStyleDeclaration;
  private user: firebase.User | null = null;
  destroySubject$ = new Subject();


  /* Loading Flags */
  isTrendingLoading: boolean;
  isCoinsByMarketCapLoading: boolean;
  isGlobalDataLoading: boolean;
  isWatchListLoading: boolean;
  isGlobalChartLoading: boolean;

  loadingIcon = 'pi pi-spin pi-spinner';
  /* Chart Style */
  chartFillColor: string = chartFillColor;
  chartLineColor: string = chartLineColor;
  textColor: string = textColor;
  chartBackgroundColor: string = chartBackgroundColor;
  globalChartType: string = Const.CHART_TYPE.MARKET_CAP;

  screenSize: string;
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
  tooltipOptions = Const.TOOLTIP_OPTIONS;
  trackedAssetDataProvider: Observable<CoinFullInfo[]>;
  globalChartHeight: string = '400px';
  globalChartWidth: string = '100%';

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

  rowTrackBy = (index: number, item: CoinTableView) => item.id;


  constructor(
    public coinDataService: CoinDataService,
    private screenService: ScreenService,
    public dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private navService: NavService,
  ) {
    this.date = this.datePipe.transform(this.timeInMillis, 'MM-dd-yyyy h:mm a')?.toString();
    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((screenSize: string) => {
      this.screenSize = screenSize;
      this.cd.markForCheck();
    });
    this.documentStyle = documentStyle;

  }

  loadCoinsLazy(event: LazyLoadEvent) {
    this.isCoinsByMarketCapLoading = true;
    this.dashboardService.getCoinsByMarketCap(event)
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (data: CoinTableView[]) => {
          if (data) {
            this.coinsByMarketCap = data;
            this.isCoinsByMarketCapLoading = false;
            this.cd.markForCheck();
          }
        }
      });
  }


  ngOnInit(): void {
    this.isGlobalChartLoading = true;
    this.bigChartService.initializeChart();

    this.navService.navExpandedSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(expandStateChange => {
        this.globalChart.chartInstance.reflow();
        this.globalChart.cd.detectChanges();
        this.cd.markForCheck();
      });

    this.dashboardService.getUser().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((user: firebase.User | null) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
        this.cd.markForCheck();
      }
    });

    this.isTrendingLoading = true;
    this.dashboardService.getTrending()
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (trendingView: CoinTableView[]) => {
          if (trendingView) {
            this.trendingItems = trendingView;
            this.isTrendingLoading = false;
            this.cd.markForCheck();
          }
        }
      });

    this.dashboardService.coinsSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        {
          next: (coins: BasicCoin[]) => {
            this.totalRecords = coins.length
            this.cd.markForCheck();
          }
        }
      );

    this.isGlobalDataLoading = true;
    this.dashboardService.getGlobalDataSource()
      .pipe(
        tap((globalData: GlobalData) => {
          if (globalData) {
            this.globalData = globalData;
          }
        }),
        concatMap((globalData: GlobalData) => this.dashboardService.getGlobalCoinsInfo(globalData)),
        map((result: CoinMarket[]) => {
          return result.map((value) => {
            return this.dashboardService.getMarketDataView(value);
          })
        }),
        takeUntil(this.destroySubject$)
      ).subscribe(
        {
          next: (topCoinsData: CoinTableView[]) => {
            if (topCoinsData) {
              this.topMarketShareItems = topCoinsData;
              this.isGlobalDataLoading = false;
            }
            this.cd.markForCheck();
          },
          error: (error: any) => {
            this.isGlobalDataLoading = false;
            this.cd.markForCheck();
          },
          complete: () => {
            this.isGlobalDataLoading = false;
            this.cd.markForCheck();
          }
        }
      );

    this.isWatchListLoading = true;
    this.trackedAssetDataProvider = this.dashboardService.getTrackedAssetDataProvider()
      .pipe(
        takeUntil(this.destroySubject$),
        tap((res) => {
          if (res) {
            this.isWatchListLoading = false;
          }
        }));

  }

  ngAfterViewInit(): void {
    this.globalChart.loading.subscribe(
      (isLoading: boolean) => {
        this.isGlobalChartLoading = isLoading;
        this.cd.markForCheck();
      });
  }


  isTracked(id: string) {
    return this.dashboardService.isTrackedAsset(id);
  }

  public openCoinContent(coinId: string) {
    this.navService.navigateTo(coinId);
  }

  onRowSelect(event) {
    this.openCoinContent(this.selectedCoin.id);
  }

  onCardItemSelected(event) {
    const dashEvent: DashboardEvent = { event: event, name: SELECT_ITEM_EVENT };
    this.dashboardService.sendEvent(dashEvent);
  }

  favoriteButtonClicked(coinView: CoinTableView) {
    if (this.dashboardService.isUserLoggedIn()) {
      this.dashboardService.addToWatchList(coinView);
    } else {
      this.dashboardService.promptForLogin();
    }
  }

  editTrackedAssets(event) {
    if (this.dashboardService.isUserLoggedIn()) {
      this.dashboardService.publishEvent(Const.EDIT_TRACKED_ITEMS, event);
    } else {
      this.dashboardService.promptForLogin();
    }
  }

  isTrackedAsset(id: string) {
    return this.dashboardService.isTrackedAsset(id);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }
}

