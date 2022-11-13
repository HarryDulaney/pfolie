import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ComponentService } from '../../../services/component.service';
import { Part } from '../part';

@Component({
  selector: 'app-sm-stat-card',
  templateUrl: './sm-stat-card.component.html',
  styleUrls: ['./sm-stat-card.component.scss'],
  providers: [DatePipe]
})
export class SmStatCardComponent implements OnInit, Part {
  componentId: string = 'sm-card-componenet';
  isEditing: boolean = false;
  isInitialized: boolean = false;
  title: string = 'Bitcoin';
  imageSource: string = 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579';
  totalValue: string = '$Tot Value';
  totalGains: string = '$Tot Gain/Loss'
  buyDate: Date = new Date();
  quantity: string = 'Quantity';
  style = 'min-width: 260px; min-height: 100px';
  class = '';

  coinFullInfo: CoinFullInfo = null;


  constructor(
    private cd: ChangeDetectorRef,
    private componentService: ComponentService,
  ) {
  }



  ngOnInit(): void {
  }


  selectSourceAsset(coinFullInfo: CoinFullInfo) {

    // this.componenetService persist card snapshot with the asset Id
    this.initialize(coinFullInfo);
  }

  initialize(coinFullInfo: CoinFullInfo) {
    this.coinFullInfo = coinFullInfo;
  }

  editBtnPressed(event) {
    this.isEditing = true;
  }

  completeBtnPressed(event) {
    this.isEditing = false;
  }

}
