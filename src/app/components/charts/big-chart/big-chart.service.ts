import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CoinMarketChartResponse, GlobalMarketCapData } from 'src/app/models/coin-gecko';
import { CoinDataService } from 'src/app/services/coin-data.service';

@Injectable()
export class BigChartService {
    private dataSource: BehaviorSubject<GlobalMarketCapData> = new BehaviorSubject<GlobalMarketCapData>({} as GlobalMarketCapData);
    public dataSource$: Observable<GlobalMarketCapData> = this.dataSource.asObservable();


    days = 2880;
    vsCurrency = "usd";

    constructor(private coinDataService: CoinDataService) {
    }


    initializeChart(days?: number, vsCurrency?: string) {
        if (days && days !== this.days || vsCurrency && vsCurrency !== this.vsCurrency) {
            this.days = days;
            this.vsCurrency = vsCurrency;
        }

        return this.coinDataService.getGlobalCrytoChartData(this.days, this.vsCurrency)
            .subscribe(
                (response) => this.dataSource.next(response))


    }

}
