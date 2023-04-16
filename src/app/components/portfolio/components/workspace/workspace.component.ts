import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { WorkspaceEvent } from 'src/app/models/events';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { ComponentService } from '../../services/component.service';
import { AllocationChartComponent } from '../allocation-chart/allocation-chart.component';
import { CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';

/**
 * Parent Component for portfolio custom component workspace
 */
@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  providers: [ComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AllocationChartComponent, CurrencyPipe]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  @Input() calculatedValues;
  @Input() assets: OwnedAssetView[];
  @Input() screenSize: string;
  @Input() isNavExpanded: boolean;

  destroySubject$ = new Subject();

  assetCount = 0;
  workspaceEvent: EventEmitter<WorkspaceEvent> = new EventEmitter();
  allocationChartHeight: string = '20rem';
  constructor() { }

  ngOnInit(): void {
  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  getAssetCount(): number {
    if (this.assets) {
      return this.assets.length;
    }
    return 0;
  }


  handleAddNewComponent() {
    let event: WorkspaceEvent = {
      name: 'New Component',
      event: 'click'
    };

    this.workspaceEvent.emit(event);
  }



}
