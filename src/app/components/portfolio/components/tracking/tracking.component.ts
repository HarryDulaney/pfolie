import { MediaMatcher } from '@angular/cdk/layout';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { SessionService } from 'src/app/services/session.service';
import firebase from 'firebase/compat/app';
import { FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { NavService } from 'src/app/services/nav.service';
import { BasicCoin, CoinFullInfo } from 'src/app/models/coin-gecko';
import { Portfolio, TrackedAsset } from 'src/app/models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { AssetSearchSelect } from 'src/app/components/search-select/search-select.component';
import { GlobalStore } from 'src/app/store/global/global.store';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  providers: [DatePipe, CurrencyPipe, DecimalPipe]
})
export class TrackingComponent implements OnInit, OnDestroy {
  @ViewChild('trackedAssetTable') trackedTable;
  @ViewChild('assetSearchDialog') assetSearchDialog!: Dialog;
  @ViewChild(AssetSearchSelect) assetSelectionList: AssetSearchSelect;
  @ViewChild('assetSearchOverlay') assetSearchOverlay!: OverlayPanel;

  private portfolio: Portfolio;
  private user: firebase.User = null;
  view: CoinFullInfo[];
  isLoading: boolean;
  chartData: any;
  chartOptions: any;
  percentFormat: string = '1.2-6';
  renamePortfolioFormGroup: FormGroup;
  currentDate: Date = new Date();
  scrollHeight: string = "500px";
  showAssetSearchDialog: boolean;
  allCoins: BasicCoin[] = [];
  destroySubject$ = new Subject();

  mobileQuery: MediaQueryList;
  public _mobileQueryListener: () => void;

  constructor(
    public coinDataService: CoinDataService,
    private sessionService: SessionService,
    private globalStore: GlobalStore,
    private navService: NavService,
    public decimalPipe: DecimalPipe,
    public portfolioService: PortfolioService,
    changeDetectorRef: ChangeDetectorRef,
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
      changeDetectorRef.detectChanges()
    };
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.sessionService.getAuth().pipe(takeUntil(this.destroySubject$)).subscribe(
      (user) => this.user = user
    );
    this.globalStore.state$.select('basicCoins').pipe(takeUntil(this.destroySubject$)).subscribe(
      (coins) => this.allCoins = coins
    );

    this.isLoading = true;

    this.portfolioService.portfolio$.pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (portfoilo) => {
          if (portfoilo) {
            this.portfolio = portfoilo;
          }
        },
        complete: () => {
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.log("Tracked Asset Table Portfolio Initilization Error: " + JSON.stringify(err));
        }
      });

    this.portfolioService.trackedSource$.pipe(
      takeUntil(this.destroySubject$),
      mergeMap(
        trackedAssets => {
          return this.initializeDataSource(trackedAssets);
        }
      )
    )
      .subscribe({
        next: (result) => {
          if (result) {
            this.view = result;
            this.isLoading = false;
          }
        },
        complete: () => {
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.log("Tracked Asset Table: Datasource Initilization Error: " + JSON.stringify(err));
        }
      });
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

    let coinInfos = ids.map((id) => { return this.coinDataService.readCoinInfo(id); });
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
