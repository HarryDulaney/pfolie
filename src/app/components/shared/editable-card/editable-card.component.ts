import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CoinTableView } from 'src/app/models/coin-gecko';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SparklineComponent } from '../../charts/sparkline/sparkline.component';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { Observable, Subject, finalize, map, takeUntil, tap } from 'rxjs';
import { UtilityService } from 'src/app/services/utility.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-editable-card',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, SharedModule, NgFor, CardModule, NgIf, SparklineComponent],
  providers: [CoinDataService, UtilityService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editable-card.component.html',
  styleUrls: ['./editable-card.component.scss']
})
export class EditableCardComponent implements OnInit, OnDestroy {
  @Input('provider') dataProvider: Observable<any>;
  @Input('dataType') inputDataType: string;
  @Input() title: string;
  @Input('displayAdd') displayAdd: boolean = false;
  @Input('displaySparkline') displaySparkline: boolean = false;

  @Output('onSelect') onSelect = new EventEmitter<CoinTableView>();
  @Output('onAdd') onAdd = new EventEmitter<boolean>();

  destroySubject$ = new Subject<boolean>();

  style = {
    'font-size': '0.8rem !important', 'font-weight': 'bold'
  };
  items: CoinTableView[] = [];
  isLoading = false;
  sparklineXAxisLabels: string[] = [];
  dataSource$: Observable<CoinTableView[]>;

  constructor(
    public coinDataService: CoinDataService,
    private cd: ChangeDetectorRef,
    private themeService: ThemeService,
    private utilityService: UtilityService
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (this.displaySparkline) {
      this.sparklineXAxisLabels = this.coinDataService.getSparklineLabels();
    }

    if (this.inputDataType === 'CoinTableView') {
      this.dataProvider.pipe(
        takeUntil(this.destroySubject$),
      ).subscribe({
        next: (result) => {
          if (result) {
            this.items = result;
            this.isLoading = false;
            this.cd.markForCheck();
          }
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
          this.cd.markForCheck();
        },
        complete: () => {
          this.isLoading = false;
          this.cd.markForCheck();
        }
      }
      );
    } else if (this.inputDataType === 'CoinFullInfo') {
      this.dataProvider.pipe(
        map((coins) => {
          return coins.map((coin) => {
            return this.utilityService.mapCoinFullInfoToCoinTableView(coin);
          });

        })
      ).subscribe({
        next: (result) => {
          if (result) {
            this.items = result;
            this.isLoading = false;
            this.cd.markForCheck();
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();

  }

  select(event) {
    this.onSelect.emit(event);
  }

  add(event) {
    this.onAdd.emit(true);
  }

}
