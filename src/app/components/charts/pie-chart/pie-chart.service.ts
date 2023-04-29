import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class PieChartService {
  private dataSource: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  public dataSource$: Observable<any[]> = this.dataSource.asObservable();

  initializeChart() {
  }

}
