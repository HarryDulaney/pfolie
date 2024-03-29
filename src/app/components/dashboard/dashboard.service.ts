import { Injectable } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { concatMap, map, switchMap } from 'rxjs/operators';
import { BasicCoin, CoinFullInfo, CoinMarket, CoinTableView, GlobalData, GlobalDataView, GlobalMarketCapChart, GlobalMarketCapData, Trending, TrendingItem } from 'src/app/models/coin-gecko';
import { ApiService } from 'src/app/services/api.service';
import { SessionService } from 'src/app/services/session.service';
import { UtilityService } from 'src/app/services/utility.service';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import firebase from 'firebase/compat/app';
import { AppEvent, DashboardEvent } from 'src/app/models/events';
import { WatchListService } from '../../services/watchlist.service';
import { UserService } from 'src/app/services/user.service';
import { WatchList, WatchListMeta } from 'src/app/models/portfolio';
import { ToastService } from 'src/app/services/toast.service';

@Injectable()
export class DashboardService {
  private eventSource = new BehaviorSubject<DashboardEvent>(null);
  eventSource$ = this.eventSource.asObservable();

  currencies: string[] = ["usd", "btc", "eth", "ltc", "bch", "bnb", "eos", "xrp", "xlm", "link", "dot", "yfi", "aed"];
  priceChangePercent: string[] = ["1h", "24h", "7d", "14d", "30d", "200d", "1y"];
  activePriceChangePercent: string[] = ["1h", "24h", "7d"];
  orderByValues: string[] = ["market_cap_desc", "gecko_desc", "gecko_asc", "market_cap_asc", "market_cap_desc", "volume_asc", "volume_desc", "id_asc", "id_desc"];
  sparklineXAxisLabels: string[] = [];
  watchListItem: CoinTableView[] = [];
  defaultCurrency: string;
  thruPage = 1;
  orderBy: string = this.orderByValues[0];
  coinsSource$: Observable<BasicCoin[]>;
  globalDataSource$: Observable<GlobalData>;
  globalData: GlobalData;

  constructor(
    private apiService: ApiService,
    private utilityService: UtilityService,
    private basicCoinStore: BasicCoinInfoStore,
    private watchListService: WatchListService,
    private toast: ToastService,
    private sessionService: SessionService,
    private userService: UserService
  ) {
    this.defaultCurrency = this.currencies[0];
    this.coinsSource$ = basicCoinStore.allCoinsStore.select();

  }

  getUser(): Observable<firebase.User> {
    return this.sessionService.getUser();
  }


  isUserLoggedIn(): boolean {
    return this.sessionService.authenticated;
  }


  getTrending(): Observable<CoinTableView[]> {
    return this.readTrending().pipe(
      switchMap((data: Trending[]) => this.getTrendingCoinsInfo(data)),
      map((result: CoinMarket[]) => {
        return result.map((value) => {
          return this.getMarketDataView(value);
        })
      })
    )
  }


  promptForLogin() {
    this.sessionService.displayLoginModal();
  }


  getCoinsByMarketCap(event: LazyLoadEvent): Observable<CoinTableView[]> {
    return this.getAllCoinsMarketData(
      Number(event.first / event.rows + 1),
      event.rows,
      this.defaultCurrency,
      this.orderBy,
      true,
      this.activePriceChangePercent
    ).pipe(
      map((result: CoinMarket[]) => {
        return result.map((value) => {
          return this.getMarketDataView(value);
        })
      })
    )
  }


  getGlobalDataSource(): Observable<GlobalData> {
    return this.apiService.getGlobalDataCrypto();
  }


  getTrendingCoinsInfo(trendingItems: Trending[]): Observable<CoinMarket[]> {
    let trendingIds = trendingItems.map(((trending: Trending) => {
      return this.getTrendingItem(trending).id;
    }))

    return this.getCoinMarketDataByIds(trendingIds, 1, 250, this.defaultCurrency, this.orderBy, true, this.activePriceChangePercent);
  }

  getGlobalCoinsInfo(globalData: GlobalData): Observable<CoinMarket[]> {
    const basicCoins = this.basicCoinStore.allCoinsStore.state;
    let topGlobalByCapIds = [];
    for (const key in globalData.data.market_cap_percentage) {
      const assetId = this.getIdFromSymbol(key, basicCoins);
      topGlobalByCapIds.push(assetId);
    }

    return this.getCoinMarketDataByIds(topGlobalByCapIds, this.thruPage, 7, this.defaultCurrency, this.orderBy, true, this.activePriceChangePercent);
  }

  getIdFromSymbol(symbol: string, basicCoins: BasicCoin[]): string {
    const index = basicCoins.findIndex((c: BasicCoin) => c.symbol === symbol);
    if (index > -1) {
      return basicCoins[index].id;
    }
    return symbol;

  }

  getMarketDataForIds(ids: string[]): Observable<CoinMarket[]> {
    return this.getCoinMarketDataByIds(ids, this.thruPage, 7, this.defaultCurrency, "id_asc", true, this.activePriceChangePercent);

  }


