import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Coin, CoinFullInfo, CoinTableView } from 'src/app/models/coin-gecko';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SparklineComponent } from '../../charts/sparkline/sparkline.component';
import { TrendingCardComponent } from '../trending-card/trending-card.component';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { Observable, forkJoin, map, of, tap } from 'rxjs';
import { TrackedAsset } from 'src/app/models/portfolio';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-editable-card',
  standalone: true,
  imports: [CommonModule, TrendingCardComponent, ProgressSpinnerModule, SharedModule, NgFor, CardModule, NgIf, SparklineComponent],
  providers: [CoinDataService, UtilityService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editable-card.component.html',
  styleUrls: ['./editable-card.component.scss']
})
export class EditableCardComponent implements OnInit {
  @Input('provider') dataProvider: Observable<CoinFullInfo[]>;
  @Input() title: string;
  @Input('contrastColor') contrastColor: string;
  @Output('onSelect') onSelect = new EventEmitter<CoinTableView>();
  @Output('onAdd') onAdd = new EventEmitter<boolean>();

  items: CoinTableView[] = [];
  isLoading = false;
  sparklineXAxisLabels: string[] = [];
  dataSource$: Observable<CoinTableView[]>;

  constructor(
    public coinDataService: CoinDataService,
    private cd: ChangeDetectorRef,
    private utilityService: UtilityService
  ) { }

  ngOnInit(): void {
    this.sparklineXAxisLabels = this.coinDataService.getSparklineLabels();
    this.dataSource$ = this.dataProvider.pipe(
      map((coins) => {
        return coins.map((coin) => {
          return this.utilityService.mapCoinFullInfoToCoinTableView(coin);
        },
          tap((result) => {
            if (result) {
              this.isLoading = false;
            }
          }));
      }),
    );

  }

  select(event) {
    this.onSelect.emit(event);
  }

  add(event) {
    this.onAdd.emit(true);
  }

}
