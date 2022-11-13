import { ContentChildren, Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[partHost]'
})
export class PartHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }

}