  public readTrending(): Observable<Trending[]> {
    return this.apiService.getTrendingCoins().pipe(
      map(value => {
        return value.coins;
      }),
    )
  }

  getTrendingItem(wrapped: Trending): TrendingItem {
    return wrapped.item;
  }


  getMarketDataView(coinMarket: CoinMarket): CoinTableView {
    return {
      id: coinMarket.id,
      image: coinMarket.image,
      name: coinMarket.name,
      current_price: this.utilityService.format(coinMarket.current_price, 'USD'),
      market_cap_rank: coinMarket.market_cap_rank,
      market_cap: this.utilityService.format(coinMarket.market_cap, 'USD'),
      price_change_24h: this.utilityService.format(coinMarket.price_change_percentage_24h, 'decp'),
      high_24h: this.utilityService.format(coinMarket.high_24h, 'USD'),
      low_24h: this.utilityService.format(coinMarket.low_24h, 'USD'),
      sparkline: coinMarket.sparkline_in_7d.price
    } as CoinTableView;
  }


  public getCoinMarketDataByIds(
    ids,
    thruPage,
    pageSize,
    vsCurrency,
    orderBy,
    sparkline,
    changePercentages): Observable<CoinMarket[]> {
    let priceChangesInclude = changePercentages.join(',');
    let strIds = ids.join(',');
    return this.apiService.getPagedMarketDataByIds(strIds, thruPage, pageSize, vsCurrency, orderBy, sparkline, priceChangesInclude);
  }


  public getAllCoinsMarketData(
    thruPage,
    pageSize,
    vsCurrency,
    orderBy,
    sparkline,
    changePercentages

  ): Observable<CoinMarket[]> {
    let priceChangesInclude = changePercentages.join(',');
    return this.apiService.getPagedMarketData(thruPage, pageSize, vsCurrency, orderBy, sparkline, priceChangesInclude);
  }

  getGlobalDataView(g: GlobalData): GlobalDataView {
    return {
      total_market_cap_usd: g.data.total_market_cap['usd'],
      total_volume: g.data.total_volume.usd,
      market_cap_change_percentage_24h_usd: g.data.market_cap_change_percentage_24h_usd,
      total_volume_formated: this.utilityService.format(g.data.total_volume.usd, '2dec'),
      total_market_cap_usd_formated: this.utilityService.format(g.data.total_market_cap.usd, '2dec'),
      market_cap_change_percentage_24h_usd_formated: this.utilityService.format(g.data.market_cap_change_percentage_24h_usd, 'pd'),
      market_cap_percentage: g.data.market_cap_percentage,
      active_cryptocurrencies: g.data.active_cryptocurrencies,
      markets: g.data.markets,
    } as GlobalDataView;
  }


  addToWatchList(coin: CoinTableView) {
    this.watchListService.addToMainWatchList(coin.id);
  }

  removeFromWatchList(id: string) {
    this.watchListService.removeFromMainWatchList(id);
  }

  hasMainWatchList() {
    return this.watchListService.mainWatchList !== null;
  }

  isTrackedAsset(id: string): boolean {
    const mainWatchList = this.watchListService.mainWatchList;
    if (mainWatchList !== null && mainWatchList.watchListData !== undefined) {
      if (mainWatchList.watchListData.trackedAssets) {
        let index = mainWatchList.watchListData.trackedAssets.findIndex(x => x.id === id);
        return (index !== -1);
      }
    }

    return false;
  }

  getMainWatchListDataProvider(): Observable<CoinFullInfo[]> {
    return this.watchListService.mainWatchListSource$.pipe(
      concatMap((watchList: WatchList) => {
        return this.watchListService.trackedAssetDataProviderForWatchList(watchList);
      })
    )
  }

  getWatchListsProvider(): Observable<WatchListMeta[]> {
    return this.userService.basicWatchlistSource$;
  }

  publishEvent(eventType: string, event: any) {
    const appEvent: DashboardEvent = {
      name: eventType,
      event: event
    }
    this.eventSource.next(appEvent);
  }

  sendEvent(event: DashboardEvent) {
    this.eventSource.next(event);
  }

  onWatchListSelected(event: any, addToWatchListCoinId: string) {
    this.watchListService.addToWatchList(event, addToWatchListCoinId);
  }

  createWatchList() {
    this.watchListService.createNewWatchlist(this.sessionService.getCurrentUser().uid)
      .subscribe(
        (watchList: WatchList) => {
          const newWatchListMeta = {
            uid: watchList.uid,
            watchListId: watchList.watchListId,
            watchListName: watchList.watchListName,
            isMain: watchList.isMain
          } as WatchListMeta;
          this.userService.addWatchListMeta(newWatchListMeta);
          watchList.isNew = false;
          this.toast.showSuccessToast('Created New Watch-list, named: ' + watchList.watchListName);
        });
  }
}
