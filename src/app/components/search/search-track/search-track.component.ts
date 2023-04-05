import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, Input, Output, EventEmitter, Optional, OnDestroy } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { AsyncPipe } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { VirtualScrollerModule } from 'primeng/virtualscroller';

@Component({
    selector: 'app-search-track',
    templateUrl: './search-track.component.html',
    styleUrls: ['./search-track.component.scss'],
    standalone: true,
    imports: [VirtualScrollerModule, SharedModule, AsyncPipe]
})
export class SearchTrackComponent implements OnDestroy {
  @Output() result: EventEmitter<string> = new EventEmitter();

  public scrollHeight = () => {
    if (this.mobileQuery.matches) {
      return '270px';
    } else {
      return '310px';
    }
  };

  mobileQuery: MediaQueryList;
  public _mobileQueryListener: () => void;


  constructor(
    public coinService: ConfigService,
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


  public outputSelected(coinId: string) {
    this.result.emit(coinId);
  }

}
