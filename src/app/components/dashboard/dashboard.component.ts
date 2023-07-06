import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { BasicCoin, CoinFullInfo, CoinTableView, GlobalData } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { DashboardService } from './dashboard.service';
import { Observable, Subject } from 'rxjs';
import { concatMap, map, takeUntil, tap } from 'rxjs/operators';
import { ScreenService } from 'src/app/services/screen.service';
import { LazyLoadEvent, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { DeltaIcon } from '../shared/change-icon/delta.component';
import { SparklineComponent } from '../charts/sparkline/sparkline.component';
import { CardModule } from 'primeng/card';
import { NewsCaroselComponent } from '../news/news-carosel/news-carosel.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollTopModule } from 'primeng/scrolltop';
import * as Const from '../../constants';
import { TooltipModule } from 'primeng/tooltip';
import firebase from 'firebase/compat/app';
import { EditableCardComponent } from '../shared/editable-card/editable-card.component';
import { CoinMarket } from 'src/app/models/coin-gecko';
import { SkeletonModule } from 'primeng/skeleton';
import { BigChartComponent } from '../charts/big-chart/big-chart.component';
import { BigChartService } from '../charts/big-chart/big-chart.service';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';
import { PieChartService } from '../charts/pie-chart/pie-chart.service';
import { SELECT_ITEM_EVENT } from '../../constants';
import { DashboardEvent } from 'src/app/models/events';
import { ThemeService } from 'src/app/services/theme.service';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { ListCardComponent } from '../shared/list-card/list-card.component';
import { WatchListMeta } from 'src/app/models/portfolio';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    EditableCardComponent,
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
    OverlayPanelModule,
    ListCardComponent,
    PieChartComponent
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bigCoinsTable') bigCoinsTable: Table;
  @ViewChild('globalChart') globalChart: BigChartComponent;
  @ViewChild('globalPie') globalPie: PieChartComponent;
  @ViewChild('selectWatchListPanel') selectWatchListPanel!: OverlayPanel;

  @ViewChild(BigChartService, { 'static': true }) bigChartService: BigChartService;
  @ViewChild(PieChartService, { 'static': true }) pieChartService: PieChartService;


  destroySubject$ = new Subject();


  /* Loading Flags */
  isCoinsByMarketCapLoading: boolean;
  isGlobalChartLoading: boolean;

  loadingIcon = 'pi pi-spin pi-spinner';
  globalChartType: string = Const.CHART_TYPE.MARKET_CAP;

  screenSize: string;
  coinsByMarketCap: CoinTableView[] = [];
  globalData: GlobalData;
  selectedCoin: CoinTableView;
  isTrendingSelected = false;
  hideRegisterBanner = false;
  timeInMillis: number = Date.now();
  date: string | undefined;
  first = 0;
  rows = 60;
  totalRecords = 0;
  tooltipOptions = Const.TOOLTIP_OPTIONS;
  trackedAssetDataProvider: Observable<CoinFullInfo[]>;
  topMarketCapProvider: Observable<CoinTableView[]>;
  trendingCoinsProvider: Observable<CoinTableView[]>;
  globalChartHeight: string = '400px';
  globalChartWidth: string = '100%';
  topMarginStyle: any = { 'margin-top': '4rem !important' };
  watchListOptions: WatchListMeta[] = [];
  private addToWatchListCoinId: string;

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
    public readonly themeService: ThemeService,
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
      if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.XS) {
        this.topMarginStyle = { 'margin-top': '0rem !important' };
      } else if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.S) {
        this.topMarginStyle = { 'margin-top': '4.5rem !important' };
      } else if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.M) {
        this.topMarginStyle = { 'margin-top': '5rem !important' };
      } else if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.L) {
        this.topMarginStyle = { 'margin-top': '4rem !important' };
      } else if (this.screenSize === Const.CONSTANT.SCREEN_SIZE.XL) {
        this.topMarginStyle = { 'margin-top': '3rem !important' };
      }
      this.cd.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.navService.navExpandedSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(expandStateChange => {
        if (expandStateChange !== null) {
          this.globalChart.reflow();
          this.globalPie.reflow();
          this.cd.markForCheck();
        }
      });
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

    this.trendingCoinsProvider = this.dashboardService.getTrending();
    this.trackedAssetDataProvider = this.dashboardService.getMainWatchListDataProvider();
    this.topMarketCapProvider = this.dashboardService.getGlobalDataSource()
      .pipe(
        concatMap((globalData: GlobalData) => this.dashboardService.getGlobalCoinsInfo(globalData)),
        map((result: CoinMarket[]) => {
          return result.map((value) => {
            return this.dashboardService.getMarketDataView(value);
          })
        })
      );

    this.dashboardService.getGlobalDataSource()
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (globalData: GlobalData) => {
          if (globalData) {
            this.globalData = globalData;
            this.pieChartService.setData(globalData.data.market_cap_percentage);
            this.isGlobalChartLoading = false;
            this.cd.markForCheck();
          }
        },
        error: (err) => {
          console.log(err);
          this.isGlobalChartLoading = false;
          this.cd.markForCheck();
        },
        complete: () => {
          this.isGlobalChartLoading = false;
          this.cd.markForCheck();
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
    this.dashboardService.getWatchListsProvider().subscribe({
      next: (watchLists: WatchListMeta[]) => {
        this.watchListOptions = watchLists;
      }
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

  favoriteButtonClicked(coinView: CoinTableView, event: any) {
    if (this.dashboardService.isUserLoggedIn()) {
      if (this.dashboardService.isTrackedAsset(coinView.id)) {
        this.dashboardService.removeFromWatchList(coinView.id);
      } else {
        if (this.dashboardService.hasMainWatchList()) {
          this.dashboardService.addToWatchList(coinView);
        } else {
          this.addToWatchListCoinId = coinView.id;
          this.selectWatchListPanel.show(event);
        }
      }
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


  onWatchListSelected(event: any) {
    this.dashboardService.onWatchListSelected(event, this.addToWatchListCoinId);
    this.cd.markForCheck();
  }

  createWatchList() {
    this.dashboardService.createWatchList();
  }

}

