import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppEvent } from 'src/app/models/events';
import { OwnedAsset, OwnedAssetView, Portfolio, Transaction } from 'src/app/models/portfolio';

@Injectable()
export class TransactionService {
  private currentAssetId: string;
  get currentAsset(): string {
    return this.currentAssetId;
  }
  private assetSource: BehaviorSubject<OwnedAssetView> = new BehaviorSubject<OwnedAssetView>(null);
  /**
   * Observable to subscribe to for the current asset being edited
   */
  assetSource$: Observable<OwnedAssetView> = this.assetSource.asObservable();

  expandedRowKeys: { [s: string]: boolean } = {};

  constructor() { }

  setAssetToEdit(assetView: OwnedAssetView) {
    this.currentAssetId = assetView.id;
    this.assetSource.next(assetView);
  }

  updateTransactions(data: OwnedAssetView[]) {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const asset = data[i];
        if (asset.id === this.currentAssetId) {
          this.assetSource.next(asset);
          break;
        }
      }

    }
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
