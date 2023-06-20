import { BasicCoin, BasicNft } from "./coin-gecko";
import { PortfolioMeta, WatchListMeta } from "./portfolio";

export interface CoinsState {
    basicCoins: BasicCoin[];
    filteredCoins: BasicCoin[];
}


export interface NftState {
    list: BasicNft[];
    filtered: BasicNft[];
}