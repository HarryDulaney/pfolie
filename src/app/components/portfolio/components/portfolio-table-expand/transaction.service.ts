import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppEvent } from 'src/app/models/events';
import { Transaction } from 'src/app/models/portfolio';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionSource: Subject<AppEvent> = new Subject<AppEvent>();
  transactionSource$: Observable<AppEvent> = this.transactionSource.asObservable();

  constructor() { }

  addNew(transaction: Transaction, rowIndex: number, event) {
    let appEvent: AppEvent = { event: event, metadata: transaction, name: "AddNew", rowIndex: rowIndex };
    this.transactionSource.next(appEvent);
  }
}
