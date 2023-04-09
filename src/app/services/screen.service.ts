import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {
  screenSource$: Observable<string>;
  documentClickedSource$: Subject<HTMLElement> = new Subject<HTMLElement>()

}
