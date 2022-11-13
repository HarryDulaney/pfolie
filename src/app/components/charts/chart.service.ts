import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoinMarketChartResponse } from 'src/app/models/coin-gecko';
import { CoinDataService } from 'src/app/services/coin-data.service';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  masterData: BehaviorSubject<CoinMarketChartResponse> = new BehaviorSubject<CoinMarketChartResponse>({} as CoinMarketChartResponse);


  coinId: string;
  coinName: string;
  days: number | string = 'max';
  interval: string = 'hourly';
  vsCurrency: string;

  constructor(public coinDataService: CoinDataService) {
    this.vsCurrency = this.coinDataService.defaultCurrency;
  }


  public initializeChart(coinId: string, coinName: string) {
    this.coinId = coinId;
    this.coinName = coinName;
    this.coinDataService.getMarketChart(this.coinId, this.vsCurrency, this.days, this.interval).subscribe(
      (response) => this.masterData.next(response));
  }

}
