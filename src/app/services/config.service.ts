import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { BasicCoin } from "../models/coin-gecko";
import { ApiService } from "./api.service";
import { SessionService } from "./session.service";
import { CacheService } from "./cache.service";
import { PreferencesService, UserPreferences } from "./preferences.service";

@Injectable({
    providedIn: 'root'
})
export class ConfigService extends BehaviorSubject<BasicCoin[]> {
    baseCoins: BasicCoin[] = [];
    filteredCoins: BasicCoin[] = [];

    private basicCoins$: BehaviorSubject<BasicCoin[]> = new BehaviorSubject<BasicCoin[]>(null);
    basicCoinsSource$ = this.basicCoins$.asObservable();

    constructor(
        private apiService: ApiService,
        private cache: CacheService,
        private sessionService: SessionService,
        private preferencesService: PreferencesService
    ) {
        super([]);
    }


    load(): void {
        if (!this.sessionService.initialized) {
            this.sessionService.init();
        }

        if (this.cache.getTimeStampRaw() == null || !this.cache.isCacheValid()) {
            var promise: Promise<BasicCoin[]> = this.apiService.getListCoins().toPromise();
            promise.then(
                (result) => {
                    this.baseCoins = result;
                    this.filteredCoins.push(...this.baseCoins);
                    this.basicCoins$.next(this.baseCoins);
                    super.next(this.filteredCoins);
                    this.cache.cacheCoinList(this.baseCoins);
                }).finally(() => {
                    this.cache.setTimeStampCachedCoinList();
                });

        } else {
            let cachedCoins = this.cache.getCachedCoinsList();
            this.baseCoins = JSON.parse(cachedCoins);
            this.filteredCoins.push(...this.baseCoins);
            this.basicCoins$.next(this.baseCoins);
            super.next(this.filteredCoins);
        }


    }

    filter(word: string) {
        if (word && word !== '') {
            this.filteredCoins = this.baseCoins.filter(v => {
                return v.name.toLowerCase().startsWith(word.toLowerCase())
            });
        } else {
            this.filteredCoins = this.baseCoins;
        }
        super.next(this.filteredCoins);
    }

    resetFilter() {
        this.filteredCoins = this.baseCoins;
        super.next(this.filteredCoins);
    }



    getPreferences(): UserPreferences {
        return this.preferencesService.userPreferences;
    }

}


