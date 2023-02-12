import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class NavMenuService {
  navMenuOpenState$: Subject<boolean> = new Subject();

}
