import { Injectable } from "@angular/core";
import { GlobalState } from "src/app/models/global";
import { Store } from "../store";


@Injectable()
export class GlobalStore {
    state$: Store<GlobalState> = new Store<GlobalState>({
        basicCoins: [],
        filteredCoins: []
    });
}