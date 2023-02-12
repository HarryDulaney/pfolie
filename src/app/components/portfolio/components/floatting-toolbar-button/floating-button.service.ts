import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as Constants from '../../../../constants';

@Injectable({
  providedIn: 'root'
})
export class FloatingButtonService extends BehaviorSubject<string> {
  private isShowing: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isShowingObservable: Observable<boolean> = this.isShowing.asObservable();

  floatButtonTimeOut = 6500;

  constructor() {
    super('');
  }
  show() {
    super.next(Constants.SHOW);
    this.isShowing.next(true);
    /* Hide after 6.5 seconds */
    setTimeout(() => {
      this.hide();
    }, this.floatButtonTimeOut)
  }

  hide() {
    super.next(Constants.HIDE);
    this.isShowing.next(false);
  }

  clicked() {
    super.next(Constants.CLICKED);
  }
}
