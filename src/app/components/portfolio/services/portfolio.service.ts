import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Observable, Subject } from 'rxjs';
import { concatMap, take, takeUntil } from 'rxjs/operators';
import { OwnedAsset, OwnedAssetView, Portfolio, TrackedAsset, ViewPreferences } from 'src/app/models/portfolio';
import { ApiService } from 'src/app/services/api.service';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UtilityService } from '../../../services/utility.service';
import { ToastService } from 'src/app/services/toast.service';
import { FloatingButtonService } from '../components/floatting-toolbar-button/floating-button.service';
import firebase from 'firebase/compat/app';
import { PortfolioBuilderService } from './portfolio-builder.service';
import { AppEvent } from 'src/app/models/events';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import { BasicCoin } from 'src/app/models/coin-gecko';


@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  public isLoading: boolean;
  private user = null;
  showSelectModal: boolean = false;
  isInitialized: boolean = false;

  /* Observe portoflio events inside the portfolio component */
  eventSource$: Subject<AppEvent> = new Subject();

  /* Subject controls opening and closing the Toolbar */
  showToolbar: Subject<boolean> = new Subject();

  /* Portfolio Observable - contains Preferences + Tracked Asset Id's + Owned Asset Info */
  private portfolio: BehaviorSubject<Portfolio> = new BehaviorSubject(null);
  public portfolio$ = this.portfolio.asObservable();

  /* Tracked Assets Observable , the Tracked Asset Table's datasource */
  private trackedSource: BehaviorSubject<TrackedAsset[]> = new BehaviorSubject<TrackedAsset[]>([]);
  public trackedSource$ = this.trackedSource.asObservable();


  /* Datasource for Market data on Owned Assets, the Portfolio Table's market data source */
  private portfolioDataSource: BehaviorSubject<OwnedAsset[]> = new BehaviorSubject<OwnedAsset[]>([]);
  public portfolioDataSource$ = this.portfolioDataSource.asObservable();

  /* Datasource for Owned Asset Views */
  private portfolioAssetViews: BehaviorSubject<OwnedAssetView[]> = new BehaviorSubject<OwnedAssetView[]>([]);
  public portfolioAssetViewSource$ = this.portfolioAssetViews.asObservable();


  portfolioSelectedEvent: Subject<Portfolio> = new Subject();
  portfolioInitializedEvent: Subject<boolean> = new Subject();

  constructor(
    public coinDataService: CoinDataService,
    public utilityService: UtilityService,
    private builder: PortfolioBuilderService,
    private floatingButton: FloatingButtonService,
    private toast: ToastService,
    private apiService: ApiService,
    private globalStore: BasicCoinInfoStore) {
  }


  handleStartPortfolioSession(user: firebase.User) {
    this.isLoading = true;
    this.user = user;
    if (user && user.uid) {
      this.apiService.findAllPortfoliosByUser(user.uid).pipe(
        takeUntil(this.portfolioInitializedEvent),
        concatMap(
          (response) => {
            let value = response[0];
            let obs: Observable<Portfolio>;
            if (!value || value === undefined) {
              return this.builder.createNewPortfolio(user.uid);
            } else {
              return this.builder.loadPorftfolio(response, user.uid);
            }
          }
        ))
        .subscribe(
          {
            next: (result) => {
              this.setPortfolio(result);
              this.initTrackedAssets(result);
              this.initPortfolioAssets(result)
              this.isLoading = false;
              this.portfolioInitializedEvent.next(true);
              this.portfolioInitializedEvent.complete();
            },

            error: (error) => {
              this.isLoading = false;
              console.log("Create Portfolio Session Error: " + JSON.stringify(error.message));
              this.portfolioInitializedEvent.next(true);
              this.portfolioInitializedEvent.complete();

            },
            complete: () => {
              this.isLoading = false;
              this.portfolioInitializedEvent.next(true);
              this.portfolioInitializedEvent.complete();
            }
          }
        );
    }
  }


  endSession() {
    this.portfolio.next(null);
    this.trackedSource.next([]);
  }


  setAssetViews(results: OwnedAssetView[]) {
    this.portfolioAssetViews.next(results);
  }


  /* ----------------------------- Portfolio ----------------------------- */
  setPortfolio(p: Portfolio) {
    if (p && p.portfolioId !== -1) {
      this.portfolio.next(p);
    }
  }

  save(portfolio: Portfolio) {
    return lastValueFrom(this.apiService.updatePortfolio(portfolio)).then(result => console.info('Portfolio Updated.'));
  }


  /* ----------------------------- Portfolio Assets ----------------------------- */
  private addTrackedToPortfolio(trackedAsset: TrackedAsset): Portfolio {
    let updated = this.portfolio.getValue();
    updated.portfolioData.trackedAssets.push(trackedAsset);
    return updated;
  }


  initPortfolioAssets(portfolio: Portfolio) {
    let ownedAssets = portfolio.portfolioData.ownedAssets;

    if (ownedAssets.length < 1) {
      this.portfolioDataSource.next([]);
    }

    this.portfolioDataSource.next(ownedAssets);
  }

  private add(asset: OwnedAsset): Portfolio {
    let updated = this.portfolio.getValue();
    updated.portfolioData.ownedAssets.push(asset);
    return updated;
  }

  private update(asset: OwnedAsset): Portfolio {
    let id = asset.id;
    let updated = this.portfolio.getValue();
    let idx = updated.portfolioData.ownedAssets.findIndex(a => a.id === id);
    updated.portfolioData.ownedAssets.splice(idx, 1);
    updated.portfolioData.ownedAssets.push(asset);
    return updated;
  }


  public addPortfolioAsset(ownedAsset: OwnedAsset) {
    let isValid = PortfolioBuilderService.isUniqueOwnedAsset(ownedAsset.id, this.portfolio.getValue());
    if (!isValid) {
      this.toast.showInfoToast(ownedAsset.id + ': is already in your portfolio, please update add/update the existing');
      return;
    }

    let asset: OwnedAsset = { id: ownedAsset.id, totalQuantity: ownedAsset.totalQuantity, totalCostBasis: ownedAsset.totalCostBasis, averageUnitCost: ownedAsset.averageUnitCost, transactions: ownedAsset.transactions };
    let updated = this.add(asset);
    this.updatePortfolioAssetTable(asset);
    this.save(updated);
    this.portfolio.next(updated);
    this.toast.showSuccessToast('Updated: ' + ownedAsset.id + ".");
  }


  public updatePortfolioAsset(ownedAsset: OwnedAsset) {
    let asset: OwnedAsset = { id: ownedAsset.id, totalQuantity: ownedAsset.totalQuantity, totalCostBasis: ownedAsset.totalCostBasis, averageUnitCost: ownedAsset.averageUnitCost, transactions: ownedAsset.transactions } as OwnedAsset;
    let updated = this.update(asset);
    this.updatePortfolioAssetTable(asset);
    this.save(updated);
    this.portfolio.next(updated);
    this.toast.showSuccessToast('Updated: ' + ownedAsset.id);
  }


  private updatePortfolioAssetTable(ownedAsset: OwnedAsset) {
    let values = this.portfolioDataSource.getValue();
    let idx = values.findIndex(a => a.id === ownedAsset.id);
    if (idx !== -1) {
      values.splice(idx, 1);
    }
    values.push(ownedAsset);
    this.portfolioDataSource.next(values);
  }


  public deletePortfolioAsset(ownedAsset: OwnedAsset) {
    let subscription = this.toast.showUserPromptToast('Are you sure you want to remove ' + ownedAsset.id + ' from your Portfolio?', 'Confirm Delete')
      .subscribe({
        next: (result) => {
          if (result) {
            this.deleteFromPortfolio(ownedAsset['id']).then(() => {
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
    let curr = this.portfolio.getValue();
    let index = curr.portfolioData.ownedAssets.findIndex(x => x.id === id);
    curr.portfolioData.ownedAssets.splice(index, 1);
    this.portfolio.next(curr);
    this.portfolioDataSource.next(curr.portfolioData.ownedAssets);
    return this.save(curr);
  }


  /* ----------------------------- Tracked Assets ----------------------------- */
  updateTrackedAssetsTable(trackedAsset: TrackedAsset) {
    let currentValues = this.trackedSource.getValue();
    let idx = currentValues.findIndex(x => x.id === trackedAsset.id);
    if (idx !== -1) {
      currentValues.splice(idx, 1);
    }
    currentValues.push(trackedAsset);
    this.trackedSource.next(currentValues);
  }


  initTrackedAssets(portfolio: Portfolio) {
    let trackedAssets = portfolio.portfolioData.trackedAssets;

    if (trackedAssets.length < 1) {
      this.trackedSource.next([]);
    }
    this.trackedSource.next(trackedAssets)

  }

  /**
   * Initialize Custom Portfolio Parts (Components) to render in the Workspace 
   */
  /*   initPortfolioParts(portfolio: Portfolio): Observable<PortfolioPart[]> {
      let ids = portfolio.portfolioData.componentIds;
      console.log("Init portfolio Parts....");
   
      if (ids.length < 1) {
        this.$componentSource.next([]);
        return of([]);
      }
   
      let parts: Observable<PortfolioPart>[] = ids.map((id) => { return this.apiService.getPortfolioPart(id); });
      return forkJoin(parts).pipe(
        tap(portfolioParts => {
          this.$componentSource.next(portfolioParts)
        })
      );
    } */


  addTracked(id: string) {
    /*    
  
    let asset = { id: ownedAsset.id, quantity: ownedAsset.quantity, costBasis: ownedAsset.costBasis };
    let updated = this.add(asset);
  
    */
    let isValid = PortfolioBuilderService.isUniqueTrackedAsset(id, this.portfolio.getValue());
    if (!isValid) {
      this.toast.showInfoToast('You are already tracking asset: ' + id);
      return;
    }

    const newTrackedAsset = { id: id } as TrackedAsset;

    let updatedPortfolio = this.addTrackedToPortfolio(newTrackedAsset);
    this.updateTrackedAssetsTable(newTrackedAsset);
    this.save(updatedPortfolio);
    this.portfolio.next(updatedPortfolio);
    this.toast.showSuccessToast('Tracking: ' + id + ".");
  }


  deleteTrackedAsset(trackedAsset: TrackedAsset) {
    let subscription = this.toast.showUserPromptToast('Are you sure you want to delete ' + trackedAsset.id, 'Confirm Delete')
      .subscribe({
        next: (result) => {
          if (result) {
            this.deleteTracked(trackedAsset.id).then(() => {
              this.toast.showSuccessToast(trackedAsset.id + ' was deleted.');
              subscription.unsubscribe();
            })
          } else {
            this.toast.showSuccessToast(trackedAsset.id + ' was not deleted.');
            subscription.unsubscribe();
          }
        },
        complete: () => subscription.unsubscribe(),
        error: () => subscription.unsubscribe()
      });
  }


  deleteTracked(id: string): Promise<void> {
    let curr = this.portfolio.getValue();
    let index = curr.portfolioData.trackedAssets.findIndex(x => x.id === id);
    curr.portfolioData.trackedAssets.splice(index, 1);
    this.portfolio.next(curr);

    this.trackedSource.next(curr.portfolioData.trackedAssets);

    return this.save(curr);
  }

  /* ------------------  Handle Events outside of the Portfoilio Builder ------------------ */
  /* -------------------------------  Handle Preferences ----------------------------------- */

  openToolbar() {
    this.showToolbar.next(true);
  }


  hideToolbar() {
    this.showToolbar.next(false);
    this.floatingButton.show();
  }


  closeToolbar() {
    this.showToolbar.next(false);
  }


  triggerSelectProjectPopup(): Observable<Portfolio> {
    this.showSelectModal = true;
    return this.portfolioSelectedEvent.asObservable();
  }


  selectPortfolio(portfolio: Portfolio) {
    this.portfolioSelectedEvent.next(portfolio);
  }


  async renamePortfolio(name: string): Promise<void> {
    let portfolio = Object.assign({}, this.portfolio.getValue());
    portfolio.portfolioName = name;
    await this.save(portfolio);
    this.portfolio.next(portfolio);
    return this.toast.showSuccessToast("Renamed: " + name);
  }


  updatePreference(name: string, value: string) {
    let curr = this.portfolio.getValue();
    let currPrefs = curr.preferences;
    switch (name) {
      case 'sbl': {
        let viewPrefs: ViewPreferences = currPrefs.view;
        Object.assign(viewPrefs, { sidebarLocation: value });
        Object.assign(curr.preferences.view, viewPrefs);
        this.save(curr);
        this.portfolio.next(curr);
      }
    }
  }


  addTrackedToCurrentUserPortfolio(coinId: string) {
    this.addTracked(coinId);
  }

  removeTrackedFromCurrentUserPortfolio(id: string): Promise<any> {
    return this.deleteTracked(id);
  }

  getAllCoins(): Observable<BasicCoin[]> {
    return this.globalStore.state$.select('basicCoins');
  }

}
