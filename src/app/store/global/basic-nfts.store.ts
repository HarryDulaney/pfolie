import { Injectable } from "@angular/core";
import { CoinsState, NftState } from "src/app/models/store-model";
import { Store, SetOptions } from "../store";


@Injectable()
export class BasicNftStore {
    state$: Store<NftState> = new Store<NftState>({
        list: [],
        filtered: []
    });



    initialize() {
        this.state$.set(new SetOptions('list', []));
        this.state$.set(new SetOptions('filtered', []));
    }
}