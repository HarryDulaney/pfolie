import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SparklineComponent } from '../../charts/sparkline/sparkline.component';
import { CoinTableView } from 'src/app/models/coin-gecko';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-trending-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProgressSpinnerModule, SharedModule, NgFor, CardModule, NgIf, SparklineComponent, SkeletonModule],
  templateUrl: './trending-card.component.html',
  styleUrls: ['./trending-card.component.scss']
})
export class TrendingCardComponent {
  @Input() items: CoinTableView[] = [];
  @Input() loading: boolean;
  @Input() title: string;
  @Input() contrastColor: string;
  @Output() onSelect = new EventEmitter<CoinTableView>();

  constructor(public coinDataService: CoinDataService) { }



  onItemSelect(event: any) {
    this.onSelect.emit(event);
  }


}
