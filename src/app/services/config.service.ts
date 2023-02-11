import { Injectable } from "@angular/core";
import { BasicCoin } from "../models/coin-gecko";
import { ApiService } from "./api.service";
import { SessionService } from "./session.service";
import { CacheService } from "./cache.service";
import { PreferencesService, UserPreferences } from "./preferences.service";
import { GlobalStore } from "../store/global/global.store";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(
        private globalStore: GlobalStore,
        private apiService: ApiService,
        private cache: CacheService,
        private sessionService: SessionService,
        private preferencesService: PreferencesService
    ) {
    }


    load(): void {
        if (!this.sessionService.initialized) {
            this.sessionService.init();
        }
        /* Reset LocalStorage so will use new storage keys */
        if (!this.cache.isMigrated() && this.cache.oldCacheExists()) {
            this.cache.clear();
            this.cache.migrate();
        }

        if (!this.cache.isMigrated()) {
            this.cache.migrate();
        }

        if (this.cache.getTimeStampRaw() == null || !this.cache.isCacheValid()) {
            var promise: Promise<BasicCoin[]> = this.apiService.getListCoins().toPromise();
            promise.then(
                (result) => {
                    if (result) {
                        let baseCoins: BasicCoin[] = result;
                        let filteredCoins = [];
                        filteredCoins.push(...baseCoins);
                        this.cache.cacheCoinList(baseCoins);
                        this.globalStore.state$.setState({ basicCoins: baseCoins, filteredCoins: filteredCoins });
                    }

                }).finally(() => {
                    this.cache.setTimeStampCachedCoinList();
                });

        } else {
            let cachedCoins = this.cache.getCachedCoinsList();
            const baseCoins = JSON.parse(cachedCoins);
            let filteredCoins = [];
            filteredCoins.push(...baseCoins);
            this.globalStore.state$.setState({ basicCoins: baseCoins, filteredCoins: filteredCoins });
        }


    }

    filter(word: string) {
        let filterCoins = [];
        let state = this.globalStore.state$.getCurrentValue();
        if (word && word !== '') {
            filterCoins = state.basicCoins.filter(v => {
                return v.name.toLowerCase().startsWith(word.toLowerCase())
            });
        } else {
            filterCoins = state.basicCoins;
        }
        this.globalStore.state$.setState({ filteredCoins: filterCoins });
    }

    resetFilter() {
        let state = this.globalStore.state$.getCurrentValue();
        this.globalStore.state$.setState({ filteredCoins: state.basicCoins });

    }

    getPreferences(): UserPreferences {
        return this.preferencesService.userPreferences;
    }


    getGlobalStore(): GlobalStore {
        return this.globalStore;
    }


}


