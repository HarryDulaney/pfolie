import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkspaceEvent } from 'src/app/models/events';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { AllocationChartComponent } from '../../charts/allocation-chart/allocation-chart.component';
import { CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';

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
export class WorkspaceComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input('calculatedValuesSource') calculatedValuesSource$: Observable<any>;
  @Input('viewSource') viewSource$: Observable<OwnedAssetView[]>;
  @Input() screenSize: string;
  @Input('navExpandProvder') navExpandProvider: Observable<boolean>;

  @ViewChild('allocationChart') allocationChart: AllocationChartComponent;

  isNavExpanded: boolean;
  assets: OwnedAssetView[] = [];
  calculatedValues: any = {};
  destroySubject$ = new Subject();
  assetCount = 0;
  workspaceEvent: EventEmitter<WorkspaceEvent> = new EventEmitter();
  allocationChartHeight: string = '20rem';

  constructor(private cd: ChangeDetectorRef) { }


  ngAfterViewInit(): void {
    this.viewSource$
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(
      view => {
        this.assets = view;
        this.cd.markForCheck();
      }
    );

    this.calculatedValuesSource$
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(
      calculatedValues => {
        this.calculatedValues = calculatedValues;
        this.cd.markForCheck();
      }
    );

    this.navExpandProvider.pipe(
      takeUntil(this.destroySubject$))
      .subscribe(
        isExpanded => {
          this.isNavExpanded = isExpanded;
          if (this.isNavExpanded && this.allocationChart.chartInstance) {
            this.allocationChart.chartInstance.reflow();
            this.cd.markForCheck();
          }

        }
      );
  }

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
