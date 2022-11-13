import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class PieChartService {
  pieData: BehaviorSubject<any> = new BehaviorSubject({});
}
