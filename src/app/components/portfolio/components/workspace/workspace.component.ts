import { AfterContentChecked, AfterViewInit, Component, ComponentFactory, ComponentRef, ElementRef, EventEmitter, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, ViewRef } from '@angular/core';
import { WorkspaceEvent } from 'src/app/models/events';
import { OwnedAsset, OwnedAssetView, Portfolio, UiComponent } from 'src/app/models/portfolio';
import { ComponentService } from '../../services/component.service';
import { PortfolioService } from '../../services/portfolio.service';
import { AllocationChartComponent } from '../allocation-chart/allocation-chart.component';
import { PartHostDirective } from '../parts-palette/part-host.directive';
import { Part } from '../parts/part';
import { SmStatCardComponent } from '../parts/sm-stat-card/sm-stat-card.component';
import { CurrencyPipe } from '@angular/common';

/**
 * Parent Component for portfolio custom component workspace
 */
@Component({
    selector: 'app-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: ['./workspace.component.scss'],
    providers: [ComponentService],
    standalone: true,
    imports: [AllocationChartComponent, CurrencyPipe]
})
export class WorkspaceComponent {
  @ViewChild(PartHostDirective, { static: true }) partHost!: PartHostDirective;
  @Input() calculatedValues;
  @Input() view: OwnedAssetView[];
  @Input() screenSize: string;
  @Input() isNavExpanded: boolean;

  assetCount = 0;
  components: UiComponent[] = [];
  componentRefs: ComponentRef<Part>[] = [];
  addButtonRef: ViewRef;

  private workspaceEvent: EventEmitter<WorkspaceEvent> = new EventEmitter();
  $workspaceSource = this.workspaceEvent.asObservable();

  constructor(
    private componentService: ComponentService
  ) { }

  addNewPart(componentId: string) {
    let uiComponent = this.componentService.components.find(c => c.componentId === componentId);
    this.components.push(uiComponent);
    let created = this.partHost.viewContainerRef.createComponent<Part>(uiComponent.component);
    created.instance.isEditing = true;
    this.componentRefs.push(created);

  }


  renderParts(components: UiComponent[]) {
    //    let smCard = this.partHost.viewContainerRef.createComponent(SmStatCardComponent);

  }

  getAssetCount(): number {
    if (this.view) {
      return this.view.length;
    }
    return 0;
  }


  handleAddNewComponent() {
    let event: WorkspaceEvent = {
      name: 'New Component',
      event: 'click'
    };

    this.emitEvent(event);
  }


  emitEvent(event: WorkspaceEvent) {
    this.workspaceEvent.emit(event);
  }

}
