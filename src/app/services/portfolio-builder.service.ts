import { Injectable } from '@angular/core';
import { createWatchList } from 'api/backend/controllers/watchlist.controller';
import { forkJoin, Observable, of } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { PortfolioMeta, WatchListMeta, OwnedAsset, OwnedAssetView, Portfolio, PortfolioData, Transaction, WatchList, WatchListData } from 'src/app/models/portfolio';
import { ApiService } from 'src/app/services/api.service';
import { CacheService } from 'src/app/services/cache.service';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UserService } from 'src/app/services/user.service';
import { UtilityService } from 'src/app/services/utility.service';

@Injectable()
export class PortfolioBuilderService {
  constructor(
    public utilityService: UtilityService,
    private coinDataService: CoinDataService,
    private cache: CacheService,
    private userService: UserService,
    private api: ApiService) {
  }


  loadPorftfolio(basicPortfolio: PortfolioMeta): Observable<Portfolio> {
    if (!this.isValidBasicPortfolio(basicPortfolio)) {
      const lastPortfolio = this.cache.getCachedPortfoilo();
      if (lastPortfolio) {
        return this.api.findPortfolioByPortfolioId(basicPortfolio)
          .pipe(
            map(data => {
              return this.mapPortfolio(data);
            }));

      }
      return of(null);
    } else {
      return this.api.findPortfolioByPortfolioId(basicPortfolio)
        .pipe(
          map(data => {
            return this.mapPortfolio(data);
          }));
    }
  }

  isValidBasicPortfolio(basicPortfolio: PortfolioMeta): boolean {
    return (basicPortfolio && basicPortfolio !== undefined && basicPortfolio.portfolioId !== 0 && basicPortfolio.uid !== undefined && basicPortfolio.uid !== null);
  }

  loadWatchList(basicWatchList: WatchListMeta): Observable<WatchList> {
    return this.api.findAllWatchListByWatchListId(basicWatchList)
      .pipe(
        map(data => {
          return this.mapWatchList(data);
        }));

  }

  findNextId(): Observable<any> {
    return this.api.findNextPortfolioId();
  }


  mapPortfolio(apiResult: any): Portfolio {
    let response = apiResult[0];
    let portfolioData: PortfolioData;
    if (response) {
      let ownedAssets = response.portfolioData ? response.portfolioData.ownedAssets : [];
      portfolioData = new PortfolioData(ownedAssets);
    } else {
      portfolioData = new PortfolioData([]);
    }

    let p = new Portfolio();
    p.from(response.uid, response.portfolioId, response.portfolioName, response.isMain, portfolioData, false);
    return p;
  }

  createNewWatchList(meta: WatchListMeta): Observable<WatchList> {
    let newWatchlist = new WatchList();
    newWatchlist.uid = meta.uid;
    return this.api.createWatchList(newWatchlist)
      .pipe(
        map(results => {
          let created = results[0];
          let createdWatchList = new WatchList();
          createdWatchList.from(created.uid, created.watchListId, created.watchListName, created.isMain, new WatchListData([]), true);
          return createdWatchList;
        }),
      );
  }


  findNextWatchListId(): Observable<any> {
    return this.api.findNextWatchListId();
  }


  mapWatchList(apiResult: any): WatchList {
    let response = apiResult[0];
    let trackedAssets = response.watchListData ? response.watchListData.trackedAssets : [];
    let watchListData = new WatchListData(trackedAssets);
    let w = new WatchList();
    w.from(response.uid, response.watchListId, response.watchListName, response.isMain, watchListData, false);
    return w;
  }


  public static isUniqueTrackedAsset(id: string, watchList: WatchList): boolean {
    let exists = watchList.watchListData.trackedAssets.findIndex(x => x.id === id);
    if (exists === -1) {
      return true;
    }

    return false;
  }


  public static isUniqueOwnedAsset(id: string, portfolio: Portfolio): boolean {
    let exists = portfolio.portfolioData.ownedAssets.findIndex(x => x.id === id);
    if (exists === -1) {
      return true;
    }

    return false;
  }


  public hasPortfolios(existingPortfolios: Portfolio[]): boolean {
    return (existingPortfolios && existingPortfolios.length > 0);
  }

