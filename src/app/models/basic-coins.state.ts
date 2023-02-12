import { BasicCoin } from "./coin-gecko";

export interface CoinsState {
    basicCoins: BasicCoin[];
    filteredCoins: BasicCoin[];
}
