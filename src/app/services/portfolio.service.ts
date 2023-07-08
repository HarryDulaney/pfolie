import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, of, Subject } from 'rxjs';
import { concatMap, map, take, takeUntil, tap } from 'rxjs/operators';
import { PortfolioMeta, OwnedAsset, OwnedAssetView, Portfolio, PortfolioData } from 'src/app/models/portfolio';
import { ApiService } from 'src/app/services/api.service';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UtilityService } from './utility.service';
import { ToastService } from 'src/app/services/toast.service';
import { PortfolioBuilderService } from './portfolio-builder.service';
import { AppEvent } from 'src/app/models/events';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { CacheService } from 'src/app/services/cache.service';
import { UserService } from 'src/app/services/user.service';
import { CONSTANT as Const, EDIT_TRACKED_ITEMS, PROJECT_LINKS, SELECT_ITEM_EVENT, NEW_WATCHLIST_NAME, NEW_PORTFOLIO_NAME } from '../constants'
import { Store } from '../store/store';
import { ListStore } from '../store/list-store';

@Injectable()
export class PortfolioService {

  public isLoading: boolean;
  showSelectModal: boolean = false;
  isInitialized: boolean = false;
  calculatedValues = {
    totalCurrentValue: 0,
    totalCostBasis: 0,
    totalProfitLoss: 0,
  }

  /* Observe portfolio events inside the portfolio component */
  eventSource$: Subject<AppEvent> = new Subject();

  private currentPortfolio: Portfolio = null;
  /* Portfolio Observable - contains Portfolio data and Owned Asset Info */
  private portfolio: BehaviorSubject<Portfolio> = new BehaviorSubject(null);
  public portfolio$ = this.portfolio.asObservable();

  private mainPortfolioStore: Store<Portfolio> = new Store<Portfolio>(null);
  mainPortfolioSource$: Observable<Portfolio> = this.mainPortfolioStore.selectAll();

  private coinSource: ListStore<BasicCoin> = null;
  public coinSource$: Observable<BasicCoin[]> = null;


  /* Datasource for Owned Asset Views
  including Market data on Owned Assets
  the Portfolio Table's market data source */
  private portfolioAssetViews: BehaviorSubject<OwnedAssetView[]> = new BehaviorSubject<OwnedAssetView[]>([]);
  public portfolioAssetViewSource$ = this.portfolioAssetViews.asObservable();

  private calculatedValuesSource: BehaviorSubject<any> = new BehaviorSubject<any>(this.calculatedValues);
  public calculatedValuesSource$ = this.calculatedValuesSource.asObservable();

  portfolioSelectedEvent: Subject<Portfolio> = new Subject();
  initialized$: Subject<boolean> = new Subject();


  constructor(
    public coinDataService: CoinDataService,
    public utilityService: UtilityService,
    private builder: PortfolioBuilderService,
    public toast: ToastService,
    private apiService: ApiService,
    private cache: CacheService,
    private userService: UserService,
    private globalStore: BasicCoinInfoStore) {

    this.userService.mainPortfolioProvider
      .subscribe(res => {
        if (res) {
          this.loadAndOpen(res).subscribe(res => {
            this.mainPortfolioStore.set(res);
          });
        }
      });
  }



  /* ----------------------------- Portfolio Initialization ----------------------------- */
  loadAndOpen(portfolioMeta: PortfolioMeta): Observable<Portfolio> {
    return this.builder.loadPorftfolio(portfolioMeta);
  }

  createNewPortfolio(uid: string): Observable<Portfolio> {
    const meta = { uid: uid, portfolioId: -1, portfolioName: NEW_PORTFOLIO_NAME, isMain: false } as PortfolioMeta
    return this.builder.findNextId()
      .pipe(takeUntil(this.initialized$),
        concatMap(res => {
          let newPortfolio = new Portfolio();
          meta.portfolioId = Number(res.portfolioId);
          newPortfolio.fromBasic(meta, true);
          return this.apiService.createPortfolio(newPortfolio)
            .pipe(
              map(res => {
                res.isNew = true;
                return res;
              }));
        }));
  }


  reset() {
    this.portfolio.next(null);
    this.portfolioAssetViews.next([]);
    this.initialized$ = new Subject();
  }


  get current(): Portfolio {
    return this.currentPortfolio;
  }


  setAssetViews(results: OwnedAssetView[]) {
    this.portfolioAssetViews.next(results);
  }

