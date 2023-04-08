import { Injectable } from "@angular/core";
import { BasicCoin } from "../models/coin-gecko";
import { ApiService } from "./api.service";
import { CacheService } from "./cache.service";
import { BasicCoinInfoStore } from "../store/global/basic-coins.store";
import { firstValueFrom } from "rxjs";
import { UserPreferences } from "../models/appconfig";

@Injectable()
export class ConfigService {

    constructor(
        private basicCoinInfoStore: BasicCoinInfoStore,
        private apiService: ApiService,
        private cache: CacheService
    ) {
    }


    load(): void {
        if (this.cache.getTimeStampRaw() == null || !this.cache.isCacheValid()) {
            firstValueFrom(this.apiService.getListCoins())
                .then(
                    (result) => {
                        if (result) {
                            let baseCoins: BasicCoin[] = result;
                            let filteredCoins = [];
                            filteredCoins.push(...baseCoins);
                            this.cache.cacheCoinList(baseCoins);
                            this.basicCoinInfoStore.state$.setState({ basicCoins: baseCoins, filteredCoins: filteredCoins });
                        }

                    }).finally(() => {
                        this.cache.setTimeStampCachedCoinList();
                    });

        } else {
            let cachedCoins = this.cache.getCachedCoinsList();
            const baseCoins = JSON.parse(cachedCoins);
            let filteredCoins = [];
            filteredCoins.push(...baseCoins);
            this.basicCoinInfoStore.state$.setState({ basicCoins: baseCoins, filteredCoins: filteredCoins });
        }


    }

    filter(word: string) {
        let filterCoins = [];
        let state = this.basicCoinInfoStore.state$.getCurrentValue();
        if (word && word !== '') {
            filterCoins = state.basicCoins.filter(v => {
                return v.name.toLowerCase().startsWith(word.toLowerCase())
            });
        } else {
            filterCoins = state.basicCoins;
        }
        this.basicCoinInfoStore.state$.setState({ filteredCoins: filterCoins });
    }

    resetFilter() {
        let state = this.basicCoinInfoStore.state$.getCurrentValue();
        this.basicCoinInfoStore.state$.setState({ filteredCoins: state.basicCoins });

    }

    getPreferences(): UserPreferences {
        return this.cache.getUserPreferences();
    }

    setPreferences(preferences: UserPreferences) {
        this.cache.setUserPreferences(preferences);
    }


    getGlobalStore(): BasicCoinInfoStore {
        return this.basicCoinInfoStore;
    }

}


