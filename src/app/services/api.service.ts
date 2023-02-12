import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BasicCoin, CoinFullInfo, CoinMarket, CoinMarketChartResponse, GlobalData, SimplePriceResponse, TrendingResponse } from '../models/coin-gecko';
import { environment } from 'src/environments/environment';
import { API_ROUTES, API_ROUTES as COINAPI, CONSTANT, IP_SERVICE_URI } from '../constants';
import { RssFeed } from '../models/rssfeed';
import { API_ROOTS } from '../constants'
import { Portfolio } from '../models/portfolio';
import { catchError } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable()
export class ApiService {
  private readonly APP_API_ROOT = environment.APP_API_ROOT;

  constructor(
    private http: HttpClient,
    private toast: ToastService
  ) {
  }

  private post<Q>(url: string, q: Q): Observable<Q> {
    return this.http.post<Q>(`${this.APP_API_ROOT}/${url}`, q).pipe(
      catchError(this.handleErrors<Q>(url, q)));
  }

  private put<Q>(url: string, q: Q): Observable<Q> {
    return this.http.put<Q>(`${this.APP_API_ROOT}/${url}`, q).pipe(
      catchError(this.handleErrors<Q>(url, q)));
  }


  private get<Q>(url: string): Observable<Q> {
    return this.http.get<Q>(`${this.APP_API_ROOT}/${url}`).pipe(
      catchError(this.handleErrors<Q>(url)));
  }

  private delete<Q>(url: string, q: Q): Observable<Q> {
    return this.http.delete<Q>(`${this.APP_API_ROOT}/${url}`, q).pipe(
      catchError(this.handleErrors<Q>(url, q)));
  }


  private handleErrors<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      this.toast.showErrorToast("API error, please report this bug to system admin: " + error);
      return of(result as T);
    };
  }

  /* ---------------------------------------------- PostgreSql API Endpoints ---------------------------------------------- */

  /* ------------------------------ Portfolio ---------------------------- */
  findAllPortfoliosByUser(uid: string): Observable<any[]> {
    return this.get<any[]>(`portfolio/${uid}`)
  }

  findPortfolioByPortfolioId(pid: number): Observable<Portfolio> {
    return this.get<Portfolio>(`portfolio/${pid}`);
  }

  createPortfolio(portfolio: Portfolio): Observable<any> {
    return this.put<any>('portfolio', portfolio);
  }

  updatePortfolio(portfolio: Portfolio): Observable<any> {
    return this.post<any>('portfolio', portfolio);
  }

  deletePortfolio(portfolio: Portfolio): Observable<any> {
    return this.delete<any>('portfolio', portfolio);
  }


  /* ---------------------------------------------- RSS Feed API Endpoints ---------------------------------------------- */

  fetchFeedByUrl(url: string): Observable<RssFeed> {
    return this.http.post<RssFeed>(`${this.APP_API_ROOT}/news/fetch-feed`, { url: url });
  }


  /* ---------------------------------------- Connect to CoinGecko API Endpoints ---------------------------------------- */

  getTrendingCoins(): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>(`${API_ROOTS.COINGECKO}${COINAPI.SEARCH_TRENDING}`);
  }

  getListCoins(): Observable<BasicCoin[]> {
    return this.http.get<BasicCoin[]>(`${API_ROOTS.COINGECKO}${COINAPI.COIN_LIST}`);
  }

  getGlobalDataCrypto(): Observable<any> {
    return this.http.get<any>(`${API_ROOTS.COINGECKO}${API_ROUTES.GLOBAL}`);
  }

  getCoinFullInfo(id: string): Observable<CoinFullInfo> {
    return this.http.get<CoinFullInfo>(`${API_ROOTS.COINGECKO}/coins/${id}`);
  }

  getSpecificCoinInfo(
    ids: string[],
    tickers: boolean,
    marketData: boolean,
    communityData: boolean,
    devData: boolean,
    sparkLine: boolean
  ): Observable<CoinFullInfo[]> {
    return this.http.get<CoinFullInfo[]>(`${API_ROOTS.COINGECKO}/coins/${ids}?tickers=${tickers}&market_data=${marketData}&community_data=${communityData}&developer_data=${devData}&sparkline=${sparkLine}`);
  }

  getPriceById(ids: string, currencies: string): Observable<SimplePriceResponse> {
    return this.http.get<SimplePriceResponse>(`${API_ROOTS.COINGECKO}/simple/price?ids=${ids}&vs_currencies=${currencies}`);
  }

  getPagedMarketData(
    thruPage: number,
    pageSize: number,
    vsCurrency: string,
    orderBy: string,
    sparkline: boolean,
    priceChangePercentage): Observable<CoinMarket[]> {
    return this.http.get<CoinMarket[]>
      (`${API_ROOTS.COINGECKO}/coins/markets?vs_currency=${vsCurrency}&order=${orderBy}&per_page=${pageSize} &
    page=${thruPage}&sparkline=${sparkline}&price_change_percentage${priceChangePercentage}`);
  }

  getPagedMarketDataByIds(
    ids: string[],
    thruPage: number,
    pageSize: number,
    vsCurrency: string,
    orderBy: string,
    sparkline: boolean,
    priceChangePercentage): Observable<CoinMarket[]> {
    return this.http.get<CoinMarket[]>
      (`${API_ROOTS.COINGECKO}/coins/markets?ids=${ids}&vs_currency=${vsCurrency}&order=${orderBy}&per_page=${pageSize}&page=${thruPage}&sparkline=${sparkline}&price_change_percentage${priceChangePercentage}`);
  }

  /**
   * Get historical market data include price, market cap, and 24h volume (granularity auto)
   * Data granularity is automatic (cannot be adjusted)
   * 1 day from current time = 5 minute interval data
   * 1 - 90 days from current time = hourly data
   * above 90 days from current time = daily data (00:00 UTC)
   * 
   * @param id coin id (from /coins) eg. bitcoin
   * @param vsCurrency The target currency of market data (usd, eur, jpy, etc.)
   * @param days Data up to number of days ago (eg. 1,14,30,max)
   * @param interval Data interval. eg. daily
   * @returns Observable<CoinMarketCharResponse>
   */
  getMarketChartByIdAndDays(
    id: string,
    vsCurrency: string,
    days: number | string,
    interval: string
  ): Observable<CoinMarketChartResponse> {
    return this.http.get<CoinMarketChartResponse>
      (`${API_ROOTS.COINGECKO}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval${interval}`);
  }


  getOHLCByIdAndDays(
    id: string,
    vsCurrency: string,
    days: number
  ): Observable<Array<Array<number>>> {
    return this.http.get<Array<Array<number>>>
      (`${API_ROOTS.COINGECKO}/coins/${id}/ohlc?vs_currency=${vsCurrency}&days=${days}`);
  }

  getUserIdentifier(): Observable<any> {
    return this.http.get(IP_SERVICE_URI);
  }

}