  setPortfolio(p: Portfolio) {
    if (!p.portfolioData || !p.portfolioData.ownedAssets) {
      p.portfolioData = new PortfolioData([]);
    }

    if (p.isNew) {
      const newPortfoiloMeta = {
        uid: p.uid,
        portfolioId: p.portfolioId,
        portfolioName: p.portfolioName,
        isMain: p.isMain
      } as PortfolioMeta;
      this.userService.addPortfolioMeta(newPortfoiloMeta);
      p.isNew = false;
      p.isCreated = true;
      this.toast.showSuccessToast('Created New Portfolio, named: ' + p.portfolioName);

    }

    this.builder.getOwnedAssetViews(p.portfolioData.ownedAssets)
      .pipe(
        tap((views) => {
          this.calculatedValues.totalCurrentValue = this.builder.getTotalCurrentValue(views);
          this.calculatedValues.totalCostBasis = this.builder.calculatePortfolioTotalCostBasis(views);
        }),
        map(
          views => { return this.builder.getAllocations(views, this.calculatedValues.totalCurrentValue); }
        )
      ).subscribe({
        next: (results: OwnedAssetView[]) => {
          if (results) {
            this.calculatedValues.totalProfitLoss = this.calculatedValues.totalCurrentValue - this.calculatedValues.totalCostBasis;
            this.setAssetViews(results);
            this.calculatedValuesSource.next(this.calculatedValues);
            this.setInitialized();
            this.isLoading = false;
          }

        },
        complete: () => {
          this.isLoading = false;
          this.setInitialized();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.setInitialized();
        }
      });
    this.currentPortfolio = p;
    this.portfolio.next(this.currentPortfolio);
  }

  save(portfolio: Portfolio) {
    this.currentPortfolio = portfolio;
    return lastValueFrom(this.apiService.updatePortfolio(portfolio)).then(result => this.userService.updatePortfolioMeta(portfolio));
  }

  saveCurrent() {
    return this.save(this.current);
  }

  saveAs(portfolio: Portfolio): Observable<any> {
    this.currentPortfolio = portfolio;
    return this.apiService.updatePortfolio(portfolio);
  }

  setInitialized() {
    this.isInitialized = true;
    this.initialized$.next(true);
    this.initialized$.complete();
  }

  /* ----------------------------- Portfolio Assets ----------------------------- */
  private add(asset: OwnedAsset): Portfolio {
    this.currentPortfolio.portfolioData.ownedAssets.push(asset);
    return this.currentPortfolio;
  }

  private update(asset: OwnedAsset): Portfolio {
    let id = asset.id;
    let idx = this.currentPortfolio.portfolioData.ownedAssets.findIndex(a => a.id === id);
    this.currentPortfolio.portfolioData.ownedAssets.splice(idx, 1);
    this.currentPortfolio.portfolioData.ownedAssets.push(asset);
    return this.currentPortfolio;
  }


  public addPortfolioAsset(ownedAsset: OwnedAsset) {
    let isValid = PortfolioBuilderService.isUniqueOwnedAsset(ownedAsset.id, this.portfolio.getValue());
    if (!isValid) {
      this.toast.showInfoToast(ownedAsset.id + ': is already in your portfolio, please update add/update the existing');
      return;
    }

    let asset: OwnedAsset = { id: ownedAsset.id, totalQuantity: ownedAsset.totalQuantity, totalCostBasis: ownedAsset.totalCostBasis, averageUnitCost: ownedAsset.averageUnitCost, transactions: ownedAsset.transactions };
    let updated = this.add(asset);
    this.publishPortfolioChange(asset);
    this.save(updated).then(() => {
      this.updateCalculatedHoldings(this.portfolio.getValue());
      this.toast.showSuccessToast('Updated: ' + ownedAsset.id + ".");
    });

  }


  public updatePortfolioAsset(ownedAsset: OwnedAsset) {
    let asset: OwnedAsset = { id: ownedAsset.id, totalQuantity: ownedAsset.totalQuantity, totalCostBasis: ownedAsset.totalCostBasis, averageUnitCost: ownedAsset.averageUnitCost, transactions: ownedAsset.transactions } as OwnedAsset;
    let updated = this.update(asset);
    this.publishPortfolioChange(asset);
    this.save(updated).then(() => {
      this.updateCalculatedHoldings(this.portfolio.getValue());
      this.toast.showSuccessToast('Updated: ' + ownedAsset.id + ".");
    });
  }


