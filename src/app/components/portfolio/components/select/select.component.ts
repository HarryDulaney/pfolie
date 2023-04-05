import { MediaMatcher } from '@angular/cdk/layout';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { ComponentService } from '../../services/component.service';
import { PortfolioService } from '../../services/portfolio.service';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, AsyncPipe } from '@angular/common';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { SharedModule } from 'primeng/api';

@Component({
    selector: 'select-drop-down',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    standalone: true,
    imports: [OverlayPanelModule, SharedModule, FormsModule, ReactiveFormsModule, VirtualScrollerModule, NgIf, MatButtonModule, AsyncPipe]
})
export class SelectComponent implements OnInit, AfterViewInit {
  @Output() result: EventEmitter<CoinFullInfo> = new EventEmitter();
  @ViewChild('trackedAssetPanel') trackedAssetPanel: OverlayPanel;
  @Input('hide') hideSelectDropdown: boolean;

  searchField: UntypedFormControl = new UntypedFormControl('');
  searchForm: UntypedFormGroup;

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
    private fb: UntypedFormBuilder
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
