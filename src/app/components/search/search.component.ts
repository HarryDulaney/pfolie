import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { ConfigService } from 'src/app/services/config.service';
import { NavService } from 'src/app/services/nav.service';
import { SharedModule } from 'primeng/api';
import { VirtualScrollerModule } from 'primeng/virtualscroller';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true,
    imports: [VirtualScrollerModule, SharedModule]
})
export class SearchComponent implements OnDestroy {

  @Input('scrollHeight')
  set scrollHeight(sHeight: number) {
    let height = (sHeight !== 0 ? sHeight : 460);
    if (this.mobileQuery.matches) {
      height = height - 140;
    }
    this.scrollableHeight = height + 'px';
  };

  @Input('ddStyleClass')
  set dropDownStyle(ddStyleClass: string) {
    this.dropdownStyle = 'scroll-item';
    if (ddStyleClass) {
      this.dropdownStyle = ddStyleClass;
    }
  }

  @Input() selectOptions: BasicCoin[] = [];

  @Output('selected')
  selected: EventEmitter<string> = new EventEmitter();

  scrollableHeight: string;
  dropdownStyle: string;
  onSelect: EventEmitter<string> = new EventEmitter();
  mobileQuery: MediaQueryList;
  public _mobileQueryListener: () => void;


  constructor(
    public coinService: ConfigService,
    public navService: NavService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 900px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

  }
  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  public select(coinId: string) {
    this.onSelect.emit(coinId);
    this.selected.emit(coinId);
  }

}
