import { assertPlatform, Component, Type } from "@angular/core";
import { CoinFullInfo } from "./coin-gecko";



export interface PieChartData {
    name: string;
    y: number;
    sliced?: boolean;
    selected?: boolean;
}

export class PortfolioPreferences {
    view: ViewPreferences = { sidebarLocation: 'right', currency: 'usd' };

    constructor(viewPrefs: ViewPreferences, otherPrefs?: any) {
        if (viewPrefs) {
            this.view.sidebarLocation = viewPrefs.sidebarLocation;
        }
    }
}

export interface ViewPreferences {
    sidebarLocation: string;
    currency: string;
}

export class PortfolioData {
    trackedAssets: TrackedAsset[];
    components: UiComponent[];
    ownedAssets: OwnedAsset[];

    constructor(trackedAssets: TrackedAsset[], components: UiComponent[], ownedAssets: OwnedAsset[]) {
        if (trackedAssets.length > 0) {
            this.trackedAssets = trackedAssets.map(tracked => { return { id: tracked.id } as TrackedAsset });
        } else {
            this.trackedAssets = [];
        }

        if (components.length > 0) {
            this.components = Array.from(components);
        } else {
            this.components = [];
        }

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
    portfolioId: number = -1;
    uid: string = '-1';
    portfolioName: string = 'Click To Change Name';
    localization: string = 'en';
    portfolioData: PortfolioData = new PortfolioData([], [], []);
    preferences?: PortfolioPreferences = { view: { sidebarLocation: 'right', currency: 'usd' } as ViewPreferences };

}

export class Transaction {
    transactionId: number;
    assetId: string;
    quantity: number;
    unitPrice: number;
    type: 'buy' | 'sell' | 'trade' | 'swap';
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




