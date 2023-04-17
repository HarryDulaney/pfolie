import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { BasicCoin, CoinTableView, GlobalData } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { DashboardService } from './dashboard.service';
import { Subject } from 'rxjs';
import { concatMap, map, takeUntil, tap } from 'rxjs/operators';
import { PieChartService } from '../charts/pie-chart/pie-chart.service';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [EditableCardComponent, NgClass, TooltipModule, ScrollTopModule, ProgressSpinnerModule, NewsCaroselComponent, SharedModule, NgFor, CardModule, NgIf, SparklineComponent, TableModule, DeltaIcon, TrendingCardComponent]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('bigCoinsTable') bigCoinsTable: Table;

  screenSize: string;
  destroySubject$ = new Subject();
  coinsByMarketCap: CoinTableView[] = [];
  topMarketShareItems: CoinTableView[] = [];
  trendingItems: CoinTableView[] = [];
  watchListItems: CoinTableView[] = [];
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
  isTrendingLoading: boolean;
  loadingIcon = 'pi pi-spin pi-spinner';
  isCoinsByMarketCapLoading: boolean;
  isGlobalDataLoading: boolean;
  trackedAssetIds: TrackedAsset[] = [];
  private user: firebase.User | null = null;

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
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
    private datePipe: DatePipe,
    private navService: NavService) {
    this.date = this.datePipe.transform(this.timeInMillis, 'MM-dd-yyyy h:mm a')?.toString();
    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((screenSize: string) => {
      this.screenSize = screenSize;
      this.cd.markForCheck();
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
    this.dashboardService.getUser().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe((user: firebase.User | null) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
        this.trackedAssetIds = [];
        this.watchListItems = [];
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

      )

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
          }
        }
      );

    this.dashboardService.getTrackedAssetSource().pipe(
      tap((trackedAssets: TrackedAsset[]) => {
        if (trackedAssets) {
          this.trackedAssetIds = trackedAssets;
        }
      }),
      concatMap((trackedAssets: TrackedAsset[]) => {
        const ids = trackedAssets.map((asset) => asset.id);
        return this.dashboardService.getMarketDataForIds(ids);
      }),
      map((result: CoinMarket[]) => {
        return result.map((value) => {
          return this.dashboardService.getMarketDataView(value);
        })
      }),
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (watchListItems: CoinTableView[]) => {
        if (watchListItems) {
          this.watchListItems = watchListItems;
        }
        this.cd.markForCheck();
      }
    });

  }

  isTracked(id: string) {
    return this.trackedAssetIds.some((asset) => asset.id === id);
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

  favoriteButtonClicked(coinView: CoinTableView) {
    if (this.dashboardService.isUserLoggedIn()) {
      this.dashboardService.addToWatchList(coinView);
    }
  }

  isTrackedAsset(id: string) {
    return this.dashboardService.isTrackedAsset(id);
  }

  addToWatchList(event: any, watchListComponent: EditableCardComponent) {

  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }
}

