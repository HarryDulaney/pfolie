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
import { PortfolioBuilderService } from '../../services/portfolio-builder.service';
import { PortfolioService } from '../../services/portfolio.service';
import * as Const from '../../../../constants';
import { TransactionService } from '../portfolio-table-expand/transaction.service';
import { Dialog, DialogModule } from 'primeng/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PortfolioTableExpandComponent } from '../portfolio-table-expand/portfolio-table-expand.component';
import { DeltaIcon } from '../../../icons/change-icon/delta.component';
import { MatButtonModule } from '@angular/material/button';
import { AssetSearchSelect } from '../../../search-select/search-select.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScreenService } from 'src/app/services/screen.service';

@Component({
  selector: 'app-portfolio-table',
  templateUrl: './portfolio-table.component.html',
  styleUrls: ['./portfolio-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, ProgressSpinnerModule, DialogModule, AssetSearchSelect, TableModule, SharedModule, MatButtonModule, DeltaIcon, OverlayPanelModule, PortfolioTableExpandComponent, CurrencyPipe, DatePipe]
})
export class PortfolioTableComponent implements OnInit, OnDestroy {
  @ViewChild('pdt') pdt: Table;
  @ViewChild('rowPanel') rowPanel: OverlayPanel;
  @ViewChild('assetSearchDialog') assetSearchDialog!: Dialog;


  @Input('view') view: OwnedAssetView[];
  @Input('calculatedValues') calculatedValues;
  @Input('portfolio') portfolio: Portfolio;
  @Input('screenSize') screenSize: string;
  @Input('allCoins') allCoins;

  @Input('selectionMode')
  set selectionMode(selectMode: string) {
    if (selectMode) {
      this.selectMode = selectMode;
      this.cd.markForCheck();
    }
  }

  @Output() onSelect: EventEmitter<any> = new EventEmitter();

  selectMode: string;
  loadingIcon = 'pi pi-spin pi-spinner';
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

  showAssetSearchDialog: boolean;
  searchScrollHeight: string;
  maxSearchWidth: string;
  modalPostion: string;

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
    private transactionService: TransactionService,
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
    this.initScreenSizes();
    this.screenService.resizeSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (screenSize) => {
          this.screenSize = screenSize;
          this.cd.markForCheck();
        }
      });
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

  showAssetSearchContainer(event) {
    this.showAssetSearchDialog = true;
  }


  onRowSelect(event) {
    this.onSelect.emit(event);
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

  onAddNewTransaction(view: OwnedAssetView, rowIndex: number, event) {
    if (this.view[rowIndex].transactions === undefined) {
      this.view[rowIndex].transactions = [];
    }
    let transaction = this.getRawTransaction(view);
    this.view[rowIndex].transactions.push(transaction);
    this.expandedRowKeys[view.id] = true;
    this.transactionService.addNew(transaction, rowIndex, event)
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

  getRawTransaction(assetView: OwnedAsset): Transaction {
    return {
      transactionId: this.getNewTransactionId(assetView),
      assetId: assetView.id,
      quantity: 0,
      unitPrice: 0,
      type: 'buy'
    } as Transaction;
  }

  getNewTransactionId(assetView: OwnedAsset): number {
    if (assetView.transactions && assetView.transactions.length > 0) {
      let lastTransactionId = this.getLastTransactionId(assetView.transactions);
      return lastTransactionId + 1;
    }
    return 1;
  }

  getLastTransactionId(transactions: Transaction[]): number {
    let highestId = -1;
    transactions.forEach(
      transaction => {
        highestId = Math.max(transaction.transactionId, highestId);
      }
    );
    return highestId;
  }
}