import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CONSTANT as Const } from '../constants'
import { OverlayPanel } from 'primeng/overlaypanel';
import { TooltipOptions } from 'primeng/tooltip';
@Injectable()
export class ScreenService {
  screenSource$: Observable<string>;
  documentClickedSource$: Subject<any> = new Subject<any>();
  documentKeydownSource$: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
  resizeSource$: Subject<any> = new Subject<any>();
  beforeUnload$: Subject<Event> = new Subject();
  windowScrollSource$: Subject<Event> = new Subject();

  private _tooltipOptions: TooltipOptions = {
    autoHide: true,
    life: 3000,
    tooltipEvent: 'hover',
    tooltipPosition: 'right',
  };

  public get tooltipOptions(): TooltipOptions {
    return this._tooltipOptions;
  }


  isMobileScreen(screenSize: string): boolean {
    return screenSize === Const.SCREEN_SIZE.M || screenSize === Const.SCREEN_SIZE.S || screenSize === Const.SCREEN_SIZE.XS;
  }


  public static closeOverlays(overlays: OverlayPanel[]) {
    if (!overlays || overlays.length < 1) return;
    for (let panel of overlays) {
      panel.hide();
    }
  }


}
