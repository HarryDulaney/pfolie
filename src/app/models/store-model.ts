import { BasicCoin, BasicNft } from "./coin-gecko";

export interface CoinsState {
    basicCoins: BasicCoin[];
    filteredCoins: BasicCoin[];
}


export interface NftState {
    list: BasicNft[];
    filtered: BasicNft[];
}