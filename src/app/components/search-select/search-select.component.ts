import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VirtualScroller, VirtualScrollerModule } from 'primeng/virtualscroller';
import { ScrollerOptions } from 'primeng/scroller';
import { SharedModule } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';


@Component({
    selector: 'app-search-select',
    templateUrl: './search-select.component.html',
    styleUrls: ['./search-select.component.scss'],
    standalone: true,
    imports: [FormsModule, InputTextModule, ReactiveFormsModule, VirtualScrollerModule, SharedModule]
})
export class AssetSearchSelect implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('vs') virtualScroller!: VirtualScroller;
  @Input() maxWidth: string;
  @Input() scrollHeight: string;
  @Input() selectOptions: BasicCoin[] = [];
  @Output('selected') selected: EventEmitter<string> = new EventEmitter();

  filteredAssets: BasicCoin[] = [];
  isMobile: boolean;
  searchForm: UntypedFormGroup;
  searchField: UntypedFormControl = new UntypedFormControl('');
  destroySubject$ = new Subject();

  options: ScrollerOptions = {
    autoSize: true,
    step: 40,
    delay: 1,
    lazy: true,
    showSpacer: true,
  }

  constructor(
    private formBuilder: UntypedFormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      searchField: this.searchField
    });
  }

  ngOnInit(): void {
    this.filteredAssets.push(...this.selectOptions);

  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.options.scrollHeight = this.scrollHeight;
    this.options.items = this.filteredAssets;
    this.searchForm.get('searchField').valueChanges.pipe(takeUntil(this.destroySubject$)).subscribe(word => {
      this.filter(word);
    });


  }


  filter(word: string) {
    if (word && word !== '') {
      this.filteredAssets = this.selectOptions.filter(v => {
        return v.name.toLowerCase().startsWith(word.toLowerCase())
      });
      this.virtualScroller.scrollToIndex(0);
    } else {
      this.filteredAssets = this.selectOptions;
      this.virtualScroller.scrollToIndex(0);

    }
  }

  resetFilter() {
    this.filteredAssets = this.selectOptions;
    this.searchField.setValue('');
  }

  public select(coinId: string) {
    this.resetFilter();
    this.selected.emit(coinId);
  }

}
