import { Injectable } from "@angular/core";
import { ListStore } from "../list-store";
import { BasicCoin } from "src/app/models/coin-gecko";


@Injectable()
export class BasicCoinInfoStore {
    allCoinsStore: ListStore<BasicCoin> = new ListStore<BasicCoin>([]);
}