import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { AllocationChartComponent } from '../../charts/allocation-chart/allocation-chart.component';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CoinChartComponent } from '../../charts/coin-chart/coin-chart.component';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AllocationChartComponent, CurrencyPipe, CoinChartComponent, CommonModule]
})
export class WorkspaceComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input() viewSource$: Observable<OwnedAssetView[]>;
  @Input() calculatedValuesSource$: Observable<any>;
  @Input() screenSize: string;
  @Input() navExpandProvider: Observable<boolean>;
  @Input() allocationChartHeight: string;
  @Input() mainChartHeight: string;
  @Input() chartType: string; // Default chart type
  @Input() isShowAllocationChart: boolean;

  @ViewChild('allocationChart') allocationChart: AllocationChartComponent;
  @ViewChild('chart') lineChart: CoinChartComponent;

  isNavExpanded: boolean;
  assets: OwnedAssetView[] = [];
  calculatedValues: any = {};
  destroySubject$ = new Subject();
  assetCount = 0;
  isLoading = true;
  isShowLineChart = false;

  constructor(
    private cd: ChangeDetectorRef,
    public readonly themeService: ThemeService
  ) { }


  ngAfterViewInit(): void {
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

            if (this.lineChart && this.lineChart!.chartInstance) {
              this.lineChart.chartInstance.reflow();
              this.lineChart.cd.detectChanges();
              this.cd.markForCheck();
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


}
