import { MediaMatcher } from '@angular/cdk/layout';
import { CurrencyPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UntypedFormGroup } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { NavService } from 'src/app/services/nav.service';
import { BasicCoin, CoinFullInfo } from 'src/app/models/coin-gecko';
import { Portfolio, TrackedAsset, WatchList } from 'src/app/models/portfolio';
import { exhaustMap, take, takeUntil, tap } from 'rxjs/operators';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { Dialog, DialogModule } from 'primeng/dialog';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import { SparklineComponent } from '../../charts/sparkline/sparkline.component';
import { DeltaIcon } from '../../icons/change-icon/delta.component';
import { MatButtonModule } from '@angular/material/button';
import { MenuItem, SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { AssetSearchSelect } from '../../search-select/search-select.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScreenService } from 'src/app/services/screen.service';
import { ThemeService } from 'src/app/services/theme.service';
import { WatchListService } from '../../../services/watchlist.service';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../../toolbar/toolbar.component';
import * as Const from '../../../constants';
import { UserService } from 'src/app/services/user.service';
import { AppEvent } from 'src/app/models/events';
import { ListStore } from 'src/app/store/list-store';
import { TooltipOptions } from 'primeng/tooltip';


@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePipe,
    CurrencyPipe,
    DecimalPipe],
  standalone: true,
  imports: [
    NgIf,
    ProgressSpinnerModule,
    DialogModule,
    AssetSearchSelect,
    TableModule,
    SharedModule,
    MatButtonModule,
    ToolbarComponent,
    OverlayPanelModule,
    DeltaIcon,
    SparklineComponent,
    CurrencyPipe,
    DatePipe]
})
export class TrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('trackedAssetTable') trackedAssetTable: Table;
  @ViewChild('assetSearchDialog') assetSearchDialog!: Dialog;
  @ViewChild(AssetSearchSelect) assetSelectionList: AssetSearchSelect;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;
  @ViewChild('toolbar') toolbar: ToolbarComponent;

  view: CoinFullInfo[];
  isLoading: boolean;
  chartData: any;
  chartOptions: any;
  percentFormat: string = '1.2-6';
  renamePortfolioFormGroup: UntypedFormGroup;
  currentDate: Date = new Date();
  scrollHeight: string = "500px";
  showAssetSearchDialog: boolean;
  destroySubject$ = new Subject();
  loadingIcon = 'pi pi-spin pi-spinner';
  selectedAsset: TrackedAsset;
  mobileQuery: MediaQueryList;
  public _mobileQueryListener: () => void;
  sparklineWidth = '200';
  openRowPanels: OverlayPanel[] = [];
  sparklineColor = '#006aff';
  textColor: string;
  overlayBgColor: string;
  decreaseColor: string;
  increaseColor: string;
  title = 'Watchlists';
  totalColumns = 7;

  isNavExpanded: boolean = false;
  screenSize: string;
  navExpandProvider: Observable<boolean>;
  private allCoinSource: ListStore<BasicCoin>;
  coinSource$: Observable<BasicCoin[]>;
  toolbarMenuItems: MenuItem[];
  maxSearchWidth: string;
  searchScrollHeight: string;
  modalPostion: string;
  tooltipOptions: TooltipOptions;
  isMain = false;
  private isMainTooltip;
  private isNotMainTooltip;

  constructor(
    public coinDataService: CoinDataService,
    private coinStore: BasicCoinInfoStore,
    private screenService: ScreenService,
    private navService: NavService,
    public decimalPipe: DecimalPipe,
    private userService: UserService,
    private router: Router,
    public themeService: ThemeService,
    public watchListService: WatchListService,
    private cd: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.tooltipOptions = this.screenService.tooltipOptions;
    this.isMainTooltip = {
      tooltipLabel: 'This is already Marked as Main',
      tooltipPosition: this.tooltipOptions.tooltipPosition,
      tooltipEvent: this.tooltipOptions.tooltipEvent,
      life: this.tooltipOptions.life
    };

    this.isNotMainTooltip = {
      tooltipLabel: 'Make this Watchlist the Main watchlist',
      tooltipPosition: this.tooltipOptions.tooltipPosition,
      tooltipEvent: this.tooltipOptions.tooltipEvent,
      life: this.tooltipOptions.life
    };
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.navExpandProvider = this.navService.navExpandedSource$;

    if (this.mobileQuery.matches) {
      this.scrollHeight = '60vh';
    } else {
      this.scrollHeight = '35vh';
    }

    this._mobileQueryListener = () => {
      if (this.mobileQuery.matches) {
        this.scrollHeight = '60vh';
      } else {
        this.scrollHeight = '35vh';
      }
      this.cd.markForCheck()
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.watchListService.isInitialized = false;
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);

  }

  ngOnInit(): void {
    this.allCoinSource = this.coinStore.allCoinsStore.clone();
    this.coinSource$ = this.allCoinSource.select();
    this.initScreenSizes();

    this.overlayBgColor = this.themeService.getCssVariableValue('--hover-bg-fancy');
    this.decreaseColor = this.themeService.getCssVariableValue('--decrease-color');
    this.increaseColor = this.themeService.getCssVariableValue('--increase-color');
    this.textColor = this.themeService.getCssVariableValue('--text-color');

    this.isLoading = true;
    this.watchListService.watchListSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (result) => {
          if (result && result.isNew) {
            this.watchListService.toast.showSuccessToast('New Watchlist created with name: ' + result.name);
          } else if (result) {
            this.isMain = result.isMain;
            this.setToolbarMenuItems();
            this.cd.markForCheck();
          }

        }

      });

    this.screenService.screenSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe(screenSize => {
        this.screenSize = screenSize;
        this.cd.markForCheck();
      });

    this.screenService.resizeSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (screenSize) => {
          this.screenSize = screenSize;
          this.initScreenSizes();
          this.cd.markForCheck();
        }
      });


    this.watchListService.watchListViewSource$
      .subscribe({
        next: (result) => {
          if (result) {
            this.view = result;
            this.isLoading = false;
            this.cd.markForCheck();
          }
        },
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          console.log("Tracked Asset Table: Datasource Initilization Error: " + JSON.stringify(err));
        }
      });


    this.screenService.documentClickedSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (event) => {
          if (this.openRowPanels.length !== 0) {
            if (!this.trackedAssetTable.el.nativeElement.contains(event.target)) {
              ScreenService.closeOverlays(this.openRowPanels);
            }
          }
        }
      });

  }

  setToolbarMenuItems() {
    this.toolbarMenuItems = [{
      label: 'Watchlist',
      icon: 'fa fa-bolt',
      items: [
        {
          label: 'Mark As Main',
          disabled: this.isMain ? true : false,
          tooltipOptions: this.isMain ? this.isMainTooltip : this.isNotMainTooltip,

          icon: 'fa-solid fa-check-circle',
          command: (event) => {
            this.handleAssignMain(event, this.watchListService.current);
          }
        },
        {
          label: 'Delete',
          tooltipOptions: { tooltipLabel: 'Delete the current Watchlist', tooltipPosition: 'right' },
          icon: 'pi pi-trash',
          command: (event) => {
            this.handleDeleteWatchListEvent(event, this.watchListService.current);
          }
        }]
    },
    {
      label: 'Edit',
      icon: 'fa fa-pen-square',
      items: [
        {
          label: 'Add New', tooltipOptions: { tooltipLabel: 'Add a new asset to watchlist', tooltipPosition: 'right' },
          icon: 'pi pi-plus',
          command: (event) => {
            this.showAssetSearchContainer(new MouseEvent('click'));
          }
        }]
    }];
  }

  handleAssignMain(event: any, current: WatchList) {
    this.watchListService.assignMain(current)
      .pipe(
        take(1)
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.isMain = true;
            this.watchListService.toast.showSuccessToast('Watchlist ' + current.name + ' is now the Main watchlist');
            this.watchListService.setWatchList(current);
            this.cd.markForCheck();
          }
        },
        complete: () => {
          this.cd.markForCheck();
        }
      });
  }


  ngAfterViewInit(): void {
    this.screenService.documentClickedSource$
      .pipe(
        takeUntil(this.destroySubject$),
        tap(event => {
          this.watchListService.eventSource$.next({ name: 'click', event: event } as AppEvent);
        })
      ).subscribe();

    this.screenService.documentKeydownSource$
      .pipe(
        takeUntil(this.destroySubject$)).subscribe(
          event => {
            if (event.key === 'Enter') {
              this.toolbar.handleRename();
            }
          });

    this.cd.detectChanges();

  }


  initScreenSizes() {
    switch (this.screenSize) {
      case Const.CONSTANT.SCREEN_SIZE.XS:
        this.searchScrollHeight = '60vh';
        this.maxSearchWidth = '80vw';
        this.modalPostion = 'top';
        break;
      case Const.CONSTANT.SCREEN_SIZE.M:
      case Const.CONSTANT.SCREEN_SIZE.L:
      case Const.CONSTANT.SCREEN_SIZE.XL:
        this.searchScrollHeight = '40vh';
        this.maxSearchWidth = '60vw';
        this.modalPostion = 'center';
        break;
      default:
        this.searchScrollHeight = '35vh';
        this.maxSearchWidth = '50vw';
        this.modalPostion = 'center';
    }
  }

  isEventTargetOutsideElement(event: Event, element: HTMLElement) {
    if (element && element.contains(event.target as HTMLElement)) {
      return false;
    }

    return true;

  }

  isMobile() {
    return this.screenService.isMobileScreen(this.screenSize)
  }

  getTrackedCount(): number {
    if (this.view) {
      return this.view.length;
    }
    return 0;
  }

  showAssetSearchContainer(event) {
    this.showAssetSearchDialog = true;

  }

  onRowClick(event, rowPanel: OverlayPanel) {
    if (rowPanel.overlayVisible) {
      rowPanel.hide();
      this.openRowPanels = this.openRowPanels.slice(this.openRowPanels.indexOf(rowPanel), 1);
    } else {
      ScreenService.closeOverlays(this.openRowPanels);

      rowPanel.toggle(event, event.currentTarget);
      if (rowPanel.overlayVisible) {
        this.openRowPanels.push(rowPanel);
      }
    }

  }

  onRowPanelShow(event) {
    this.overlayBgColor = this.themeService.getCssVariableValue('--hover-bg-fancy');
    this.cd.markForCheck();
  }

  onRowSelect(event: any) {
    const orgEvent = event.originalEvent as MouseEvent;
    console.debug("Row Select Event: " + orgEvent);

  }

  formatPercentData(rowData: any, col: string): string {
    switch (col) {
      case '24hr': {
        let data = rowData['market_data']['price_change_percentage_24h_in_currency']['usd'];
        if (!data || data == null) {
          return 'n/a'
        }
        return this.decimalPipe.transform(data, this.percentFormat) + "%";
      }
      case '1hr': {
        let data = rowData['market_data']['price_change_percentage_1h_in_currency']['usd'];
        if (!data || data == null) {
          return 'n/a';
        }
        return this.decimalPipe.transform(data, this.percentFormat) + "%";

      }
      case '7d': {
        let data = rowData['market_data']['price_change_percentage_7d_in_currency']['usd'];
        if (!data || data == null) {
          return 'n/a';
        }
        return this.decimalPipe.transform(data, this.percentFormat) + "%";

      }
      default:
        return 'n/a';
    }
  }


  isWatchListInitialized(watchList: WatchList): boolean {
    return watchList !== null && watchList !== undefined;
  }

  initializeDataSource(trackedAssets: TrackedAsset[]): Observable<CoinFullInfo[]> {
    if (trackedAssets.length < 1) {
      return of([]);
    }

    let ids = trackedAssets.map((trackedAsset) => {
      return trackedAsset.id;
    });

    let coinInfos = ids.map((id) => { return this.coinDataService.readCoinInfo(id, true); });
    return forkJoin(coinInfos);
  }

  openAssetInfo(coinFullInfo: CoinFullInfo) {
    this.navService.navigateTo(coinFullInfo.id);
  }


  addTrackSelected(id: string) {
    this.showAssetSearchDialog = false;
    this.watchListService.addTrackedToCurrentUserPortfolio(id)
  }

  deleteTrackedAsset(coinInfo: CoinFullInfo) {
    this.watchListService.deleteTrackedAsset({ id: coinInfo.id } as TrackedAsset);
  }


  handleDeleteWatchListEvent(event: any, watchList: WatchList) {
    let subscription = this.watchListService.toast.showUserPromptToast('Are you sure you want to delete ' + watchList.name + ' ?', 'Confirm Delete')
      .subscribe({
        next: (result) => {
          if (result) {
            this.watchListService.handleDelete(watchList).then(() => {
              this.watchListService.toast.showSuccessToast(watchList.watchListName + ' was deleted.');
              const nextWatchList = this.userService.removeWatchlist(watchList.watchListId);
              if (nextWatchList) {
                this.watchListService.loadAndOpen(nextWatchList)
                  .subscribe({
                    next: (result) => {
                      if (result) {
                        this.watchListService.setWatchList(result);
                      } else {
                        this.router.navigate(['home']);
                      }
                    },
                    error: (error) => {
                      if (error) {
                        this.watchListService.toast.showErrorToast('Error loading watchlist: ' + error);
                        this.router.navigate(['home']);
                      }
                    }
                  });

              } else {
                this.router.navigate(['home']);
                this.watchListService.reset();
              }

            })
          } else {
            this.watchListService.toast.showErrorToast(this.watchListService.current.name + ' was not deleted.');
          }
        },
        complete: () => subscription.unsubscribe(),
        error: () => subscription.unsubscribe()
      });
  }

  onContainerClick(event) {
    if (event) {
      this.toolbar.handleCancelRename();
    }
  }

}
