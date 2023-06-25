import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, Subject, takeUntil, tap, zip } from 'rxjs';
import { CachedPortfolio, CachedWatchList, Portfolio, PortfolioMeta, WatchList, WatchListData, WatchListMeta } from '../models/portfolio';
import { ListStore } from '../store/list-store';
import { CacheService } from './cache.service';
import { Store } from '../store/store';


@Injectable()
export class UserService {
  private basicPortfolioStore: ListStore<PortfolioMeta> = new ListStore<PortfolioMeta>([]);
  private basicWatchListStore: ListStore<WatchListMeta> = new ListStore<WatchListMeta>([]);
  basicPortfolioSource$: Observable<PortfolioMeta[]> = this.basicPortfolioStore.select();
  basicWatchlistSource$: Observable<WatchListMeta[]> = this.basicWatchListStore.select();
  mainWatchListProvider = new BehaviorSubject<WatchListMeta>(null);
  mainPortfolioProvider = new BehaviorSubject<PortfolioMeta>(null);

  lastWatchListProvider = new BehaviorSubject<WatchListMeta>(null);

  private currentPortfolios: PortfolioMeta[] = []
  private currentWatchLists: WatchListMeta[] = []
  private cachedPortfolio: CachedPortfolio;
  private _lastPortfolio: PortfolioMeta = null;

  public get lastPortfolio(): PortfolioMeta {
    return this._lastPortfolio;
  }

  private cachedWatchList: CachedWatchList;
  private _lastWatchList: WatchListMeta = null;


  initialized$: Subject<boolean> = new Subject();
  private _user: firebase.User;

  public get user(): firebase.User {
    return this._user;
  }

  constructor(
    private apiService: ApiService,
    private cache: CacheService
  ) { }

  initialize(user: firebase.User) {
    this._user = user;
    if (user && user.uid) {
      if (this.cache.hasCachedPortfolio()) {
        const val = this.cache.getCachedPortfoilo();
        if (val) {
          this.cachedPortfolio = Object.assign({}, val);
        }
      }

      if (this.cache.hasCachedWatchList()) {
        const val = this.cache.getCachedWatchList();
        if (val) {
          this.cachedWatchList = Object.assign({}, val);
        }
      }
      zip([this.apiService.findAllPortfoliosInfo(user.uid),
      this.apiService.findAllWatchListsInfo(user.uid)])
        .pipe(takeUntil(this.initialized$))
        .subscribe(
          {
            next: (result) => {
              if (result && result.length > 0) {
                this.currentPortfolios = result[0];
                this.currentWatchLists = result[1];
                if (this.cachedPortfolio !== null && this.cachedPortfolio !== undefined) {
                  this._lastPortfolio = this.currentPortfolios.find(p => p.portfolioId === this.cachedPortfolio.id);
                }

                if (this.cachedWatchList) {
                  this._lastWatchList = this.currentWatchLists.find(p => p.watchListId === this.cachedWatchList.id);
                  this.lastWatchListProvider.next(this._lastWatchList);
                }
                let idxMainWatchList = this.currentWatchLists.findIndex(wl => wl.isMain === true);
                let idxMainPortfolio = this.currentPortfolios.findIndex(p => p.isMain === true);


                if (this.currentWatchLists.length > 0 && idxMainWatchList !== -1) {
                  this.mainWatchListProvider.next(this.currentWatchLists[idxMainWatchList]);
                }


                if (this.currentPortfolios.length > 0 && idxMainPortfolio !== -1) {
                  this.mainPortfolioProvider.next(this.currentPortfolios[idxMainPortfolio]);
                }

                this.basicPortfolioStore.set(this.currentPortfolios);
                this.basicWatchListStore.set(this.currentWatchLists);
                this.initialized$.next(true);

              } else {
                this.currentPortfolios = [];
                this.currentWatchLists = [];
                this._lastPortfolio = null;
                this.basicPortfolioStore.set(this.currentPortfolios);
                this.basicWatchListStore.set(this.currentWatchLists);
              }

            },

            error: (error) => {
              console.log("Initialize UserService error: " + JSON.stringify(error.message));
              this.initialized$.next(false);

            }
          }
        );
    } else {
      this.reset();
    }

  }

  getPortfolioMeta(id: number): PortfolioMeta | undefined {
    return this.currentPortfolios.find(p => p.portfolioId === id);
  }

