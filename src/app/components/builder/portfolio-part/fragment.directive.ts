import { Directive, Renderer2, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[fragment]'
})
export class FragmentDirective {

  constructor(
    public viewContainerRef: ViewContainerRef,
    private renderer2: Renderer2
  ) {
   }

}
