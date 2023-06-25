import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { CoinDataService } from "src/app/services/coin-data.service";
import { ToastService } from "src/app/services/toast.service";
import { UtilityService } from "src/app/services/utility.service";
import { PortfolioBuilderService } from "../components/portfolio/portfolio-builder.service";
import { BehaviorSubject, Observable, Subject, concatMap, firstValueFrom, forkJoin, lastValueFrom, map, mergeMap, of, take, takeUntil, tap } from "rxjs";
import { WatchListMeta, TrackedAsset, WatchList, WatchListData } from "src/app/models/portfolio";
import { StringUtility } from 'src/app/services/string.utility';
import { CoinFullInfo } from "src/app/models/coin-gecko";
import { AppEvent } from "src/app/models/events";
import { UserService } from "./user.service";
import { NEW_WATCHLIST_NAME } from "../constants";
import { CacheService } from "./cache.service";
import { Store } from "../store/store";

@Injectable()
export class WatchListService {
    public isLoading: boolean;
    public isInitialized = false;


    private currentWatchList: WatchList = null;
    /* Watchlist Observable */
    private watchListSource: BehaviorSubject<WatchList> = new BehaviorSubject(this.currentWatchList);
    public watchListSource$ = this.watchListSource.asObservable();

    private currentTrackedList: TrackedAsset[] = [];
    /* Tracked Assets Observable , Watchlist workspace data source for watched items */
    private trackedSource: BehaviorSubject<TrackedAsset[]> = new BehaviorSubject<TrackedAsset[]>(this.currentTrackedList);
    public trackedSource$ = this.trackedSource.asObservable();

    private currentWatchListView: CoinFullInfo[] = [];
    /* Watchlist View Observable , the Watchlist Table's datasource */
    private watchlistViewSource: BehaviorSubject<CoinFullInfo[]> = new BehaviorSubject<CoinFullInfo[]>(this.currentWatchListView);
    public watchListViewSource$ = this.watchlistViewSource.asObservable();

    /* Observe portfolio events inside the portfolio component */
    eventSource$: Subject<AppEvent> = new Subject();

    /* Subject controls opening and closing the Toolbar */
    showToolbar: Subject<boolean> = new Subject();


    private mainWatchListStore: Store<WatchList> = new Store<WatchList>(null);
    mainWatchListSource$: Observable<WatchList> = this.mainWatchListStore.selectAll();
    initialized$: Subject<boolean> = new Subject();

    get mainWatchList(): WatchList {
        return this.mainWatchListStore.state;
    }

    constructor(
        public coinDataService: CoinDataService,
        private cache: CacheService,
        public utilityService: UtilityService,
        private builder: PortfolioBuilderService,
        public toast: ToastService,
        private userService: UserService,
        private apiService: ApiService
    ) {
        this.userService.mainWatchListProvider
            .pipe(take(1))
            .subscribe(res => {
                if (res) {
                    this.loadAndOpen(res).subscribe(res => {
                        this.mainWatchListStore.set(res);
                    });
                }
            });
    }

    /* ----------------------------- WatchList Initialization ----------------------------- */
    loadAndOpen(watchListMeta: WatchListMeta): Observable<WatchList> {
        return this.builder.loadWatchList(watchListMeta);
    }

    createNewWatchlist(uid: string): Observable<WatchList> {
        const meta = { uid: uid, watchListId: -1, watchListName: NEW_WATCHLIST_NAME, isMain: false } as WatchListMeta
        return this.builder.findNextWatchListId()
            .pipe(takeUntil(this.initialized$),
                concatMap(res => {
                    let newWatchlist = new WatchList();
                    meta.watchListId = Number(res.watchListId);
                    newWatchlist.fromMeta(meta, true);
                    return this.apiService.createWatchList(newWatchlist)
                        .pipe(
                            map(res => {
                                res.isNew = true;
                                return res;
                            }));
                }));
    }

    get current(): WatchList {
        return this.currentWatchList;
    }

    cacheListProvider(): Observable<WatchList> {
        return this.userService.lastWatchListProvider.pipe(
            mergeMap(res => {
                if (res) {
                    return this.loadAndOpen(res);
                }
                return of(null);
            }
            ));


    }

    reset() {
        this.currentWatchList = null;
        this.watchListSource.next(this.currentWatchList);
        this.isInitialized = false;
        this.trackedSource.next([]);
        this.initialized$.next(false);
        this.initialized$ = new Subject();
    }

    saveCurrent(): Promise<any> {
        return this.save(this.current);
    }

    save(watchList: WatchList) {
        this.currentWatchList = Object.assign({}, watchList);
        return lastValueFrom(this.apiService.updateWatchList(this.currentWatchList))
            .then(result => this.userService.updateWatchlistMeta(this.currentWatchList));
    }

