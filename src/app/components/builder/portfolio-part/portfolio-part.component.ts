import { Component, ComponentRef, Injector, Input, NgModule, NgModuleRef, OnInit, ViewChild } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { AppComponent } from 'src/app/app.component';
import { AppModule } from 'src/app/app.module';
import { CustomComponent } from '../custom/custom.component';
import { FragmentDirective } from './fragment.directive';

@Component({
  selector: 'part',
  templateUrl: './portfolio-part.component.html',
  styleUrls: ['./portfolio-part.component.scss']
})
export class PortfolioPartComponent {
  @ViewChild(FragmentDirective) fragment!: FragmentDirective;
  @Input('info') info: any;

  componentRef: ComponentRef<CustomComponent>;

  initialized: boolean = false;
  private options: {
    ngModuleRef: NgModuleRef<AppModule>
  }

  draggable = {
    // note that data is handled with JSON.stringify/JSON.parse
    // only set simple data or POJO's as methods will be lost 
    data: "myDragData",
    effectAllowed: "all",
    disable: false,
    handle: false
  };

  renderComponent(componentDef: any) {
    this.componentRef = this.fragment.viewContainerRef.createComponent(CustomComponent, this.options);
  }

  onDragStart(event: DragEvent) {

    console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {

    console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {

    console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {

    console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDraggableMoved(event: DragEvent) {

    console.log("draggable moved", JSON.stringify(event, null, 2));
  }

  onDragCanceled(event: DragEvent) {

    console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {

    console.log("dragover", JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent) {

    console.log("dropped", JSON.stringify(event, null, 2));
  }
}


