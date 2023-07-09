import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { ThemeService } from 'ng2-charts';
import { Observable, Subject, takeUntil } from 'rxjs';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { AllocationChartComponent } from '../../charts/allocation-chart/allocation-chart.component';
import { CoinChartComponent } from '../../charts/coin-chart/coin-chart.component';
import * as Const from '../../../constants';
import { TransactionService } from '../transaction-table/transaction.service';


@Component({
  selector: 'app-transaction-workspace',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PercentPipe,CommonModule, AllocationChartComponent, CurrencyPipe, CoinChartComponent,],
  templateUrl: './transaction-workspace.component.html',
  styleUrls: ['./transaction-workspace.component.scss'],
})
export class TransactionWorkspaceComponent implements OnDestroy, OnInit, AfterViewInit {
  @Input() transactionService!: TransactionService;
  @Input() screenSize: string;
  @Input() navExpandProvider: Observable<boolean>;
  @Input() mainChartHeight: string;
  @Output() onClick = new EventEmitter<any>();

  @ViewChild('chart') lineChart: CoinChartComponent;

  isNavExpanded: boolean;
  assetView: OwnedAssetView = {
    id: '-1',
    totalQuantity: 0,
    totalCostBasis: 0,
    averageUnitCost: 0,
    allocation: 0,
    transactions: [],
    balance: 0,
  } as OwnedAssetView;
  calculatedValues: any = {};
  destroySubject$ = new Subject();
  isLoading = false;
  isShowLineChart = false;
  chartDataType: string = Const.CHART_TYPE.PRICE;

  constructor(
    private cd: ChangeDetectorRef,
    public readonly themeService: ThemeService
  ) { }


  ngAfterViewInit(): void {
    this.navExpandProvider.pipe(
      takeUntil(this.destroySubject$))
      .subscribe(
        isExpanded => {
          if (this.isNavExpanded !== isExpanded) {
            this.isNavExpanded = isExpanded;
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
    this.transactionService.assetSource$
    .pipe(takeUntil(this.destroySubject$))
    .subscribe(
      view => {
        if (view) {
          this.assetView = view;
          if (!this.assetView.balance) {
            this.assetView.balance = 0;
          }
        }
        this.isLoading = false;
        this.cd.markForCheck();
      }
    );

  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  handleClick(event) {
    this.onClick.emit(event);
  }

  getQuantity(): number {
    if (!this.assetView) {
      return 0;
    }
    return this.assetView.totalQuantity;
  }

  getGainLoss() {
    if (!this.assetView) {
      return 0;
    }

    return (this.assetView.balance - this.assetView.totalCostBasis);
  }


}
