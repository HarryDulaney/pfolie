import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { OwnedAsset, OwnedAssetView, Portfolio, PortfolioData, PortfolioPreferences, Transaction } from 'src/app/models/portfolio';
import { ApiService } from 'src/app/services/api.service';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UtilityService } from 'src/app/services/utility.service';

@Injectable({
  providedIn: 'root'
})
export class PortfolioBuilderService {

  constructor(
    public utilityService: UtilityService,
    private coinDataService: CoinDataService,
    private api: ApiService) {
  }


  loadPorftfolio(apiResponse: any[], uid: string): Observable<Portfolio> {
    let value = apiResponse[0];
    let components = value['portfolio_data']['components'] || [];
    let trackedAssets = value['portfolio_data']['trackedAssets'] || [];
    let ownedAssets = value['portfolio_data']['ownedAssets'] || [];

    let portfolioData = new PortfolioData(trackedAssets, components, ownedAssets);
    let preferences = new PortfolioPreferences(value.preferences['view']);
    let p = new Portfolio();

    p.portfolioId = value['portfolio_id'];
    p.preferences = preferences;
    p.uid = value['uid'];
    p.portfolioName = value['portfolio_name'];
    p.localization = value['localization'];
    Object.assign(p.portfolioData, portfolioData);
    return of(p);

  }

  createNewPortfolio(uid: string): Observable<Portfolio> {
    let newPortfolio = new Portfolio();
    newPortfolio.uid = uid;
    return this.api.createPortfolio(newPortfolio).pipe(
      map(created => {
        let value = created[0];
        let createdPortfolio = new Portfolio();
        createdPortfolio.uid = uid;
        createdPortfolio.portfolioId = value['portfolio_id'];
        createdPortfolio.portfolioName = value['portfolio_name']
        createdPortfolio.localization = value['localization'];
        let portfolioData = new PortfolioData([], [], []);
        createdPortfolio.portfolioData = portfolioData;
        createdPortfolio.preferences = new PortfolioPreferences(value.preferences['view']);
        return createdPortfolio;
      })
    );
  }


  loadPorftfolios(uid: string): Observable<Portfolio[]> {
    return this.api.findAllPortfoliosByUser(uid).pipe(
      map(data => data.map(
        (value) => {
          let data = value['portfolio_data'];
          let portfolioData = new PortfolioData(data['trackedAssets'], data['components'], data['ownedAssets']);
          let preferences = new PortfolioPreferences(value.preferences['view']);
          let p = new Portfolio();
          p.portfolioId = value['portfolio_id'],
            p.uid = value['uid'],
            p.portfolioName = value['portfolio_name'],
            p.localization = value['localization'],
            p.portfolioData = portfolioData,
            p.preferences = preferences
          return p;

        })
      )
    );
  }


  public static isUniqueTrackedAsset(id: string, portfolio: Portfolio): boolean {
    let exists = portfolio.portfolioData.trackedAssets.findIndex(x => x.id === id);
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
    costBasis?: number,
    transactions?: Transaction[]): OwnedAsset {
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
