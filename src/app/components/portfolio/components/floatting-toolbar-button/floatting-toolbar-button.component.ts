import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FloatingButtonService } from './floating-button.service';
import * as Constants from '../../../../constants';


/**
 * Example usage: 
 * <app-float-toolbar-button [class]="snav.opened ?'float-button-right':'float-button'"></app-float-toolbar-button>
 * 
 * css:
 * .float-button {
 *  position: fixed; 
 *  top: 5rem;
 *  left: 3rem;
 *  z-index: 999999 !important;
 * }  
 * 
 * .float-button-right {
 *  position: fixed;
 *  top: 5rem;
 *  left: calc(3rem + 200px);
 *  z-index: 999999 !important;
 * }
 */
@Component({
  selector: 'app-float-toolbar-button',
  templateUrl: './floatting-toolbar-button.component.html',
  styleUrls: ['./floatting-toolbar-button.component.scss']
})
export class FloattingToolbarButtonComponent implements OnInit {
  hidden: Observable<boolean>;

  constructor(public floatingButtonService: FloatingButtonService) {
    this.hidden = floatingButtonService.asObservable().pipe(
      map(res => {
        if (res === Constants.HIDE) {
          return true;
        }

        return false;

      })
    )
  }

  ngOnInit(): void {
  }

  clicked(event) {
    this.floatingButtonService.clicked();
  }
}
