import { MediaMatcher } from '@angular/cdk/layout';
import { CurrencyPipe, DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { UntypedFormGroup } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { NavService } from 'src/app/services/nav.service';
import { BasicCoin, CoinFullInfo } from 'src/app/models/coin-gecko';
import { Portfolio, TrackedAsset } from 'src/app/models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { Dialog, DialogModule } from 'primeng/dialog';
import { BasicCoinInfoStore } from 'src/app/store/global/basic-coins.store';
import { SparklineComponent } from '../../../charts/sparkline/sparkline.component';
import { DeltaIcon } from '../../../icons/change-icon/delta.component';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { AssetSearchSelect } from '../../../search-select/search-select.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScreenService } from 'src/app/services/screen.service';
import { HelperService } from 'src/app/services/helper.service';
import { ThemeService } from 'src/app/services/theme.service';


@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  providers: [DatePipe,
    CurrencyPipe,
    DecimalPipe,
    HelperService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf,
    ProgressSpinnerModule,
    DialogModule,
    AssetSearchSelect,
    TableModule,
    SharedModule,
    MatButtonModule,
    OverlayPanelModule,
    DeltaIcon,
    SparklineComponent,
    CurrencyPipe,
    DatePipe]
})
export class TrackingComponent implements OnInit, OnDestroy {
  @ViewChild('trackedAssetTable') trackedAssetTable: Table;
  @ViewChild('assetSearchDialog') assetSearchDialog!: Dialog;
  @ViewChild(AssetSearchSelect) assetSelectionList: AssetSearchSelect;
  @ViewChild('assetSearchOverlay') assetSearchOverlay!: OverlayPanel;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;

  view: CoinFullInfo[];
  isLoading: boolean;
  chartData: any;
  chartOptions: any;
  percentFormat: string = '1.2-6';
  renamePortfolioFormGroup: UntypedFormGroup;
  currentDate: Date = new Date();
  scrollHeight: string = "500px";
  showAssetSearchDialog: boolean;
  allCoins: BasicCoin[] = [];
  destroySubject$ = new Subject();
  loadingIcon = 'pi pi-spin pi-spinner';
  selectedAsset: TrackedAsset;
  mobileQuery: MediaQueryList;
  public _mobileQueryListener: () => void;
  sparklineWidth = '200';
  openRowPanels: OverlayPanel[] = [];
  sparklineColor = '#006aff';
  overlayBgColor: string;
  decreaseColor: string = 'red';
  increaseColor: string = 'green';

  totalColumns = 7;

  constructor(
    public coinDataService: CoinDataService,
    private globalStore: BasicCoinInfoStore,
    private screenService: ScreenService,
    private navService: NavService,
    public decimalPipe: DecimalPipe,
    public themeService: ThemeService,
    public portfolioService: PortfolioService,
    private changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');

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
      this.changeDetectorRef.markForCheck()
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);

  }

  ngOnInit(): void {
    this.overlayBgColor = this.themeService.getCssVariableValue('--hover-bg-fancy');
    this.decreaseColor = this.themeService.getCssVariableValue('--decrease-color');
    this.increaseColor = this.themeService.getCssVariableValue('--increase-color');
    this.isLoading = true;
    this.globalStore.state$.select('basicCoins')
      .pipe(takeUntil(this.destroySubject$)
      ).subscribe(
        (coins) => {
          this.allCoins = coins;
          this.changeDetectorRef.markForCheck();
        }
      );

    this.isLoading = true;
    this.portfolioService.trackedAssetDataProvider()
      .subscribe({
        next: (result) => {
          if (result) {
            this.view = result;
            this.isLoading = false;
            this.changeDetectorRef.markForCheck();
          }
        },
        complete: () => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          console.log("Tracked Asset Table: Datasource Initilization Error: " + JSON.stringify(err));
        }
      });


    this.screenService.documentClickedSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (event) => {
        if (this.openRowPanels.length !== 0) {
          if (!this.trackedAssetTable.el.nativeElement.contains(event.target)) {
            HelperService.closeOverlays(this.openRowPanels);
          }
        }
      }
    });

  }

  isEventTargetOutsideElement(event: Event, element: HTMLElement) {
    if (element && element.contains(event.target as HTMLElement)) {
      return false;
    }


    return true;

  }

  getTrackedCount(): number {
    if (this.view) {
      return this.view.length;
    }
    return 0;
  }

  showAssetSearchContainer(event) {
    if (this.mobileQuery.matches) {
      this.showAssetSearchDialog = true;
    } else {
      this.assetSearchOverlay.show(event);
    }
  }

  onRowClick(event, rowPanel: OverlayPanel) {
    if (rowPanel.overlayVisible) {
      rowPanel.hide();
      this.openRowPanels = this.openRowPanels.slice(this.openRowPanels.indexOf(rowPanel), 1);
    } else {
      HelperService.closeOverlays(this.openRowPanels);

      rowPanel.toggle(event, event.currentTarget);
      if (rowPanel.overlayVisible) {
        this.openRowPanels.push(rowPanel);
      }
    }


  }

  onRowPanelShow(event) {
    console.debug("Show Event: " + event);
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


  isPortfolioInitialized(portfoilo: Portfolio): boolean {
    return portfoilo !== null && portfoilo !== undefined;
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
    if (this.assetSearchDialog.visible) {
      this.showAssetSearchDialog = false;
    } else if (this.assetSearchOverlay.overlayVisible) {
      this.assetSearchOverlay.hide();
    }

    this.portfolioService.addTrackedToCurrentUserPortfolio(id)
  }

  deleteTrackedAsset(coinInfo: CoinFullInfo) {
    this.portfolioService.deleteTrackedAsset({ id: coinInfo.id } as TrackedAsset);
  }

}
