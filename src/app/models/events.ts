export interface AppEvent {
  name?: string;
  event: any;
  metadata?: any;
  rowIndex?:number;
}


export interface WorkspaceEvent extends AppEvent {

}

export interface ToolbarEvent extends AppEvent {

}
