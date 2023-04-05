import { ContentChildren, Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[partHost]',
    standalone: true
})
export class PartHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }

}
