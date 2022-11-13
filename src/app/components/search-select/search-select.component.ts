import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { BasicCoin } from 'src/app/models/coin-gecko';
import { AppEvent } from 'src/app/models/events';
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
  @Output('selected') selected: EventEmitter<string> = new EventEmitter();

  baseCoins: BasicCoin[] = [];
  filteredCoins: BasicCoin[] = [];
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
  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  ngOnInit(): void {
    this.configService.basicCoinsSource$.pipe(takeUntil(this.destroySubject$)).subscribe(coins => {
      if (coins !== null) {
        this.baseCoins = coins;
        this.filteredCoins.push(...this.baseCoins);
      }
    })
  }

  ngAfterViewInit(): void {
    this.searchForm.get('searchField').valueChanges.pipe(takeUntil(this.destroySubject$)).subscribe(word => {
      this.filter(word);
    });

  }


  filter(word: string) {
    if (word && word !== '') {
      this.filteredCoins = this.baseCoins.filter(v => {
        return v.name.toLowerCase().startsWith(word.toLowerCase())
      });
    } else {
      this.filteredCoins = this.baseCoins;
    }
  }

  resetFilter() {
    this.filteredCoins = this.baseCoins;
    this.searchField.setValue('');
  }

  public select(coinId: string) {
    this.resetFilter();
    this.selected.emit(coinId);
  }

}