    saveAs(watchList: WatchList): Observable<any> {
        this.currentWatchList = Object.assign({}, watchList);
        return this.apiService.updateWatchList(this.currentWatchList);
    }

    setInitialized() {
        this.isInitialized = true;
        this.initialized$.next(true);
        this.initialized$.complete();
    }

    cacheForReload(w: WatchList) {
        this.cache.cacheWatchList(w);
    }

    setWatchList(watchList: WatchList) {
        this.currentWatchList = Object.assign({}, watchList);
        if (!this.currentWatchList.watchListData || !this.currentWatchList.watchListData.trackedAssets) {
            this.currentWatchList.watchListData = new WatchListData([]);
        }

        if (this.currentWatchList && this.currentWatchList.watchListId !== -1) {
            if (this.currentWatchList.isNew) {
                const newWatchListMeta = {
                    uid: this.currentWatchList.uid,
                    watchListId: this.currentWatchList.watchListId,
                    watchListName: this.currentWatchList.watchListName,
                    isMain: this.currentWatchList.isMain
                } as WatchListMeta;
                this.userService.addWatchListMeta(newWatchListMeta);
                this.currentWatchList.isNew = false;
                this.toast.showSuccessToast('Created New Watch-list, named: ' + this.currentWatchList.watchListName);
            }
            this.cacheForReload(this.currentWatchList);
            this.watchListSource.next(this.currentWatchList);
            this.updateView(this.currentWatchList);

        }

    }

