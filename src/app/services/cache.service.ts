import { Injectable, OnInit } from '@angular/core';
import { BasicCoin } from '../models/coin-gecko';
import { UserPreferences } from './preferences.service';


export interface LastCoin {
    id: string;
    name: string;
}

export interface CachedPortfolio {
    pid: number;
    pName: string;
}

export interface TimeStamp {
    timeInMillis: number;
}

@Injectable()
export class CacheService {
    private readonly CACHE_VALID_PERIOD = 86400000; // Milliseconds in one day

    private readonly LAST_PORTFOLIO_WORKSPACE_KEY = "pFoliePreviousPortfolioWorkspace";
    private readonly COINLIST_STORE_KEY = "pFolieCachedCoinsList";
    private readonly COINLIST_STORE_TIMESTAMP_KEY = "pFolieLastCacheCoinListTimeStamp";
    private readonly LAST_COIN_VIEWED_KEY = "pFolieLastAssetViewed";
    private readonly MIGRATED_KEY = "pFolieCacheIsMigrated";

    private readonly OLD_LAST_PORTFOLIO_WORKSPACE_KEY = "CoinEtc-Previous-Portfolio-Workspace";
    private readonly OLD_COINLIST_STORE_KEY = "Cache-Coin-List-CoinEtc";
    private readonly OLD_COINLIST_STORE_TIMESTAMP_KEY = "Cache-TimeStamp-Coin-List_CoinEtc";
    private readonly OLD_LAST_COIN_VIEWED_KEY = "Cache-Last-Coin-Viewed-CoinEtc";

    private readonly USER_PREFS_KEY = "P-folie-Preferences-User-None-SPI";


    clear() {
        localStorage.clear();
    }

    public getUserPreferences(): UserPreferences {
        const prefs = localStorage.getItem(this.USER_PREFS_KEY);
        if (prefs === null) {
            return null;
        }

        return JSON.parse(prefs);
    }

    public setUserPreferences(userPreferences: UserPreferences) {
        localStorage.setItem(this.USER_PREFS_KEY, JSON.stringify(userPreferences));
    }

    public cacheCoinList(basicCoins: BasicCoin[]) {
        localStorage.setItem(this.COINLIST_STORE_KEY, JSON.stringify(basicCoins));
    }

    public getCachedCoinsList() {
        return localStorage.getItem(this.COINLIST_STORE_KEY);
    }

    public cacheLastCoinViewed(coinId: string, coinName: string) {
        let lastCoin: LastCoin = { id: coinId, name: coinName };
        localStorage.setItem(this.LAST_COIN_VIEWED_KEY, JSON.stringify(lastCoin));
    }

    public getCachedLastCoinViewed(): LastCoin {
        return JSON.parse(localStorage.getItem(this.LAST_COIN_VIEWED_KEY));
    }


    /* ---------------------------------------- TimeStamp ---------------------------------------- */

    public getTimeStampRaw() {
        return localStorage.getItem(this.COINLIST_STORE_TIMESTAMP_KEY);
    }


    public oldCacheExists(): boolean {
        return (this.hasOldCachedCoinsList() ||
            this.hasOldCachedTimeStamp() ||
            this.hasOldLastCoinCache() ||
            this.hasOldLastWorkspace());

    }

    public setTimeStampCachedCoinList() {
        let timeStamp: TimeStamp = { timeInMillis: Date.now() };
        localStorage.setItem(this.COINLIST_STORE_TIMESTAMP_KEY, JSON.stringify(timeStamp));
    }

    public isCacheValid(): boolean {
        let timeStamp = JSON.parse(this.getTimeStampRaw());
        let currTimeMillis = Date.now();
        let diff = currTimeMillis - timeStamp.timeInMillis;
        if (diff < this.CACHE_VALID_PERIOD) { return true; }
        else { return false; }

    }

    public hasLastCoinCache(): boolean {
        return localStorage.getItem(this.LAST_COIN_VIEWED_KEY) !== null;
    }

    /* ----------------------------- Portfolios ---------------------------------- */
    public cacheLastWorkspace(pid: number, pName: string) {
        let cachedPortfolio = { pid: pid, pName: pName };
        localStorage.setItem(this.LAST_PORTFOLIO_WORKSPACE_KEY, JSON.stringify(cachedPortfolio));
    }

    public getCachedLastWorkspace(): any {
        return JSON.parse(localStorage.getItem(this.LAST_PORTFOLIO_WORKSPACE_KEY));
    }

    /* ----------------------------- Helper Methods ---------------------------------- */
    migrate() {
        localStorage.removeItem(this.OLD_LAST_PORTFOLIO_WORKSPACE_KEY);
        localStorage.removeItem(this.OLD_COINLIST_STORE_KEY);
        localStorage.removeItem(this.OLD_COINLIST_STORE_TIMESTAMP_KEY);
        localStorage.removeItem(this.OLD_LAST_COIN_VIEWED_KEY);
    }

    public hasOldLastWorkspace(): boolean {
        return localStorage.getItem(this.OLD_LAST_PORTFOLIO_WORKSPACE_KEY) !== null;
    }

    public hasOldCachedCoinsList(): boolean {
        return localStorage.getItem(this.OLD_COINLIST_STORE_KEY) !== null;
    }

    public hasOldCachedTimeStamp() {
        return localStorage.getItem(this.OLD_COINLIST_STORE_TIMESTAMP_KEY) !== null;
    }


    public hasOldLastCoinCache(): boolean {
        return localStorage.getItem(this.OLD_LAST_COIN_VIEWED_KEY) !== null;
    }


}