  public hasPortfolio(portfoilo: Portfolio): boolean {
    return (portfoilo && portfoilo !== null &&
      portfoilo.portfolioData !== undefined &&
      portfoilo.portfolioData !== null);
  }

  public generateComponent() {

  }

  getOwnedAssetView(asset: OwnedAsset): Observable<OwnedAssetView> {
    return this.coinDataService.readCoinInfo(asset.id).pipe(
      map(coinInfo => { return this.getView(asset, coinInfo) }));

  }


  getOwnedAssetViews(assets: OwnedAsset[]): Observable<OwnedAssetView[]> {
    if (assets.length === 0) {
      return of([]);
    }

    let obsArray = assets.map((asset) => {
      return this.getOwnedAssetView(asset);
    });

    return forkJoin(obsArray);

  }

  getView(ownedAsset: OwnedAsset, coinInfo: CoinFullInfo): OwnedAssetView {
    let view = {} as OwnedAssetView;
    Object.assign(view, ownedAsset);
    view['coinFullInfo'] = coinInfo;
    view.totalQuantity = this.calculateTotalQuantity(ownedAsset);
    view['balance'] = this.getBalance(view.totalQuantity, coinInfo.market_data.current_price['usd']);
    view['totalCostBasis'] = this.calculateTotalCostBasis(ownedAsset);
    view['averageUnitCost'] = this.calculateAverageUnitCost(ownedAsset);
    return view;
  }

  getBalance(quantity: number, currentPrice: number): number {
    return quantity * currentPrice;
  }


  getAllocations(assetViews: OwnedAssetView[], total: number): OwnedAssetView[] {
    assetViews.forEach(
      assetView => {
        if (assetView.balance && total) {
          assetView.allocation = assetView.balance / total;
        } else {
          assetView.allocation = 0;
        }
      }
    );
    return assetViews;
  }

  combineAndReAllocate(assetViews: OwnedAssetView[], totalCost: number, assetView: OwnedAssetView): OwnedAssetView[] {
    let views = Array.from(assetViews);
    views.push(assetView);

    assetViews.forEach(
      assetView => {
        assetView.allocation = assetView.totalCostBasis / totalCost;
      }
    );
    return views;
  }

  getTotalCurrentValue(ownedAssets: OwnedAssetView[]): number {
    let total = 0;
    ownedAssets.forEach(
      assetView => {
        total += assetView.balance;
      }
    );
    return total;
  }

  calculateTotalQuantity(asset: OwnedAsset): number {
    let total = 0;
    asset.transactions.forEach(
      transaction => {
        if (transaction.type === 'buy') {
          total += transaction.quantity;
        } else if (transaction.type === 'sell') {
          total -= transaction.quantity;
        }
      }
    );
    return total;
  }

  calculatePortfolioTotalCostBasis(assetViews: OwnedAssetView[]): number {
    let totalCostBasis = 0;
    for (let view of assetViews) {
      totalCostBasis += view.totalCostBasis;
    }
    return totalCostBasis;
  }

  calculateAverageUnitCost(asset: OwnedAsset): number {
    return asset.totalCostBasis / asset.totalQuantity;
  }

  calculateTotalCostBasis(asset: OwnedAsset): number {
    let total = 0;
    asset.transactions.forEach(
      transaction => {
        if (transaction.type === 'buy') {
      total += transaction.quantity * transaction.unitPrice;
    }
  }
    );
    return total;
  }

getBasicOwnedAssetObject(
  id: string,
  quantity: number,
  costBasis ?: number,
  transactions ?: Transaction[]): OwnedAsset {
  return {
    id: id,
    totalQuantity: quantity,
    totalCostBasis: costBasis,
    allocation: 0,
    transactions: transactions
  } as OwnedAsset;

}


/**
 * Get the amount of the asset 
 * that can be purchased for one usd dollar.
 * 
 * [USD] = [USD/BTC] * [BTC]
 * Used to weight asset values to determine portfolio allocation.
 */
getDollarToAssetWeight(currentPrice: number) {
  const exchangeRate = 1 / currentPrice;
  return exchangeRate * currentPrice;
}
}
