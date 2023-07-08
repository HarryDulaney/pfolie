import { Type } from "@angular/core";
import { CoinFullInfo } from "./coin-gecko";

export interface CachedPortfolio {
    id: number;
    name: string;
    timeStamp: number;
}

export interface CachedWatchList {
    id: number;
    name: string;
    timeStamp: number;
}

export interface PortfolioMeta {
    uid: string;
    portfolioId: number;
    portfolioName: string;
    /* Main Portfolio is displayed on Dashboard/homepage */
    isMain: boolean;
}

export interface WatchListMeta {
    uid: string;
    watchListId: number;
    watchListName: string;
    /* Main Watchlist, is displayed on Dashboard/homepage */
    isMain: boolean;
}

export class PortfolioData {
    ownedAssets: OwnedAsset[];

    constructor(ownedAssets: OwnedAsset[]) {
        if (ownedAssets.length > 0) {
            this.ownedAssets = Array.from(ownedAssets);
        } else {
            this.ownedAssets = [];
        }
    }
}

export interface TrackedAsset {
    id: string;
}

export class WatchList {
    watchListId: number = -1;
    uid: string = '-1';
    watchListName: string = 'New-WatchList';
    watchListData: WatchListData = new WatchListData([]);
    isMain: boolean = false;
    isNew: boolean = false;

    get name(): string {
        return this.watchListName;
    }

    from(uid: string,
        watchListId: number,
        watchListName: string,
        isMain: boolean,
        watchListData: WatchListData,
        isNew: boolean): WatchList {
        this.watchListName = watchListName;
        if (isNew) {
            this.watchListName += `-${watchListId}`;
        }

        this.uid = uid;
        this.isNew = isNew;
        this.watchListId = watchListId;
        this.isMain = isMain;
        this.watchListData = Object.assign({}, watchListData);
        return this;
    }

    fromMeta(watchListMeta: WatchListMeta, isNew: boolean): WatchList {
        if (watchListMeta) {
            this.isNew = isNew;
            this.uid = watchListMeta.uid;
            this.watchListId = watchListMeta.watchListId;
            this.watchListName = watchListMeta.watchListName;
            this.isMain = watchListMeta.isMain;

            if (isNew) {
                this.watchListName += `-${watchListMeta.watchListId}`;
            }

            return this;
        }

        return null;

    }

}

export class WatchListData {
    trackedAssets: TrackedAsset[];

    constructor(trackedAssets: TrackedAsset[]) {
        if (trackedAssets.length > 0) {
            this.trackedAssets = Array.from(trackedAssets);
        } else {
            this.trackedAssets = [];
        }
    }
}

export interface OwnedAsset {
    id: string;
    totalQuantity: number;
    totalCostBasis: number;
    averageUnitCost?: number;
    allocation?: number;
    transactions?: Transaction[];
}

export interface OwnedAssetView extends OwnedAsset {
    balance?: number;
    coinFullInfo?: CoinFullInfo;
}


export class Portfolio {
    uid: string = '-1';
    portfolioId: number = -1;
    portfolioName: string = 'Portfolio';
    isMain: boolean = false;
    portfolioData: PortfolioData = new PortfolioData([]);
    isNew: boolean = false;
    isCreated?: boolean = false;
    isRefreshed?: boolean = false;

    constructor() { }

    from(uid: string, portfolioId: number, portfolioName: string, isMain: boolean, portfolioData: PortfolioData, isNew: boolean): Portfolio {
        this.uid = uid;
        this.portfolioName = portfolioName;
        this.isNew = isNew;
        this.portfolioId = portfolioId;
        this.isMain = isMain;
        this.portfolioData = Object.assign({}, portfolioData);
        return this;
    }

    fromBasic(basicPortfolio?: PortfolioMeta, isNew?: boolean): Portfolio {
        if (basicPortfolio) {
            this.uid = basicPortfolio.uid;
            this.isNew = isNew;
            this.portfolioId = basicPortfolio.portfolioId;
            this.portfolioName = basicPortfolio.portfolioName;
            this.isMain = basicPortfolio.isMain;

            if (isNew) {
                this.portfolioName += `-${basicPortfolio.portfolioId}`;
            }

            return this;
        }
        return null;

    }
}

export type TransactionType = 'buy' | 'sell' | 'trade' | 'swap';

export class Transaction {
    transactionId: number;
    assetId: string;
    quantity: number;
    unitPrice: number;
    transactionDateMillis: number = Date.now();
    date: Date = new Date(this.transactionDateMillis);
    type: TransactionType = 'buy';
}



export interface PieChartData {
    name: string;
    y: number;
    sliced?: boolean;
    selected?: boolean;
}


export class UiComponent {
    componentId: string = '';
    assetIds: string[] = [];
    component: Type<any>;
    data: any = {};

    constructor(component: Type<any>, componentId: string, data?: any) {
        this.component = component;
        this.componentId = componentId;
        if (data) {
            this.data = data;
        }
    }
}

export interface DragBundle {
    label?: string;
    componentId: string;
    iconSrc: string;
    iconHeight: number;
    iconWidth: number;
}



/* -------------------------------- User Created Custom Portfolio Components------------------------------------ */

/**
 * Model describing a custom portfolio component for persisting and 
 * re-rendering
 */
export class CustomPart {
    componentId: number = 0;
    componentName: string = '';
    creatorName: string = '';
    assetIds: string[] = [];
    uiParts: UiParts = new UiParts();
}

/**
 *  Describes the user interface elements of the 
 * custom portfolio component
 */
export class UiParts {
    height: number = 350;
    width: number = 450;
    /** Type of the PortfolioPart */
    partType: ChartPart | AnalysisPart | NewsPart | NotificationPart;

}


export interface ChartPart {
    assetIds: string[];
    chartType: string;
}

export interface AnalysisPart {
    assetIds: string[];
}


export interface NewsPart {
    assetId: string;
}


export interface NotificationPart {
    assetId: string;
}




