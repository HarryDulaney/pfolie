import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class AssetSearchSelect implements OnInit, AfterViewInit, OnDestroy {
  @Input() scrollHeight: string;
  @Input() selectOptions: BasicCoin[] = [];
  @Output('selected') selected: EventEmitter<string> = new EventEmitter();

  filteredAssets: BasicCoin[] = [];
  isMobile: boolean;
  vScrollStyle = { 'text-align': 'center', 'width': '100%' };
  searchForm: FormGroup;
  searchField: FormControl = new FormControl('');
  destroySubject$ = new Subject();


  constructor(
    public configService: ConfigService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      searchField: this.searchField
    });
  }

  ngOnInit(): void {
    this.filteredAssets.push(...this.selectOptions);

  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  ngAfterViewInit(): void {
    this.searchForm.get('searchField').valueChanges.pipe(takeUntil(this.destroySubject$)).subscribe(word => {
      this.filter(word);
    });

  }


  filter(word: string) {
    if (word && word !== '') {
      this.filteredAssets = this.selectOptions.filter(v => {
        return v.name.toLowerCase().startsWith(word.toLowerCase())
      });
    } else {
      this.filteredAssets = this.selectOptions;
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