  private publishPortfolioChange(ownedAsset: OwnedAsset) {
    let values = this.currentPortfolio.portfolioData.ownedAssets;
    let idx = values.findIndex(a => a.id === ownedAsset.id);
    if (idx !== -1) {
      values.splice(idx, 1);
    }
    values.push(ownedAsset);
    this.currentPortfolio.portfolioData.ownedAssets = values;
    this.portfolio.next(this.currentPortfolio);
  }


  public deletePortfolioAsset(ownedAsset: OwnedAsset) {
    let subscription = this.toast.showUserPromptToast('Are you sure you want to remove ' + ownedAsset.id + ' from your Portfolio?', 'Confirm Delete')
      .subscribe({
        next: (result) => {
          if (result) {
            this.deleteFromPortfolio(ownedAsset['id']).then(() => {
              this.updateCalculatedHoldings(this.portfolio.getValue());
              this.toast.showSuccessToast(ownedAsset.id + ' was deleted.');
              subscription.unsubscribe();
            })
          } else {
            this.toast.showSuccessToast(ownedAsset.id + ' was not deleted.');
            subscription.unsubscribe();
          }
        },
        complete: () => subscription.unsubscribe(),
        error: () => subscription.unsubscribe()
      });
  }


  private deleteFromPortfolio(id: string): Promise<void> {
    let index = this.currentPortfolio.portfolioData.ownedAssets.findIndex(x => x.id === id);
    this.currentPortfolio.portfolioData.ownedAssets.splice(index, 1);
    this.portfolio.next(this.currentPortfolio);
    return this.save(this.currentPortfolio);
  }

  private updateCalculatedHoldings(updated: Portfolio) {
    this.builder.getOwnedAssetViews(updated.portfolioData.ownedAssets)
      .pipe(
        tap((views) => {
          this.calculatedValues.totalCurrentValue = this.builder.getTotalCurrentValue(views);
          this.calculatedValues.totalCostBasis = this.builder.calculatePortfolioTotalCostBasis(views);
        }),
        map(
          views => { return this.builder.getAllocations(views, this.calculatedValues.totalCurrentValue); }
        )
      ).pipe(take(1)).subscribe({
        next: (results: OwnedAssetView[]) => {
          if (results) {
            this.calculatedValues.totalProfitLoss = this.calculatedValues.totalCurrentValue - this.calculatedValues.totalCostBasis;
            this.setAssetViews(results);
            this.calculatedValuesSource.next(this.calculatedValues);
            this.isLoading = false;
          }

        }
      });
  }



  triggerSelectProjectPopup(): Observable<Portfolio> {
    this.showSelectModal = true;
    return this.portfolioSelectedEvent.asObservable();
  }


  selectPortfolio(portfolio: Portfolio) {
    this.portfolioSelectedEvent.next(portfolio);
  }


  async rename(name: string): Promise<void> {
    this.currentPortfolio.portfolioName = name;
    await this.save(this.currentPortfolio);
    this.portfolio.next(this.currentPortfolio );
    return this.toast.showSuccessToast("Renamed: " + name);
  }


  getAllCoins(): Observable<BasicCoin[]> {
    return this.globalStore.allCoinsStore.select();
  }

  handleDelete(basicPortfolio: PortfolioMeta): Promise<void> {
    return firstValueFrom(this.apiService.deletePortfolio(basicPortfolio)).then(() => {
      this.clearCache(basicPortfolio);
    });
  }

  assignMain(current: Portfolio): Observable<Portfolio> {
    current.isMain = true;
    return this.apiService.setMainPortfolio(current)
      .pipe(
        tap({
          next: (res) => {
            this.userService.updateMainPortfolio(res['portfolio']);
          }
        }),
        map(res => res['portfolio'])
      );
  }

  unAssignMain(current: Portfolio): Observable<Portfolio> {
    current.isMain = false;
    this.userService.resetMainPortfolio();
    this.mainPortfolioStore.set(null);
    return this.apiService.updatePortfolio(current);
  }

  clearCache(basicPortfolio: PortfolioMeta) {
    this.cache.removeLastWorkspace();
  }


  getCoinSource(): Observable<BasicCoin[]> {
    if (this.coinSource === null) {
      this.coinSource = this.globalStore.allCoinsStore.clone();
      this.coinSource$ = this.coinSource.select();
    }
    return this.coinSource$;
  }

}
