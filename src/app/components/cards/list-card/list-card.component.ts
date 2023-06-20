import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CoinDataService } from 'src/app/services/coin-data.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, SharedModule, NgFor, CardModule, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-card.component.html',
  styleUrls: ['./list-card.component.scss']
})
export class ListCardComponent<T> implements OnDestroy {
  @Input('items') items: T[] = [];
  @Input('nameKey') nameKey: string;
  @Input('title') title: string;
  @Input('emptyMessage') emptyMessage: string;

  @Output('onSelect') onSelect = new EventEmitter<T>();
  @Output('emptyAction') emptyAction = new EventEmitter<any>();

  destroySubject$ = new Subject<boolean>();

  style = {
    'font-size': '0.8rem !important', 'font-weight': 'bold'
  };
  isLoading = false;

  constructor(
    public coinDataService: CoinDataService,
    private cd: ChangeDetectorRef
  ) {
  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();

  }

  select(event) {
    this.onSelect.emit(event);
  }

  handleEmptyAction() {
    this.emptyAction.emit();
  }

}
