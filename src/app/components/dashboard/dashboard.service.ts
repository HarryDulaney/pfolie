import { Injectable } from '@angular/core';
import { LazyLoadEvent } from 'primeng/api';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BasicCoin, CoinMarket, CoinTableView, GlobalData, GlobalDataView, Trending, TrendingItem } from 'src/app/models/coin-gecko';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';

@Injectable()
export class DashboardService {
  currencies: string[] = ["usd", "btc", "eth", "ltc", "bch", "bnb", "eos", "xrp", "xlm", "link", "dot", "yfi", "aed"];
  priceChangePercent: string[] = ["1h", "24h", "7d", "14d", "30d", "200d", "1y"];
  activePriceChangePercent: string[] = ["1h", "24h", "7d"];
  orderByValues: string[] = ["market_cap_desc", "gecko_desc", "gecko_asc", "market_cap_asc", "market_cap_desc", "volume_asc", "volume_desc", "id_asc", "id_desc"];
  sparklineXAxisLabels: string[] = [];

  defaultCurrency: string;
  thruPage = 1;
  orderBy: string = this.orderByValues[0];
  coinsSource$: Observable<BasicCoin[]>;

  constructor(
    private apiService: ApiService,
    private utilityService: UtilityService,
    basicCoinStore: BasicCoinInfoStore
  ) {
    this.defaultCurrency = this.currencies[0];
    this.coinsSource$ = basicCoinStore.state$.select('basicCoins');
  }

  getTrending(): Observable<CoinTableView[]> {
    return this.readTrending().pipe(
      switchMap(data => this.getTrendingCoinsInfo(data)),
      map(result => {
        return result.map((value) => {
          return this.getMarketDataView(value);
        })
      })
    )
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
      map(result => {
        return result.map((value) => {
          return this.getMarketDataView(value);
        })
      })
    )
  }

  public getGlobalData(): Observable<GlobalDataView> {
    return this.apiService.getGlobalDataCrypto().pipe(
      map((result) => {
        return this.getGlobalDataView(result.data);
      })
    )
  }

  getTrendingCoinsInfo(trendingItems: Trending[]): Observable<CoinMarket[]> {
    let trendingIds = trendingItems.map(((trending: Trending) => {
      return this.getTrendingItem(trending).id;
    }))

    return this.getCoinMarketDataByIds(trendingIds, this.thruPage, 7, this.defaultCurrency, this.orderBy, true, this.activePriceChangePercent);
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


  getGlobalDataView(globalData: GlobalData): GlobalDataView {
    return {
      total_volume: globalData.total_volume['usd'],
      total_market_cap_usd: globalData.total_market_cap['usd'],
      market_cap_change_percentage_24h_usd: globalData.market_cap_change_percentage_24h_usd,
      total_volume_formated: this.utilityService.format(globalData.total_volume['usd'], '2dec'),
      total_market_cap_usd_formated: this.utilityService.format(globalData.total_market_cap['usd'], '2dec'),
      market_cap_change_percentage_24h_usd_formated: this.utilityService.format(globalData.market_cap_change_percentage_24h_usd, 'pd'),
      market_cap_percentage: globalData.market_cap_percentage
    } as GlobalDataView;  }

}
