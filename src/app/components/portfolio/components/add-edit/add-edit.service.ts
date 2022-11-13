import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddEditService {
  private showAddEdit: BehaviorSubject<string> = new BehaviorSubject<string>('hide');
  showAddSource$ = this.showAddEdit.asObservable();

  private result: EventEmitter<any> = new EventEmitter();
  resultSource$ = this.result.asObservable();

  constructor() { }

  showAddDialog(): Observable<any> {
    this.showAddEdit.next('show');
    return this.resultSource$;
  }

  hideAddDialog() {
    this.showAddEdit.next('hide');
  }

  sendResult(results: any) {
    this.result.emit(results);
  }

}
