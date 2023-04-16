import { CurrencyPipe, DatePipe, DecimalPipe, NgIf, AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subject } from 'rxjs';
import { map, tap, switchMap, takeUntil } from 'rxjs/operators';
import { AppEvent } from 'src/app/models/events';
import { DragBundle, OwnedAssetView, Portfolio } from 'src/app/models/portfolio';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { ScreenService } from 'src/app/services/screen.service';
import { NavService } from 'src/app/services/nav.service';
import { SessionService } from 'src/app/services/session.service';
import * as Const from '../../constants';
import { PortfolioTableComponent } from './components/portfolio-table/portfolio-table.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { PortfolioBuilderService } from './services/portfolio-builder.service';
import { PortfolioService } from './services/portfolio.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  providers: [DatePipe, CurrencyPipe, DecimalPipe],
  standalone: true,
  imports: [ToolbarComponent, NgIf, ProgressSpinnerModule, WorkspaceComponent, PortfolioTableComponent, AsyncPipe]
})
export class PortfolioComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('toolbar') toolbar: ToolbarComponent;
  @ViewChild('portfolioTable') portfolioTable: PortfolioTableComponent;
  @ViewChild('searchTrackPanel') searchTrackedPanel: OverlayPanel;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;
  @ViewChild('workspace') workspace: WorkspaceComponent;




  /* Component Palette Options */
  isPaletteDismissible: boolean = true;
  showPaletteCloseIcon: boolean = true;
  closePaletteOnEscape: boolean = true;
  isPaletteModal: boolean = false;
  sidebarPostion: string = '';
  smallScreen: boolean;
  showPalette: boolean = false;
  calculatedValues;
  paletteItems: DragBundle[] = [
    { label: 'Small Card', componentId: 'sm-card-component', iconSrc: '../assets/img/small_card_icon.jpg', iconHeight: 40, iconWidth: 80 },
    { label: 'Medium Card', componentId: 'md-card-component', iconSrc: '../assets/img/med_card_d_and_d.jpg', iconHeight: 75, iconWidth: 100 }
  ];

  assetSource$: Observable<OwnedAssetView[]>;

  portfolioView: OwnedAssetView[];

  private portfolio: Portfolio;
  public getPortfolio(): Portfolio {
    return this.portfolio;
  }


  destroySubject$ = new Subject();

  private user: firebase.User = null;
  chartData: any;
  chartOptions: any;
  showAddEditDialog: boolean = false;
  portfolioExpandedSource: any;
  isNavExpanded: boolean;
  screenSize: string;

  constructor(
    public coinDataService: CoinDataService,
    public portfolioService: PortfolioService,
    private sessionService: SessionService,
    private navService: NavService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private screenService: ScreenService,
    private builder: PortfolioBuilderService

  ) {

    this.portfolioService.showToolbar.next(false);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.screenService.documentClickedSource$.pipe(
      takeUntil(this.destroySubject$),
      tap(event => {
        this.portfolioService.eventSource$.next({ name: 'click', event: event } as AppEvent);
      })
    ).subscribe();

    this.screenService.documentKeydownSource$.pipe(
      takeUntil(this.destroySubject$)).subscribe(
        event => {
          if (event.key === "Escape") {
            this.showPalette = false;
          }
        });

    this.toolbar.$toolbarSource.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      (event: AppEvent) => {
        switch (event['event']['item']['label']) {
          case Const.TOOLBAR.OPEN: {
            // this.handleOpenPortfolioEvent();
            console.log("Portfolio Open Event Called.... No handler set");

            break;
          }
          case Const.TOOLBAR.NEW_COMPONENT: {
            this.openComponentPalette();
            break;
          }
          case Const.TOOLBAR.SIDEBAR_BOTTOM: {
            this.sidebarPostion = 'bottom';
            this.portfolioService.updatePreference('sbl', this.sidebarPostion);
            break;

          }
          case Const.TOOLBAR.SIDEBAR_RIGHT: {
            this.sidebarPostion = 'right';
            this.portfolioService.updatePreference('sbl', this.sidebarPostion);
            break;
          }
          case 'Small': {
            this.router.navigate(['/', 'sm']);
            break;
          }
          case 'Medium': {
            this.router.navigate(['/', 'sm']);
            break;
          }
          case 'Chart': {
            break;
          }
        }

      });

    this.portfolioTable.onSelect.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      value => {
        console.log('Row selected: ' + value);
      }
    );

    this.navService.navExpandedSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(isOpen => this.isNavExpanded = isOpen);

    this.cd.detectChanges();

  }


  ngOnInit(): void {
    this.sessionService.getAuth().pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(
      (user) => this.user = user
    );
    this.portfolioService.isLoading = true;

    this.calculatedValues = {
      totalCurrentValue: 0,
      totalCostBasis: 0,
      totalProfitLoss: 0,
    }

    this.portfolioService.portfolioDataSource$.pipe(
      takeUntil(this.destroySubject$),
      switchMap(
        (ownedAssets) => {
          return this.builder.getOwnedAssetViews(ownedAssets);
        }),
      tap((views) => {
        this.calculatedValues.totalCurrentValue = this.builder.getTotalCurrentValue(views);
      }),
      tap((views) => {
        this.calculatedValues.totalCostBasis = this.builder.calculatePortfolioTotalCostBasis(views);

      }),
      map(
        views => { return this.builder.getAllocations(views, this.calculatedValues.totalCurrentValue); }
      )

    ).subscribe({
      next: (results: OwnedAssetView[]) => {
        if (results) {
          this.portfolioView = results;
          this.calculatedValues.totalProfitLoss = this.calculatedValues.totalCurrentValue - this.calculatedValues.totalCostBasis;
          this.portfolioService.setAssetViews(results);
          this.portfolioService.isLoading = false;
        }

      },
      complete: () => {
        this.portfolioService.isLoading = false;
      },
      error: (err: any) => {
        this.portfolioService.isLoading = false;
        console.error("Portfolio Data Loading Error: " + JSON.stringify(err));
      }
    });

    this.portfolioService.portfolio$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (p) => {
        if (p) {
          this.portfolio = p;
          this.sidebarPostion = this.portfolio.preferences.view['sidebarLocation'];
          this.portfolioService.isLoading = false;
        }

      },
      complete: () => {
        this.portfolioService.isLoading = false;
      },
      error: (err) => {
        this.portfolioService.isLoading = false;
        console.error("PortfolioComponent Initilization Error: " + JSON.stringify(err));
      }
    });

    this.screenService.screenSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe(screenSize => {
      this.screenSize = screenSize;
      this.cd.detectChanges();
    });

  }

  preventDefault = (event) => {
    event.preventDefault();
  }

  openAssetInfoPage(event) {
    this.navService.navigateTo(event.data.id);
  }

  openComponentPalette() {
    this.showPalette = true;
  }

  onContainerClick(event) {
    if (event) {
      this.toolbar.handleCancelRename();
    }
  }

  getName(): string {
    if (this.portfolio) {
      return this.portfolio.portfolioName;
    }
    return 'loading...';
  }


}
