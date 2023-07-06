import { CurrencyPipe, DecimalPipe, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, Subject } from 'rxjs';
import { tap, takeUntil, take } from 'rxjs/operators';
import { AppEvent } from 'src/app/models/events';
import { OwnedAssetView, Portfolio, Transaction } from 'src/app/models/portfolio';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { ScreenService } from 'src/app/services/screen.service';
import { NavService } from 'src/app/services/nav.service';
import { PortfolioTableComponent } from './portfolio-table/portfolio-table.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { PortfolioService } from '../../services/portfolio.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuItem, SharedModule } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { ToolbarComponent } from 'src/app/components/shared/toolbar/toolbar.component';
import { TooltipOptions } from 'highcharts';
import { PORTFOLIO_TABLE_MAIN, PORTFOLIO_TRANSACTION_TABLE } from 'src/app/constants';
import { TransactionTableComponent } from './transaction-table/transaction-table.component';
import { TransactionService } from './transaction-table/transaction.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  providers: [TransactionService, CurrencyPipe, DecimalPipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SharedModule,
    ToolbarComponent,
    ProgressSpinnerModule,
    WorkspaceComponent,
    PortfolioTableComponent,
    TransactionTableComponent
  ]
})
export class PortfolioComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('portfolioTable') portfolioTable: PortfolioTableComponent;
  @ViewChild('transactionsTable') transactionsTable: TransactionTableComponent;
  @ViewChild('toolbar') toolbar: ToolbarComponent;
  @ViewChild('searchTrackPanel') searchTrackedPanel: OverlayPanel;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;
  @ViewChild('workspace') workspace: WorkspaceComponent;


  coinDataService: CoinDataService = inject(CoinDataService);
  portfolioService: PortfolioService = inject(PortfolioService);
  private userService: UserService = inject(UserService);
  private navService: NavService = inject(NavService);
  private cd: ChangeDetectorRef = inject(ChangeDetectorRef);
  private router: Router = inject(Router);
  private screenService: ScreenService = inject(ScreenService);
  transactionService: TransactionService = inject(TransactionService);

  tableType: string = PORTFOLIO_TABLE_MAIN;
  title = 'Portfolio';

  /* Component Palette Options */
  isPaletteDismissible: boolean = true;
  showPaletteCloseIcon: boolean = true;
  closePaletteOnEscape: boolean = true;
  isPaletteModal: boolean = false;
  sidebarPostion: string = '';
  smallScreen: boolean;
  assetSource$: Observable<OwnedAssetView[]>;
  portfolioView: OwnedAssetView[];
  destroySubject$ = new Subject();

  chartData: any;
  chartOptions: any;
  showAddEditDialog: boolean = false;
  portfolioExpandedSource: any;
  isNavExpanded: boolean = false;
  screenSize: string;
  navExpandProvider: Observable<boolean>;
  isLoading: boolean = false;
  isMain = false;
  portfolioName = '';
  tooltipOptions: TooltipOptions

  constructor() {
    this.navService.navExpandedSource$
      .subscribe({
        next: (isExpanded) => {
          this.isNavExpanded = isExpanded;
          this.cd.markForCheck();
        }
      });
    this.navExpandProvider = this.navService.navExpandedSource$;
    this.tooltipOptions = this.screenService.tooltipOptions;
  }


  ngOnInit(): void {
    this.isLoading = true;

    this.screenService.screenSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe(screenSize => {
        this.screenSize = screenSize;
        this.cd.markForCheck();
      });

  }

  ngAfterViewInit(): void {
    this.portfolioService.portfolio$
      .pipe(
        takeUntil(this.destroySubject$),
      ).subscribe({
        next: (data) => {
          if (data) {
            this.isMain = data.isMain;
            this.portfolioName = data.name;
            this.toolbar.service.setMenuSource(this.toolbarMenuItems(data));
            this.isLoading = false;
            this.cd.markForCheck();
          }
        },
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.isLoading = false;
        }
      });

    this.screenService.documentClickedSource$
      .pipe(
        takeUntil(this.destroySubject$),
        tap(event => {
          this.toolbar.service.setEventSource({ name: 'click', event: event } as AppEvent);
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

    this.portfolioTable.onSelect
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe(
        value => {
          console.log('Row selected: ' + value);
        }
      );

    this.cd.markForCheck();

  }


  ngOnDestroy(): void {
    this.portfolioService.isInitialized = false;
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  onRename(newName: string) {
    this.portfolioService.rename(newName).then(
      () => {
        this.toolbar.label = newName;

      }
    )
  }


  openTransactionView() {
    this.tableType = PORTFOLIO_TRANSACTION_TABLE;
    this.cd.markForCheck();
  }

  onCloseTransactionView(event) {
    // Save the transaction here
    this.tableType = PORTFOLIO_TABLE_MAIN;
    this.cd.markForCheck();
  }

  handleAddPortfolioEvent(event: any) {
    this.portfolioTable.showAssetSearchContainer(event.event);
  }

  handleDeletePortfolioEvent(event: any, portfolio: Portfolio) {
    let subscription = this.portfolioService.toast.showUserPromptToast('Are you sure you want to delete ' + portfolio.portfolioName + ' ?', 'Confirm Delete')
      .subscribe({
        next: (result) => {
          if (result) {
            this.portfolioService.handleDelete(portfolio).then(() => {
              this.portfolioService.toast.showSuccessToast(portfolio.portfolioName + ' was deleted.');
              const nextPortfolio = this.userService.removePortfolio(portfolio.portfolioId);
              if (nextPortfolio) {
                this.portfolioService.loadAndOpen(nextPortfolio).subscribe({
                  next: (portfolio) => {
                    this.portfolioService.setPortfolio(portfolio);
                  }
                });
              } else {
                this.router.navigate(['home']);
                this.portfolioService.reset();
              }

            })
          } else {
            this.portfolioService.toast.showSuccessToast(this.portfolioService.current.portfolioName + ' was not deleted.');
          }
        },
        complete: () => subscription.unsubscribe(),
        error: () => subscription.unsubscribe()
      });
  }


  toolbarMenuItems(portfolio: Portfolio): MenuItem[] {
    return [{
      label: 'Portfolio',
      icon: 'fa fa-bolt',
      items: [
        {
          label: portfolio.isMain ? 'Unset as Main' : 'Set as Main',
          tooltipOptions: portfolio.isMain ?
            { tooltipLabel: 'Unset this as your default portfolio', tooltipPosition: 'right' } :
            { tooltipLabel: 'Make this your default portfolio', tooltipPosition: 'right' },
          icon: 'fa-solid fa-star',
          command: portfolio.isMain ? (event) => {
            this.handleUnAssignMain(event, this.portfolioService.current);
          } : (event) => {
            this.handleAssignMain(event, this.portfolioService.current);
          }
        }, {
          label: 'Delete',
          tooltipOptions: { tooltipLabel: 'Delete the current Portoflio', tooltipPosition: 'right' },
          icon: 'pi pi-trash',
          command: (event) => {
            this.handleDeletePortfolioEvent(event, portfolio);
          }
        }]
    },
    {
      label: 'Edit',
      icon: 'fa fa-pen-square',
      items: [
        {
          label: 'Add New',
          icon: 'pi pi-plus',
          tooltipOptions: { tooltipLabel: 'Add a new asset to Portfolio', tooltipPosition: 'right' },
          command: (event) => {
            this.handleAddPortfolioEvent(event);
          }
        }]
    },
    ];

  }

  handleAssignMain(event: any, current: Portfolio) {
    this.isMain = true;
    this.portfolioService.assignMain(current)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          if (result) {
            this.isMain = true;
            this.portfolioService.toast.showSuccessToast('Portfolio ' + result.name + ' is now the Main portfolio.');
            this.portfolioService.setPortfolio(result);
            this.toolbar.label = result.name;
            this.toolbar.service.setMenuSource(this.toolbarMenuItems(result));
            this.cd.markForCheck();
          }
        },
        complete: () => {
          this.cd.markForCheck();
        }
      });

  }


  handleUnAssignMain(event: any, current: Portfolio) {
    this.portfolioService.unAssignMain(current)
      .pipe(
        take(1))
      .subscribe({
        next: (result) => {
          if (result) {
            this.isMain = false;
            this.portfolioService.toast.showSuccessToast('Main status removed from Portfoilo: ' + current.name + '.');
            this.portfolioService.setPortfolio(result);
            this.toolbar.label = result.name;
            this.toolbar.service.setMenuSource(this.toolbarMenuItems(result));
            this.cd.markForCheck();
          }
        },
        complete: () => {
          this.cd.markForCheck();
        }
      });

  }

  isMobile() {
    return this.screenService.isMobileScreen(this.screenSize)
  }

  preventDefault = (event) => {
    event.preventDefault();
  }

  openAssetInfoPage(event) {
    this.navService.navigateTo(event.data.id);
  }

  onContainerClick(event) {
    if (event) {
      this.toolbar.handleCancelRename();
    }
  }
}