  getWatchListMeta(id: number): WatchListMeta | undefined {
    return this.currentWatchLists.find(w => w.watchListId === id);
  }


  addPortfolioMeta(portfolio: PortfolioMeta) {
    const index = this.currentPortfolios.findIndex(p => p.portfolioId === portfolio.portfolioId);
    if (index !== -1) {
      this.currentPortfolios[index] = portfolio;
    } else {
      this.currentPortfolios.push(portfolio);
    }

    this.basicPortfolioStore.set(this.currentPortfolios);
  }

  updatePortfolioMeta(portfolio: Portfolio): any {
    const index = this.currentPortfolios.findIndex(p => p.portfolioId === portfolio.portfolioId);
    if (index !== -1) {
      this.currentPortfolios[index] = Object.assign({}, portfolio);
      this.basicPortfolioStore.set(this.currentPortfolios);
    } else {
      console.log("Portfolio not found in PortfolioMeta store");
    }

  }

  updateMainPortfolio(portfolio: Portfolio) {
    for (let i = 0; i < this.currentPortfolios.length; i++) {
      if (this.currentPortfolios[i].portfolioId !== portfolio.portfolioId) {
        this.currentPortfolios[i].isMain = false;
      } else {
        this.currentPortfolios[i].isMain = true;
      }
    }
    this.basicPortfolioStore.set(this.currentPortfolios);
  }

  updateWatchlistMeta(watchList: WatchList): any {
    const index = this.currentWatchLists.findIndex(w => w.watchListId === watchList.watchListId);
    if (index !== -1) {
      this.currentWatchLists[index] = Object.assign({}, watchList);
      this.basicWatchListStore.set(this.currentWatchLists);
    } else {
      console.log("Portfolio not found in PortfolioMeta store");
    }

  }

  updateMainWatchList(watchList: WatchList) {
    for (let i = 0; i < this.currentWatchLists.length; i++) {
      if (this.currentWatchLists[i].watchListId !== watchList.watchListId) {
        this.currentWatchLists[i].isMain = false;
      } else {
        this.currentWatchLists[i].isMain = true;
      }
    }
    this.basicWatchListStore.set(this.currentWatchLists);
  }

  resetMainPortfolio() {
    for (let i = 0; i < this.currentPortfolios.length; i++) {
      this.currentPortfolios[i].isMain = false;
    }
    this.basicPortfolioStore.set(this.currentPortfolios);
  }


  resetMainWatchList() {
    for (let i = 0; i < this.currentWatchLists.length; i++) {
      this.currentWatchLists[i].isMain = false;
    }
    this.basicWatchListStore.set(this.currentWatchLists);
  }

  addWatchListMeta(watchList: WatchListMeta) {
    const index = this.currentWatchLists.findIndex(p => p.watchListId === watchList.watchListId);
    if (index !== -1) {
      this.currentWatchLists[index] = watchList;
    } else {
      this.currentWatchLists.push(watchList);
    }

    this.basicWatchListStore.set(this.currentWatchLists);
  }

  /**
   * @param basicPortfolio Portfolio to remove from the store
   * @returns The next portfolio in the store or null if there are no more portfolios
   */
  removePortfolio(id: number): PortfolioMeta | null {
    this.currentPortfolios = this.currentPortfolios.filter(p => p.portfolioId !== id);
    this.basicPortfolioStore.set(this.currentPortfolios);
    if (this.currentPortfolios.length > 0) {
      return this.currentPortfolios[this.currentPortfolios.length - 1];

    }
    return null;
  }

  removeWatchlist(id: number): WatchListMeta | null {
    let index = this.currentWatchLists.findIndex(p => p.watchListId === id);
    this.currentWatchLists.splice(index, 1);
    this.basicWatchListStore.set(this.currentWatchLists);
    if (this.currentWatchLists.length > 0) {
      return this.currentWatchLists[this.currentWatchLists.length - 1];

    }
    return null;
  }

  reset() {
    this.currentPortfolios = [];
    this.currentWatchLists = [];
    this.basicPortfolioStore.set(this.currentPortfolios);
    this.basicWatchListStore.set(this.currentWatchLists);
    this._lastPortfolio = null;
    this.initialized$ = new Subject();
  }

}
