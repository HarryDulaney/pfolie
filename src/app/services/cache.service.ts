import { Injectable } from '@angular/core';
import { BasicCoin } from '../models/coin-gecko';
import { DEFAULT_USER_PREFS, LastCoin, OLD_THEMES, SOHO_DARK_THEME, SOHO_LIGHT_THEME, TimeStamp, UserPreferences } from '../models/appconfig';
import { UtilityService } from './utility.service';
import { CachedPortfolio, CachedWatchList, Portfolio, PortfolioMeta, WatchList } from '../models/portfolio';


@Injectable()
export class CacheService {
    private readonly CACHE_VALID_PERIOD = 86400000; // Milliseconds in one day

    private readonly CACHE_PORTFOILO_KEY = "pFoliePreviousPortfolioWorkspace";
    private readonly CACHE_WATCHLIST_KEY = "pFoliePreviousWatchlistWorkspace";
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
        let prefs = localStorage.getItem(this.USER_PREFS_KEY);
        if (prefs !== null) {
            let userPrefs = JSON.parse(prefs) as UserPreferences;
            if (UtilityService.isValidStoredPreferences(userPrefs)) {
                return userPrefs;
            }

            this.setUserPreferences(DEFAULT_USER_PREFS);
            return DEFAULT_USER_PREFS;

        } else {
            this.setUserPreferences(DEFAULT_USER_PREFS);
            return DEFAULT_USER_PREFS;
        }

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
    hasCachedPortfolio() {
        return localStorage.getItem(this.CACHE_PORTFOILO_KEY) &&
            this.getCachedPortfoilo() !== null &&
            this.getCachedPortfoilo() !== undefined;
    }

    public cachePortfolio(portfolio: Portfolio) {
        const cachePortfolio: CachedPortfolio = { id: portfolio.portfolioId, name: portfolio.portfolioName, timeStamp: Date.now() };
        localStorage.setItem(this.CACHE_PORTFOILO_KEY, JSON.stringify(cachePortfolio));
    }

    public getCachedPortfoilo(): CachedPortfolio {
        return JSON.parse(localStorage.getItem(this.CACHE_PORTFOILO_KEY));
    }

    public removeLastWorkspace() {
        localStorage.removeItem(this.CACHE_PORTFOILO_KEY);
    }


    /* ----------------------------- WatchLists ---------------------------------- */
    hasCachedWatchList() {
        return localStorage.getItem(this.CACHE_WATCHLIST_KEY) &&
            this.getCachedWatchList() !== null &&
            this.getCachedWatchList() !== undefined;
    }

    public cacheWatchList(watchList: WatchList) {
        const cacheWatchList: CachedWatchList = { id: watchList.watchListId, name: watchList.name, timeStamp: Date.now() };
        localStorage.setItem(this.CACHE_WATCHLIST_KEY, JSON.stringify(cacheWatchList));
    }

    public getCachedWatchList(): CachedWatchList {
        return JSON.parse(localStorage.getItem(this.CACHE_WATCHLIST_KEY));
    }

    removeLastWatchList() {
        localStorage.removeItem(this.CACHE_WATCHLIST_KEY);
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

    private convertOldTheme(theme: string): string {
        switch (theme) {
            case OLD_THEMES[0]: return SOHO_DARK_THEME;
            case OLD_THEMES[1]: return SOHO_LIGHT_THEME;
            case OLD_THEMES[2]: return SOHO_DARK_THEME
            case OLD_THEMES[3]: return SOHO_LIGHT_THEME;
        }
        return SOHO_DARK_THEME;
    }


}

