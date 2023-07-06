import { CurrencyPipe, DecimalPipe, NgIf, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MenuItem, SharedModule } from 'primeng/api';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { Table, TableModule } from 'primeng/table';
import { OwnedAsset, OwnedAssetView, Portfolio, Transaction } from 'src/app/models/portfolio';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { NavService } from 'src/app/services/nav.service';
import { ToastService } from 'src/app/services/toast.service';
import { UtilityService } from 'src/app/services/utility.service';
import { PortfolioBuilderService } from '../../../services/portfolio-builder.service';
import { PortfolioService } from '../../../services/portfolio.service';
import * as Const from '../../../constants';
import { TransactionService } from '../transaction-table/transaction.service';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TransactionTableComponent } from '../transaction-table/transaction-table.component';
import { DeltaIcon } from '../../shared/change-icon/delta.component';
import { MatButtonModule } from '@angular/material/button';
import { AssetSearchSelect } from '../../shared/search-select/search-select.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScreenService } from 'src/app/services/screen.service';
import { ThemeService } from 'src/app/services/theme.service';
import { BasicCoin } from 'src/app/models/coin-gecko';

@Component({
  selector: 'app-portfolio-table',
  templateUrl: './portfolio-table.component.html',
  styleUrls: ['./portfolio-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    ProgressSpinnerModule,
    DialogModule,
    AssetSearchSelect,
    TableModule,
    SharedModule,
    MatButtonModule,
    DeltaIcon,
    OverlayPanelModule,
    TransactionTableComponent,
    CurrencyPipe,
    DatePipe
  ]
})
export class PortfolioTableComponent implements OnInit, OnDestroy {
  @ViewChild('pdt') pdt: Table;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;
  @ViewChild('assetSearchDialog') assetSearchDialog!: Dialog;


  @Input('viewSource') viewSource$: Observable<OwnedAssetView[]>;
  @Input('calculatedValuesSource') calculatedValuesSource$: Observable<any>;
  @Input('portfolioSource') portfolioSource$: Observable<Portfolio>;
  @Input('screenSize') screenSize: string;

  @Input('selectionMode')
  set selectionMode(selectMode: string) {
    if (selectMode) {
      this.selectMode = selectMode;
      this.cd.markForCheck();
    }
  }

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  @Output() onEdit: EventEmitter<any> = new EventEmitter();

  selectMode: string;
  isLoading: boolean;
  sortOrder = 1;
  sortField = 'id';
  defaultSortOrder = 1;
  assets: OwnedAsset[];
  clonedItems: { [s: string]: OwnedAssetView; } = {};
  errorMap: { [s: string]: any } = {};
  expandedRowKeys: { [s: string]: boolean } = {};
  isEditing: boolean;
  searchForm: UntypedFormGroup;
  searchField: UntypedFormControl = new UntypedFormControl('');
  rowOptions: MenuItem[];
  responsiveLayout = "scroll";
  selectedAsset: OwnedAssetView;
  overlayBgColor: string;
  openRowPanels: OverlayPanel[] = [];
  view: OwnedAssetView[] = [];
  portfolio: Portfolio;
  calculatedValues: any = {};
  coinSource$: Observable<BasicCoin[]>;
  dialogWidth: string;
  dialogHeight: string;
  showAssetSearchDialog: boolean;
  searchScrollHeight: string;
  maxSearchWidth: string;
  modalPostion: string;
  dialogStyle = { 'width': '80vw', 'height': '90vh', 'overflow-y': 'hidden' };
  protected selectedRowData: any = undefined;
  imagePreviewSrc: string = '../assets/img/image_filler_icon_blank.jpg';
  defaultId: string = '-1';
  currentDate: Date = new Date();
  private destroySubject$ = new Subject();
  sparklineColor = '#006aff';

  constructor(
    private cd: ChangeDetectorRef,
    public portfolioService: PortfolioService,
    public coinDataService: CoinDataService,
    private themeService: ThemeService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    public decimalPipe: DecimalPipe,
    public currencyPipe: CurrencyPipe,
    private navService: NavService,
    private screenService: ScreenService) {
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.cd.markForCheck();
  }


