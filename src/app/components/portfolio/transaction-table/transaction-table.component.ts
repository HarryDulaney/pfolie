import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule, CurrencyPipe, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OwnedAsset, OwnedAssetView, Transaction } from 'src/app/models/portfolio';
import * as Const from '../../../constants';
import { PortfolioBuilderService } from '../../../services/portfolio-builder.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { TransactionService } from './transaction.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  standalone: true,
  imports: [
    TableModule,
    SharedModule,
    CommonModule,
    DropdownModule,
    DialogModule,
    FormsModule,
    InputNumberModule,
    NgIf,
    MatButtonModule,
    ButtonModule,
    OverlayPanelModule
  ]
})
export class TransactionTableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input('service') transactionService!: TransactionService;
  @Input('screenSize') screenSize: string;

  @ViewChild('transactionTable') transactionTable: Table;

  @Output() onBack: EventEmitter<any> = new EventEmitter();

  transactions: Transaction[] = [];
  editAsset: OwnedAssetView;
  editingRowKeys: { [s: string]: boolean } = {};
  errorMap: { [s: string]: any } = {};
  clonedItems: { [s: string]: Transaction; } = {};

  isLoading: boolean;
  sortOrder = 1;
  sortField = 'id';
  defaultSortOrder = 1;
  searchScrollHeight: string;
  maxSearchWidth: string;
  modalPostion: string;
  dialogStyle = { 'width': '80vw', 'height': '90vh', 'overflow-y': 'hidden' };
  showTransactionDialog: boolean;

  transactionTypeOptions = [
    { type: 'buy' },
    { type: 'sell' },
    { type: 'trade' },
    { type: 'swap' }
  ];

  destroySubject$ = new Subject();


  constructor(
    private cd: ChangeDetectorRef,
    public currencyPipe: CurrencyPipe,
    private builder: PortfolioBuilderService,
    private portfolioService: PortfolioService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.screenSize) {
      this.initScreenSizes();
    }
  }


  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.initScreenSizes();
    this.transactionService.assetSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe({
        next: (ownedAssetView: OwnedAssetView) => {
          this.editAsset = ownedAssetView;
          this.transactions = ownedAssetView.transactions;
          this.cd.detectChanges();
        }
      });

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


  hasErrors(): boolean {
    return this.errorMap.length > 0;
  }

  isShowPaginator() {
    return (this.transactions.length >= 5);
  }

  addNewTransaction() {
    if (this.transactions === undefined) {
      this.transactions = [];
      this.editAsset.transactions = [];
    }

    let transaction = this.getRawTransaction(this.editAsset);
    this.transactions.push(transaction);
    this.editAsset.transactions.push(transaction);
    this.transactionTable.initRowEdit(transaction);
    this.cd.detectChanges();
  }

  returnToPortfolioTable(event) {
    this.onBack.emit(event);
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

  onRowEditInit(item: Transaction, rowIndex: number) {
    this.clonedItems[item.transactionId] = { ...item };
    this.editingRowKeys[item.transactionId] = true;
  }

  onRowEditCancel(event, item: Transaction, rowIndex: number) {
    this.transactions[rowIndex] = this.clonedItems[item.transactionId];
    delete this.clonedItems[item.transactionId];
    this.editingRowKeys[item.transactionId] = false;

  }

  onRowRemove(item: Transaction, rowIndex: number) {
    let asset = this.editAsset;
    let removeIndex = asset.transactions.findIndex(x => x.transactionId === item.transactionId);
    asset.transactions.splice(removeIndex, 1);
    this.portfolioService.updatePortfolioAsset(asset);

  }

  onRowEditSave(transaction: Transaction) {
    /* Run Validation */
    /* Save changes */
    delete this.clonedItems[transaction.transactionId];
    let totalQuantity = this.builder.calculateTotalQuantity(this.editAsset);
    let totalCostBasis = this.builder.calculateTotalCostBasis(this.editAsset);
    let asset = this.builder.getBasicOwnedAssetObject(this.editAsset.id, totalQuantity, totalCostBasis, this.transactions);
    asset.averageUnitCost = this.builder.calculateAverageUnitCost(asset);
    this.editingRowKeys[transaction.transactionId] = false;
    this.portfolioService.updatePortfolioAsset(asset);
  }


  formatBalance(data: number) {
    const absoluteValue = Math.abs(data);
    if ((absoluteValue / 100) > 0.0001) {
      return this.currencyPipe.transform(data, 'USD', '$', Const.CONSTANT.FORMAT.USD_SHORT);
    }
    return this.currencyPipe.transform(data, 'USD', '$', Const.CONSTANT.FORMAT.USD);
  }

}
