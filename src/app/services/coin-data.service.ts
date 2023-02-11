import { Injectable } from '@angular/core';
import { CoinFullInfo, Trending, SimplePriceResponse, CoinMarket, GlobalData, TrendingItem, CoinTableView, CoinMarketChartResponse } from '../models/coin-gecko';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { CurrencyPipe } from '@angular/common';
import { UtilityService } from './utility.service';
import { GlobalStore } from '../store/global/global.store';
@Injectable({
  providedIn: 'root',
})
export class CoinDataService {
  globalMarketData: BehaviorSubject<GlobalData> = new BehaviorSubject<GlobalData>({} as GlobalData);

  currencies: string[] = ["usd", "btc", "eth", "ltc", "bch", "bnb", "eos", "xrp", "xlm", "link", "dot", "yfi", "aed"];
  priceChangePercent: string[] = ["1h", "24h", "7d", "14d", "30d", "200d", "1y"];
  activePriceChangePercent: string[] = ["1h", "24h", "7d"];
  orderByValues: string[] = ["market_cap_desc", "gecko_desc", "gecko_asc", "market_cap_asc", "market_cap_desc", "volume_asc", "volume_desc", "id_asc", "id_desc"];
  sparklineXAxisLabels: string[] = [];

  lastRetrievedpage: number = 0;
  defaultCurrency: string;
  paginationPageSize: number = 50;
  thruPage = 1;
  orderBy: string = this.orderByValues[0];

  constructor(private apiService: ApiService,
    public currencyPipe: CurrencyPipe,
    public utilityService: UtilityService
  ) {
    this.defaultCurrency = this.currencies[0];

  }

  getSparklineLabels(): string[] {
    if (this.sparklineXAxisLabels.length === 0) {
      this.sparklineXAxisLabels = this.generateXAxisPoints();
    }
    return this.sparklineXAxisLabels;
  }

  public getPrice(id: string, currency: string): Observable<SimplePriceResponse> {
    return this.apiService.getPriceById(id, currency);
  }


  public getSpecificCoinData(
    listOfIds,
    tickers,
    marketData,
    communityData,
    devData,
    sparkLine): Observable<CoinFullInfo[]> {
    let strIds = listOfIds.join(',');
    return this.apiService.getSpecificCoinInfo(strIds, tickers, marketData, communityData, devData, sparkLine);
  }


  public readCoinInfo(coinId: string): Observable<CoinFullInfo> {
    return this.apiService.getCoinFullInfo(coinId).pipe(
      map(value => {
        return value;
      })
    )
  }

  generateXAxisPoints(): string[] {
    let points: string[] = [];
    for (let i = 0; i < 170; i++) {
      points.push('\'' + i + '\'')
    }
    return points;
  }

  getMarketChart(coinId: string, vsCurrency: string, days: number | string, interval: string): Observable<CoinMarketChartResponse> {
    return this.apiService.getMarketChartByIdAndDays(coinId, vsCurrency, days, interval).pipe();
  }

  getChartOHLC(coinId: string, vsCurrency: string, days: number): Observable<Array<Array<number>>> {
    return this.apiService.getOHLCByIdAndDays(coinId, vsCurrency, days);
  }


}
