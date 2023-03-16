import { Component, ComponentRef, Injector, Input, NgModule, NgModuleRef, OnInit, ViewChild } from '@angular/core';
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

}


