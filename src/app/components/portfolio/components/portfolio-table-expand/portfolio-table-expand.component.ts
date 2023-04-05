import { MediaMatcher } from '@angular/cdk/layout';
import { CurrencyPipe, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OwnedAsset, OwnedAssetView, Portfolio, Transaction } from 'src/app/models/portfolio';
import * as Const from '../../../../constants';
import { PortfolioBuilderService } from '../../services/portfolio-builder.service';
import { PortfolioService } from '../../services/portfolio.service';
import { TransactionService } from './transaction.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'primeng/api';

@Component({
    selector: 'app-portfolio-table-expand',
    templateUrl: './portfolio-table-expand.component.html',
    styleUrls: ['./portfolio-table-expand.component.scss'],
    standalone: true,
    imports: [TableModule, SharedModule, DropdownModule, FormsModule, InputNumberModule, NgIf, MatButtonModule, ButtonModule, OverlayPanelModule]
})
export class PortfolioTableExpandComponent implements AfterViewInit, OnDestroy {
  @ViewChild('edt') edt: Table;
  @Input('rowIndex') parentRowIndex: number;
  @Input('portfolio') portfoilo: any;
  @Input('parentData') parentData: OwnedAssetView;
  @Input('service') transactionService!: TransactionService;
  @Input('expandedRowKeys') expandedRowKeys: { [s: string]: boolean };
  @Input('screenSize') screenSize: string;

  editingRowKeys: { [s: string]: boolean } = {};
  errorMap: { [s: string]: any } = {};
  clonedItems: { [s: string]: Transaction; } = {};

  isLoading: boolean;

  transactionTypeOptions = [
    { type: 'buy' },
    /*     { type: 'sell' },
        { type: 'trade' },
        { type: 'swap' } */
  ];

  destroySubject$ = new Subject();


  constructor(
    private cd: ChangeDetectorRef,
    public currencyPipe: CurrencyPipe,
    private builder: PortfolioBuilderService,
    private portfolioService: PortfolioService) { }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.transactionService.transactionSource$.pipe(takeUntil(this.destroySubject$)).subscribe(
      appEvent => {
        if (appEvent !== null && appEvent.rowIndex === this.parentRowIndex) {
          switch (appEvent.name) {
            case "AddNew": {
              this.edt.initRowEdit(appEvent.metadata);
            }
          }
        }

      }

    );
  }


  hasErrors(): boolean {
    return this.errorMap.length > 0;
  }

  isShowPaginator() {
    return (this.parentData.transactions.length >= 5);
  }

  addNewTransaction() {
    if (this.parentData.transactions === undefined) {
      this.parentData.transactions = [];
    }

    let transaction = this.getRawTransaction(this.parentData);
    this.parentData.transactions.push(transaction);
    this.edt.initRowEdit(transaction);

    this.cd.detectChanges();
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
    this.parentData.transactions[rowIndex] = this.clonedItems[item.transactionId];
    delete this.clonedItems[item.transactionId];
    this.editingRowKeys[item.transactionId] = false;

  }

  onRowRemove(item: Transaction, rowIndex: number) {
    let asset = this.parentData;
    let removeIndex = asset.transactions.findIndex(x => x.transactionId === item.transactionId);
    asset.transactions.splice(removeIndex, 1);
    this.portfolioService.updatePortfolioAsset(asset);

  }

  onRowEditSave(transaction: Transaction) {
    /* Run Validation */
    /* Save changes */
    delete this.clonedItems[transaction.transactionId];
    let totalQuantity = this.builder.calculateTotalQuantity(this.parentData);
    let totalCostBasis = this.builder.calculateTotalCostBasis(this.parentData);
    let asset = this.builder.getBasicOwnedAssetObject(this.parentData.id, totalQuantity, totalCostBasis, this.parentData.transactions);
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
