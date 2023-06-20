import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BasicCoin, CoinFullInfo, CoinMarket, CoinMarketChartResponse, GlobalData, GlobalMarketCapData, SimplePriceResponse, TrendingResponse } from '../models/coin-gecko';
import { environment } from 'src/environments/environment';
import { API_ROUTES, API_ROUTES as COINAPI, IP_SERVICE_URI } from '../constants';
import { ApiNewsFeed, NewsFeed } from '../models/news-feed';
import { API_ROOTS } from '../constants'
import { PortfolioMeta, WatchListMeta, Portfolio, PortfolioData, WatchList } from '../models/portfolio';
import { catchError, map } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable()
export class ApiService {
  private readonly APP_API_ROOT = environment.APP_API_ROOT;
  private CG_HEADERS: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-cg-pro-api-key': environment.CG_API_KEY
  });

  private CG_OPTIONS = { headers: this.CG_HEADERS };

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

  /* ---------------------------------------------- Backend and Database APIs ---------------------------------------------- */

  /* ------------------------------ Portfolio ---------------------------- */
  findAllPortfoliosInfo(uid: string): Observable<PortfolioMeta[]> {
    return this.get<PortfolioMeta[]>(`portfolio/info/${uid}`);
  }

  getPortfolioData(uid: string, pid: number): Observable<PortfolioData> {
    return this.get<PortfolioData>(`portfolio/${uid}/${pid}`);
  }

  findAllPortfoliosByUser(uid: string): Observable<any[]> {
    return this.get<any[]>(`portfolio/${uid}`)
  }

  findNextPortfolioId(): Observable<any> {
    return this.get<any>(`portfolio/next-id`)
  }

  findPortfolioByPortfolioId(basicPortfolio: PortfolioMeta): Observable<any> {
    return this.post<any>('portfolio/find-one', basicPortfolio);
  }

  createPortfolio(portfolio: Portfolio): Observable<any> {
    return this.post<any>('portfolio/create', portfolio).pipe(
      map((res: any) => { return res[0]; }));
  }

  updatePortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.post<Portfolio>('portfolio/update', portfolio);
  }

  deletePortfolio(basicPortfolio: PortfolioMeta): Observable<any> {
    return this.post<any>('portfolio/delete', basicPortfolio);
  }

  setMainPortfolio(portfolio: Portfolio): Observable<{ message: any, portfolio: Portfolio }> {
    return this.post<Portfolio>('portfolio/set-main', portfolio).pipe(
      map((res: any) => { return { message: res, portfolio: portfolio } }));
  }

  /* -------------------------------  Watchlists and Tracked Assets ------------------------------------  */

  findAllWatchListsInfo(uid: string): Observable<WatchListMeta[]> {
    return this.get<WatchListMeta[]>(`watch-list/info/${uid}`);
  }

  findNextWatchListId(): Observable<any> {
    return this.get<any>(`watch-list/next-id`)
  }

  findAllWatchListByWatchListId(basicWatchList: WatchListMeta): Observable<any> {
    return this.post<any>('watch-list/find-one', basicWatchList);
  }

  updateWatchList(watchList: WatchList): Observable<any> {
    return this.post<any>('watch-list/update', watchList);
  }

  createWatchList(watchList: WatchList): Observable<any> {
    return this.post<any>('watch-list/create', watchList)
      .pipe(
        map((res: any) => { return res[0]; }));
  }

  deleteWatchList(watchListMeta: WatchListMeta): Observable<any> {
    return this.post<any>('watch-list/delete', watchListMeta);
  }

  setMainWatchList(watchList: WatchList): Observable<{ message: any, watchlist: WatchList }> {
    return this.post<any>('watch-list/set-main', watchList).pipe(
      map((res: any) => { return { message: res, watchlist: watchList } }));
  }


  /* --------------------------------------- Polygon --------------------------------------------- */
  getStockNews(ticker: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.APP_API_ROOT}/polygon/news/${ticker}`);
  }

  getRecentStockNews(limit: number): Observable<ApiNewsFeed> {
    return this.http.get<ApiNewsFeed>(`${this.APP_API_ROOT}/polygon/news/recent/${limit}`)
      .pipe(catchError(this.handleErrors('getRecentStockNews', null)));
  }

  /* ---------------------------------------------- RSS Feed API ---------------------------------------------- */

  fetchFeedByUrl(url: string): Observable<NewsFeed> {
    return this.http.post<NewsFeed>(`${this.APP_API_ROOT}/news/fetch-feed`, { url: url });
  }


  /* ---------------------------------------- CoinGecko API ---------------------------------------- */

  getGlobalMarketCapChart(days: number, vsCurrency: string): Observable<GlobalMarketCapData> {
    return this.http.get<GlobalMarketCapData>(`${API_ROOTS.COINGECKO}/global/market_cap_chart?days=${days}&vs_currency=${vsCurrency}`, this.CG_OPTIONS);
  }

  getTrendingCoins(): Observable<TrendingResponse> {
    return this.http.get<TrendingResponse>(`${API_ROOTS.COINGECKO}${COINAPI.SEARCH_TRENDING}`, this.CG_OPTIONS);
  }

  getListCoins(): Observable<BasicCoin[]> {
    return this.http.get<BasicCoin[]>(`${API_ROOTS.COINGECKO}${COINAPI.COIN_LIST}`, this.CG_OPTIONS);
  }

  getGlobalDataCrypto(): Observable<GlobalData> {
    return this.http.get<GlobalData>(`${API_ROOTS.COINGECKO}${API_ROUTES.GLOBAL}`, this.CG_OPTIONS);
  }

  getCoinFullInfo(id: string, sparkline: boolean): Observable<CoinFullInfo> {
    return this.http.get<CoinFullInfo>(`${API_ROOTS.COINGECKO}/coins/${id}?sparkline=${sparkline}`, this.CG_OPTIONS);
  }

  getSupportedVsCurrencies(): Observable<string[]> {
    return this.http.get<string[]>(`${API_ROOTS.COINGECKO}/simple/supported_vs_currencies`, this.CG_OPTIONS);
  }


  getSpecificCoinInfo(
    ids: string[],
    tickers: boolean,
    marketData: boolean,
    communityData: boolean,
    devData: boolean,
    sparkLine: boolean
  ): Observable<CoinFullInfo[]> {
    return this.http
      .get<CoinFullInfo[]>(`${API_ROOTS.COINGECKO}/coins/${ids}?tickers=${tickers}&market_data=${marketData}&community_data=${communityData}&developer_data=${devData}&sparkline=${sparkLine}`,
        this.CG_OPTIONS);
  }

  getPriceById(ids: string, currencies: string): Observable<SimplePriceResponse> {
    return this.http.get<SimplePriceResponse>(`${API_ROOTS.COINGECKO}/simple/price?ids=${ids}&vs_currencies=${currencies}`,
      this.CG_OPTIONS);
  }

  getPagedMarketData(
    thruPage: number,
    pageSize: number,
    vsCurrency: string,
    orderBy: string,
    sparkline: boolean,
    priceChangePercentage): Observable<CoinMarket[]> {
    return this.http.get<CoinMarket[]>
      (`${API_ROOTS.COINGECKO}/coins/markets?vs_currency=${vsCurrency}&order=${orderBy}&per_page=${pageSize}&page=${thruPage}&sparkline=${sparkline}&price_change_percentage${priceChangePercentage}`, this.CG_OPTIONS);
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
      (`${API_ROOTS.COINGECKO}/coins/markets?ids=${ids}&vs_currency=${vsCurrency}&order=${orderBy}&per_page=${pageSize}&page=${thruPage}&sparkline=${sparkline}&price_change_percentage${priceChangePercentage}`,
        this.CG_OPTIONS);
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
      (`${API_ROOTS.COINGECKO}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval${interval}`, this.CG_OPTIONS);
  }


  getOHLCByIdAndDays(
    id: string,
    vsCurrency: string,
    days: number
  ): Observable<Array<Array<number>>> {
    return this.http.get<Array<Array<number>>>
      (`${API_ROOTS.COINGECKO}/coins/${id}/ohlc?vs_currency=${vsCurrency}&days=${days}`, this.CG_OPTIONS);
  }

  getUserIdentifier(): Observable<any> {
    return this.http.get(IP_SERVICE_URI);
  }

}
