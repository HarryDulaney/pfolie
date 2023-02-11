import { BasicCoin } from "./coin-gecko";

export interface GlobalState {
    basicCoins: BasicCoin[];
    filteredCoins: BasicCoin[];
}
