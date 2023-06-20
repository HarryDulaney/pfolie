import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, EventEmitter, Output, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { NavService } from 'src/app/services/nav.service';
import { SharedModule } from 'primeng/api';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { SessionService } from 'src/app/services/session.service';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { CommonModule } from '@angular/common';
import { OverlayModule } from 'primeng/overlay';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [VirtualScrollerModule, SharedModule, CommonModule, OverlayPanelModule, OverlayModule]
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchPanel') searchPanel: OverlayPanel;

  @Input('scrollHeight')
  set scrollHeight(sHeight: number) {
    let height = (sHeight !== 0 ? sHeight : 460);
    if (this.mobileQuery.matches) {
      height = height - 140;
    }
    this.scrollableHeight = height + 'px';
  };

  @Input('optionsProvider') optionsProvider: Observable<BasicCoin[]>;

  @Output('selected') selected: EventEmitter<string> = new EventEmitter();

  scrollableHeight: string;
  dropdownStyle: string;
  mobileQuery: MediaQueryList;
  mobileQueryListener: () => void;
  selectOptions = [];

  constructor(
    public navService: NavService,
    private cd: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 900px)');
    this.mobileQueryListener = () => this.cd.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }


  ngOnInit(): void {
    this.optionsProvider
      .subscribe((coins: BasicCoin[]) => {
        this.selectOptions = coins;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  select(coinId: string) {
    this.selected.emit(coinId);
  }

  get onShow(): EventEmitter<any> {
    return this.searchPanel.onShow;
  }

  get onSelect(): EventEmitter<any> {
    return this.selected;
  }

  hide() {
    this.searchPanel.hide();
  }

  show(event: Event, target?: any) {
    this.searchPanel.show(event, target);
  }

  toggle(event: Event, target?: any) {
    this.searchPanel.toggle(event, target);
  }

  get overlayVisible(): boolean {
    return this.searchPanel.overlayVisible;
  }

  get overlayHidden(): boolean {
    return !this.searchPanel.overlayVisible;
  }

}
