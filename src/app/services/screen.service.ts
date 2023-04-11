import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CONSTANT as Const } from '../constants'
@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  screenSource$: Observable<string>;
  documentClickedSource$: Subject<any> = new Subject<any>();
  documentKeydownSource$: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
  resizeSource$: Subject<any> = new Subject<any>();




  isMobileScreen(screenSize: string): boolean {
    return screenSize === Const.SCREEN_SIZE.M || screenSize === Const.SCREEN_SIZE.S || screenSize === Const.SCREEN_SIZE.XS;
  }

}
