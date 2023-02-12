import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ScreenService {
  screenSource$: Observable<string>;

}
