import { Injectable } from "@angular/core";
import { CoinFullInfo } from '../models/coin-gecko';
import { BehaviorSubject } from "rxjs";
import { CoinDataService } from "./coin-data.service";
import { Router } from "@angular/router";
import { CacheService } from "./cache.service";
import { ChartService } from "../components/charts/chart.service";
import { PortfolioService } from "./portfolio.service";
import { PortfolioMeta } from "../models/portfolio";


@Injectable()
export class NavService extends BehaviorSubject<CoinFullInfo> {
  navExpandedSource$: BehaviorSubject<boolean> = new BehaviorSubject(true);


  constructor(
    public coinDataService: CoinDataService,
    public router: Router,
    private cache: CacheService,
    private chartService: ChartService,
  ) {
    super({});
  }

  public navigateTo(coinId: string) {
    this.coinDataService.readCoinInfo(coinId)
      .subscribe({
        next: (coinFullInfo) => {
          super.next(coinFullInfo);
        },
        error: (error) => {
          this.router.navigate(['/home']);
          window.alert("Navigation error occurred: " + error);
        },
        complete: () => {
          this.cache.cacheLastCoinViewed(coinId, super.getValue().name);
          this.chartService.initializeChart(coinId, super.getValue().name);
          this.router.navigate(['/tokens', coinId]);
        }
      });
  }

  public refreshToLastCoinViewed() {
    if (this.cache.hasLastCoinCache()) {
      let lastCoin = this.cache.getCachedLastCoinViewed();
      this.navigateTo(lastCoin.id);
    }

  }
}
