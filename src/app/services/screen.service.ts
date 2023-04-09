import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  screenSource$: Observable<string>;
  documentClickedSource$: Subject<any> = new Subject<any>();
  documentKeydownSource$: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
  resizeSource$: Subject<any> = new Subject<any>();

}