    updateView(watchList: WatchList) {
        this.currentWatchList = watchList;
        this.viewProvider(watchList.watchListData.trackedAssets)
            .subscribe({
                next: (results: CoinFullInfo[]) => {
                    if (results) {
                        this.currentWatchListView = results;
                        this.watchlistViewSource.next(this.currentWatchListView);

                        this.currentTrackedList = watchList.watchListData.trackedAssets;
                        this.trackedSource.next(this.currentTrackedList);

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
    }

    addTrackedToCurrentUserPortfolio(coinId: string) {
        this.addTracked(coinId);
    }

    addToWatchList(watchListMeta: WatchListMeta, id: string) {
        return this.builder.loadWatchList(watchListMeta)
            .subscribe({
                next: (res: WatchList) => {
                    let isEmpty = StringUtility.isEmpty(id);
                    let isValid = PortfolioBuilderService.isUniqueTrackedAsset(id, res);
                    if (!isValid || isEmpty) {
                        this.toast.showInfoToast('You are already tracking asset: ' + id);
                        return;
                    }

                    const newTrackedAsset = { id } as TrackedAsset;
                    if (!res.watchListData || !res.watchListData.trackedAssets) {
                        res.watchListData = new WatchListData([]);
                    }
                    res.watchListData.trackedAssets.push(newTrackedAsset);
                    this.save(res).then(res => {
                        this.toast.showSuccessToast('Added: ' + id + " to watchlist: " + watchListMeta.watchListName);
                    });
                }
            });



    }


    addToMainWatchList(assetId: string) {
        let isEmpty = StringUtility.isEmpty(assetId);
        let currentMain = this.mainWatchList;
        let isValid = PortfolioBuilderService.isUniqueTrackedAsset(assetId, currentMain);
        if (!isValid || isEmpty) {
            this.toast.showInfoToast('You are already tracking asset: ' + assetId);
            return;
        }

        const newTrackedAsset = { id: assetId } as TrackedAsset;
        if (!currentMain.watchListData || !currentMain.watchListData.trackedAssets) {
            currentMain.watchListData = new WatchListData([]);
        }
        currentMain.watchListData.trackedAssets.push(newTrackedAsset);
        this.save(currentMain).then(res => {
            this.mainWatchListStore.set(currentMain);
            this.userService.updateMainWatchList(currentMain);
            this.toast.showSuccessToast('Tracking: ' + assetId + ".");

        });
    }


    removeFromMainWatchList(assetId: string): Promise<any> {
        let updated = this.mainWatchListStore.state;
        const idx = updated.watchListData.trackedAssets.findIndex(t => t.id === assetId);
        updated.watchListData.trackedAssets.splice(idx, 1);
        return this.save(updated).then(res => {
            this.userService.updateMainWatchList(updated);
            this.mainWatchListStore.set(updated);
            this.toast.showSuccessToast('Removed: ' + assetId + " from Main Watchlist.");

        });
    }

    removeTrackedFromCurrentUserPortfolio(id: string): Promise<any> {
        return this.deleteTracked(id);
    }

    private addTrackedToWatchList(trackedAsset: TrackedAsset): WatchList {
        let updated = this.watchListSource.getValue();
        updated.watchListData.trackedAssets.push(trackedAsset);
        return updated;
    }


    isTracked(id: string) {
        let tracked = this.trackedSource.getValue();
        return tracked.some(t => t.id === id);
    }

    /* ----------------------------- Tracked Assets ----------------------------- */
    updateTrackedAssetSource(trackedAsset: TrackedAsset) {
        let currentValues = this.trackedSource.getValue();
        let idx = currentValues.findIndex(x => x.id === trackedAsset.id);
        if (idx !== -1) {
            currentValues.splice(idx, 1);
        }
        currentValues.push(trackedAsset);
        this.trackedSource.next(currentValues);
    }


    initTrackedAssets(watchList: WatchList) {
        let trackedAssets = watchList.watchListData.trackedAssets;

        if (trackedAssets.length < 1) {
            this.trackedSource.next([]);
        }
        this.trackedSource.next(trackedAssets)

    }


    addTracked(id: string) {
        let isEmpty = StringUtility.isEmpty(id);
        let isValid = PortfolioBuilderService.isUniqueTrackedAsset(id, this.watchListSource.getValue());
        if (!isValid || isEmpty) {
            this.toast.showInfoToast('You are already tracking asset: ' + id);
            return;
        }

        const newTrackedAsset = { id: id } as TrackedAsset;

        let updatedWatchList = this.addTrackedToWatchList(newTrackedAsset);
        this.updateTrackedAssetSource(newTrackedAsset);
        this.save(updatedWatchList).then
            (res => {
                this.updateView(updatedWatchList);
                this.watchListSource.next(updatedWatchList);
                this.toast.showSuccessToast('Tracking: ' + id + ".");
            });

    }


    deleteTrackedAsset(trackedAsset: TrackedAsset) {
        let subscription = this.toast.showUserPromptToast('Are you sure you want un-watch  ' + trackedAsset.id, 'Confirm Un-Watch')
            .subscribe({
                next: (result) => {
                    if (result) {
                        this.deleteTracked(trackedAsset.id).then(() => {
                            this.viewProvider(this.trackedSource.getValue()).subscribe({
                                next: (results: CoinFullInfo[]) => {
                                    if (results) {
                                        this.watchlistViewSource.next(results);
                                    } else {
                                        this.watchlistViewSource.next([]);
                                    }
                                    this.toast.showSuccessToast(trackedAsset.id + ' was deleted.');
                                    subscription.unsubscribe();
                                },
                            });
                        }
                        );
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
        let curr = this.watchListSource.getValue();
        let index = curr.watchListData.trackedAssets.findIndex(x => x.id === id);
        curr.watchListData.trackedAssets.splice(index, 1);
        this.watchListSource.next(curr);
        this.trackedSource.next(curr.watchListData.trackedAssets);
        return this.save(curr);
    }


    trackedAssetDataProviderForWatchList(watchlist: WatchList): Observable<CoinFullInfo[]> {
        if (watchlist && watchlist.watchListData.trackedAssets && watchlist.watchListData.trackedAssets.length > 0) {
            return this.viewProvider(watchlist.watchListData.trackedAssets);
        } else {
            return of([]);
        }
    }

    viewProvider(trackedAssets: TrackedAsset[]): Observable<CoinFullInfo[]> {
        if (trackedAssets.length < 1) {
            return of([]);
        }

        let ids = trackedAssets.map((trackedAsset) => {
            return trackedAsset.id;
        });

        let coinInfos = ids.map((id) => { return this.coinDataService.readCoinInfo(id, true); });
        return forkJoin(coinInfos);
    }


    async rename(name: string): Promise<void> {
        let current = Object.assign({}, this.watchListSource.getValue());
        current.watchListName = name;
        await this.save(current);
        this.watchListSource.next(current);
        return this.toast.showSuccessToast("Renamed: " + name);
    }


    openToolbar() {
        this.showToolbar.next(true);
    }


    hideToolbar() {
        this.showToolbar.next(false);
    }


    closeToolbar() {
        this.showToolbar.next(false);
    }


    handleDelete(watchListMeta: WatchListMeta): Promise<void> {
        if (watchListMeta.isMain) {
            this.mainWatchListStore.set(null);
        }

        return firstValueFrom(this.apiService.deleteWatchList(watchListMeta))
            .then(() => {
                this.clearCache(watchListMeta);
            });
    }

    assignMain(current: WatchList): Observable<WatchList> {
        current.isMain = true;
        this.userService.updateMainWatchList(current);
        this.mainWatchListStore.set(current);
        return this.apiService.setMainWatchList(current)
            .pipe(map((res) => {
                return res['watchlist'];
            }));
    }

    unAssignMain(current: WatchList): Observable<WatchList> {
        current.isMain = false;
        this.userService.resetMainWatchList();
        this.mainWatchListStore.set(null);
        return this.apiService.updateWatchList(current);
    }

    clearCache(watchListMeta: WatchListMeta) {
        this.cache.removeLastWatchList();
    }
}