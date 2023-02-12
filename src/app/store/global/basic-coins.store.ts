import { Injectable } from "@angular/core";
import { CoinsState } from "src/app/models/basic-coins.state";
import { Store } from "../store";


@Injectable()
export class BasicCoinInfoStore {
    state$: Store<CoinsState> = new Store<CoinsState>({
        basicCoins: [],
        filteredCoins: []
    });
}