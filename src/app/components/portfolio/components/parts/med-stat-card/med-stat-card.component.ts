import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { ComponentService } from '../../../services/component.service';
import { Part } from '../part';
import { SparklineComponent } from '../../../../charts/sparkline/sparkline.component';
import { NgIf } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-med-stat-card',
    templateUrl: './med-stat-card.component.html',
    styleUrls: ['./med-stat-card.component.scss'],
    standalone: true,
    imports: [CardModule, SharedModule, NgIf, SparklineComponent]
})
export class MedStatCardComponent implements OnInit, Part {
  componentId: string = 'md-card-componenet';
  isEditing: boolean = false;
  isInitialized: boolean = false;
  title: string = 'Bitcoin';
  imageSource: string = 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579';
  totalValue: string = '$Current Value';
  costBasis: string = '$Current Value';
  totalGainLoss: string = '$Gain/Loss'


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
