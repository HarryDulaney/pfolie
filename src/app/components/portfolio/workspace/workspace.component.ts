import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkspaceEvent } from 'src/app/models/events';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { AllocationChartComponent } from '../../charts/allocation-chart/allocation-chart.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LineChartComponent } from '../../charts/line-chart/line-chart.component';
import { CoinChartComponent } from '../../charts/coin-chart/coin-chart.component';
import * as Const from '../../../constants';
import { ThemeService } from 'src/app/services/theme.service';
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
  imports: [AllocationChartComponent, CurrencyPipe, CoinChartComponent,CommonModule]
})
export class WorkspaceComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input('calculatedValuesSource') calculatedValuesSource$: Observable<any>;
  @Input('viewSource') viewSource$: Observable<OwnedAssetView[]>;
  @Input() screenSize: string;
  @Input('navExpandProvder') navExpandProvider: Observable<boolean>;

  @ViewChild('allocationChart') allocationChart: AllocationChartComponent;
  @ViewChild('chart') lineChart: CoinChartComponent;

  isNavExpanded: boolean;
  assets: OwnedAssetView[] = [];
  calculatedValues: any = {};
  destroySubject$ = new Subject();
  assetCount = 0;
  workspaceEvent: EventEmitter<WorkspaceEvent> = new EventEmitter();
  allocationChartHeight: string = '20rem';
  mainChartHeight: string = '60vh';
  chartType: string = Const.CHART_TYPE.PRICE; // Default chart type
  isLoading: boolean;
  isShowAllocationChart = true;
  isShowLineChart = false;

  constructor(
    private navService: NavService,
    private cd: ChangeDetectorRef,
    public readonly themeService: ThemeService
  ) { }


  ngAfterViewInit(): void {

    this.navService.navExpandedSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(expandStateChange => {
        this.isNavExpanded = expandStateChange;
        if (this.lineChart && this.lineChart!.chartInstance) {
          this.lineChart.chartInstance.reflow();
          this.lineChart.cd.detectChanges();
          this.cd.markForCheck();
          ""
        }
      });

    this.viewSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        view => {
          this.assets = view;
          this.isLoading = false;
          this.cd.markForCheck();
        }
      );

    this.calculatedValuesSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(
        calculatedValues => {
          this.calculatedValues = calculatedValues;
          this.isLoading = false;
          this.cd.markForCheck();
        }
      );

    this.navExpandProvider.pipe(
      takeUntil(this.destroySubject$))
      .subscribe(
        isExpanded => {
          if (this.isNavExpanded !== isExpanded) {
            this.isNavExpanded = isExpanded;
            if (this.allocationChart &&
              this.allocationChart.chartInstance) {
              this.allocationChart.chartInstance.reflow();
            }
            this.cd.markForCheck();
          }

        }
      );
  }

  ngOnInit(): void {
    this.isLoading = true;
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
