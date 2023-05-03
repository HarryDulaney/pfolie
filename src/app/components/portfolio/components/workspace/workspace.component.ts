import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnChanges, OnDestroy, OnInit, SimpleChange, ViewChild } from '@angular/core';
import { WorkspaceEvent } from 'src/app/models/events';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { ComponentService } from '../../services/component.service';
import { AllocationChartComponent } from '../allocation-chart/allocation-chart.component';
import { CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NavService } from 'src/app/services/nav.service';

/**
 * Parent Component for portfolio custom component workspace
 */
@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AllocationChartComponent, CurrencyPipe]
})
export class WorkspaceComponent implements OnDestroy, OnInit {
  @Input() calculatedValues;
  @Input() assets: OwnedAssetView[];
  @Input() screenSize: string;
  @Input('navExpandProvder') navExpandProvider: Observable<boolean>;

  @ViewChild('allocationChart') allocationChart: AllocationChartComponent;

  isNavExpanded: boolean;

  destroySubject$ = new Subject();
  assetCount = 0;
  workspaceEvent: EventEmitter<WorkspaceEvent> = new EventEmitter();
  allocationChartHeight: string = '20rem';

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.navExpandProvider.pipe(
      takeUntil(this.destroySubject$))
      .subscribe(
        isExpanded => {
          this.isNavExpanded = isExpanded;
          this.allocationChart.chartInstance.reflow();
          this.cd.detectChanges();
        }
      );

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
