import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CoinTableView } from 'src/app/models/coin-gecko';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SparklineComponent } from '../../charts/sparkline/sparkline.component';
import { TrendingCardComponent } from '../trending-card/trending-card.component';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-editable-card',
  standalone: true,
  imports: [CommonModule, TrendingCardComponent, ProgressSpinnerModule, SharedModule, NgFor, CardModule, NgIf, SparklineComponent],
  providers: [CoinDataService],
  templateUrl: './editable-card.component.html',
  styleUrls: ['./editable-card.component.scss']
})
export class EditableCardComponent {
  @Input('provider') dataProvider: Observable<any>;
  @Input() title: string;
  @Output() onSelect = new EventEmitter<CoinTableView>();


  constructor(public coinDataService: CoinDataService) { }

  onCardClicked(event) {
    this.onSelect.emit(event);
  }

}
