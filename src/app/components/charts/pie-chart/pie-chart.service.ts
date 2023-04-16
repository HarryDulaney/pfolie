import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable()
export class PieChartService {
  pieData: BehaviorSubject<any> = new BehaviorSubject({});
}