  ngOnInit(): void {
    this.coinSource$ = this.portfolioService.getCoinSource();
    this.initScreenSizes();
    this.viewSource$
      .pipe(takeUntil(this.destroySubject$)
      ).subscribe({
        next: (view) => {
          this.view = view;
          this.cd.markForCheck();
        }
      });

    this.calculatedValuesSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (calculatedValues) => {
          this.calculatedValues = calculatedValues;
          this.cd.markForCheck();
        }
      });

    this.portfolioSource$
      .pipe(
        takeUntil(this.destroySubject$)
      ).subscribe({
        next: (portfolio) => {
          this.portfolio = portfolio;
          this.cd.markForCheck();
        }
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

    this.screenService.documentClickedSource$.pipe(
      takeUntil(this.destroySubject$)
    ).subscribe({
      next: (event) => {
        if (this.openRowPanels.length !== 0) {
          if (!this.pdt.el.nativeElement.contains(event.target)) {
            ScreenService.closeOverlays(this.openRowPanels);
          }
        }
      }
    });

    this.overlayBgColor = this.themeService.getCssVariableValue('--hover-bg-fancy');

  }

  initScreenSizes() {
    switch (this.screenSize) {
      case Const.CONSTANT.SCREEN_SIZE.S:
        this.searchScrollHeight = '68vh';
        this.maxSearchWidth = '90vw';
        this.modalPostion = 'top';
        this.dialogStyle = { 'width': '90vw', 'height': '90vh', 'overflow-y': 'hidden' };

        break;
      case Const.CONSTANT.SCREEN_SIZE.XS:
        this.searchScrollHeight = '68vh';
        this.maxSearchWidth = '90vw';
        this.modalPostion = 'top';
        this.dialogStyle = { 'width': '90vw', 'height': '90vh', 'overflow-y': 'hidden' };
        break;

      case Const.CONSTANT.SCREEN_SIZE.M:
      case Const.CONSTANT.SCREEN_SIZE.L:
      case Const.CONSTANT.SCREEN_SIZE.XL:
        this.searchScrollHeight = '42vh';
        this.dialogStyle = { 'width': '60vw', 'height': '60vh', 'overflow-y': 'hidden' };
        this.maxSearchWidth = '60vw';
        this.modalPostion = 'center';
        break;
      default:
        this.searchScrollHeight = '42vh';
        this.maxSearchWidth = '50vw';
        this.modalPostion = 'center';
        this.dialogStyle = { 'width': '80vw', 'height': '60vh', 'overflow-y': 'hidden' };
    }
  }

  showAssetSearchContainer(event) {
    this.showAssetSearchDialog = true;
    this.cd.markForCheck();
  }


  onRowSelect(event) {
    this.onSelect.emit(event);
  }

  onRowPanelShow(event: any, data: any, index: number) {
    this.overlayBgColor = this.themeService.getCssVariableValue('--hover-bg-fancy');
    this.cd.markForCheck();
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

  onRowAddInit(id: string) {
    if (id) {
      if (PortfolioBuilderService.isUniqueOwnedAsset(id, this.portfolio)) {
        let newAsset = this.getRawAssetObject(id);
        this.portfolioService.addPortfolioAsset(newAsset);
        this.coinDataService.readCoinInfo(id).subscribe({
          next: (coinInfo) => {
          }
        });

      } else {
        this.toastService.showUserPromptToast(
          "This portfolio already contains " + id + " would you like to add/edit quantity instead?", "Duplicate Asset Warning"
        ).subscribe(
          result => {
            if (result) {
              // Add to existing portfoilo asset...
            }
          }

        )
      }

    }

  }

  onRowEditInit(item: OwnedAssetView) {
    this.clonedItems[item.id] = { ...item };
  }

  onRowEditCancel(item: OwnedAssetView, rowIndex: number) {
    this.view[rowIndex] = this.clonedItems[item.id];
    delete this.clonedItems[item.id];

  }

  onRowRemove(item: OwnedAssetView) {
    this.portfolioService.deletePortfolioAsset(item);
  }

  handleAddNewAsset(id: string) {
    if (this.assetSearchDialog.visible) {
      this.showAssetSearchDialog = false;
    }

    this.onRowAddInit(id);
  }

  onOpenTransactions(view: OwnedAssetView, rowIndex: number, event) {
    this.onEdit.emit({ view: view, rowIndex: rowIndex, event: event });
    this.cd.markForCheck();
  }

  hasErrors(): boolean {
    return this.errorMap.length > 0;
  }


  getAssetGainLoss(assetView: OwnedAssetView) {
    return assetView.balance - assetView.totalCostBasis;
  }

  formatAssetGainLoss(assetView: OwnedAssetView) {
    return this.currencyPipe.transform(assetView.balance - assetView.totalCostBasis, 'USD', '$', Const.CONSTANT.FORMAT.USD_SHORT);
  }

  formatCurrency(value: number): string {
    return this.utilityService.format(value, 'c');
  }


  getRawAssetObject(id: string): OwnedAsset {
    return {
      id: id,
      totalQuantity: 0,
      totalCostBasis: 0,
      allocation: 0,
      transactions: []
    } as OwnedAsset;
  }


  formatPercent(decimalPercentage: number) {
    if (decimalPercentage === 0 || decimalPercentage === undefined) {
      return 'n/a';
    }

    const percent = decimalPercentage * 100;
    const absoluteValue = Math.abs(percent);
    if (absoluteValue / 100 > 0.0001) {
      return this.decimalPipe.transform(percent, Const.CONSTANT.FORMAT.PERCENT_EX_SHORT) + "%";
    }
    return this.decimalPipe.transform(percent, Const.CONSTANT.FORMAT.PERCENT_EX_LONG) + "%";

  }

  formatBalance(data: number) {
    const absoluteValue = Math.abs(data);
    if ((absoluteValue / 100) > 0.0001) {
      return this.currencyPipe.transform(data, 'USD', '$', Const.CONSTANT.FORMAT.USD_SHORT);
    }
    return this.currencyPipe.transform(data, 'USD', '$', Const.CONSTANT.FORMAT.USD);
  }

  openAssetInfo(ownedAssetView: OwnedAssetView) {
    this.navService.navigateTo(ownedAssetView.id);
  }


}