import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { ComponentService } from '../../services/component.service';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'select-drop-down',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, AfterViewInit {
  @Output() result: EventEmitter<CoinFullInfo> = new EventEmitter();
  @ViewChild('trackedAssetPanel') trackedAssetPanel: OverlayPanel;
  @Input('hide') hideSelectDropdown: boolean;

  searchField: FormControl = new FormControl('');
  searchForm: FormGroup;

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
    private cd: ChangeDetectorRef,
    media: MediaMatcher,
    public componentService: ComponentService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchField: this.searchField
    });

    this.mobileQuery = media.matchMedia('(max-width: 900px)');
    this._mobileQueryListener = () => cd.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

  }

  ngAfterViewInit(): void {
    this.searchForm.get('searchField').valueChanges.subscribe(word => {
      this.componentService.filter(word);
    });

    this.cd.detectChanges();

  }

  ngOnInit(): void {

  }


  public outputSelected(coinId: string) {
    this.trackedAssetPanel.hide();
    let coinInfo = this.componentService.getValue().find(c => c.id === coinId)
    this.result.emit(coinInfo);
  }

}
