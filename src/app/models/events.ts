import { OwnedAsset, OwnedAssetView } from "./portfolio";

export interface AppEvent {
  name?: string;
  event: any;
  metadata?: any;
  rowIndex?: number;
}

export interface PortfolioEvent extends AppEvent {
  view: OwnedAssetView;
}

export interface WorkspaceEvent extends AppEvent {

}

export interface ToolbarEvent extends AppEvent {

}

export interface DashboardEvent extends AppEvent {
}
