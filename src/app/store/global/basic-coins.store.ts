import { Injectable } from "@angular/core";
import { CoinsState } from "src/app/models/store-model";
import { Store } from "../store";


@Injectable()
export class BasicCoinInfoStore {
    state$: Store<CoinsState> = new Store<CoinsState>({
        basicCoins: [],
        filteredCoins: []
    });
}