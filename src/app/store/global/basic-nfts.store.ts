import { Injectable } from "@angular/core";
import { CoinsState, NftState } from "src/app/models/store-model";
import { Store, UpdateOptions } from "../store";


@Injectable()
export class BasicNftStore {
    state$: Store<NftState> = new Store<NftState>({
        list: [],
        filtered: []
    });



    initialize() {
        this.state$.update(new UpdateOptions('list', []));
        this.state$.update(new UpdateOptions('filtered', []));
    }
}