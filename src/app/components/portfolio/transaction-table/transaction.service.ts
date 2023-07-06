import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppEvent } from 'src/app/models/events';
import { OwnedAsset, OwnedAssetView, Transaction } from 'src/app/models/portfolio';

@Injectable()
export class TransactionService {
  private assetSource: BehaviorSubject<OwnedAssetView> = new BehaviorSubject<OwnedAssetView>(null);
  assetSource$: Observable<OwnedAssetView> = this.assetSource.asObservable();

  expandedRowKeys: { [s: string]: boolean } = {};

  constructor() { }

  setAssetToEdit(assetView: OwnedAssetView) {
    this.assetSource.next(assetView);
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
