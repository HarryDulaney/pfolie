import { Injectable } from "@angular/core";
import { CoinFullInfo } from '../models/coin-gecko';
import { BehaviorSubject, Subject } from "rxjs";
import { CoinDataService } from "./coin-data.service";
import { Router } from "@angular/router";
import { CacheService } from "./cache.service";
import { ChartService } from "../components/charts/chart.service";


@Injectable()
export class NavService extends BehaviorSubject<CoinFullInfo> {
  navExpandedSource$: Subject<boolean> = new Subject();


  constructor(
    public coinDataService: CoinDataService,
    public router: Router,
    private cache: CacheService,
    private chartService: ChartService
  ) {
    super({});
  }

  public navigateTo(coinId: string) {
    this.coinDataService.readCoinInfo(coinId).subscribe(coinFullInfo => {
      super.next(coinFullInfo);
    }, (error) => {
      this.router.navigate(['/home']);
      window.alert("Navigation error occurred: " + error);
    }, () => {
      this.cache.cacheLastCoinViewed(coinId, super.getValue().name);
      this.chartService.initializeChart(coinId, super.getValue().name);
      this.router.navigate(['/tokens', coinId]);
    });

  }

  public refreshToLastCoinViewed() {
    if (this.cache.hasLastCoinCache()) {
      let lastCoin = this.cache.getCachedLastCoinViewed();
      this.navigateTo(lastCoin.id);
    }

  }
}
