import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class PieChartService {
  private dataSource: BehaviorSubject<{ [key: string]: number }> = new BehaviorSubject<{ [key: string]: number }>({});
  public dataSource$: Observable<{ [key: string]: number }> = this.dataSource.asObservable();


  setData(data: { [key: string]: number }) {
    this.dataSource.next(data);
  }

}
