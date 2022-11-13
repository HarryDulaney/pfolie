import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoinFullInfo } from 'src/app/models/coin-gecko';
import { UiComponent } from 'src/app/models/portfolio';
import { MedStatCardComponent } from '../components/parts/med-stat-card/med-stat-card.component';
import { SmStatCardComponent } from '../components/parts/sm-stat-card/sm-stat-card.component';
import { PortfolioService } from './portfolio.service';

@Injectable({
  providedIn: 'root'
})
export class ComponentService extends BehaviorSubject<CoinFullInfo[]> {

  trackedAssets: any[] = [];
  filteredAssets: any[] = [];
  private uiComponents: UiComponent[] = [
    new UiComponent(SmStatCardComponent, 'sm-card-component'),
    new UiComponent(MedStatCardComponent, 'md-card-component')
  ];

  constructor(private portfolioService: PortfolioService) {
    super([]);

    this.portfolioService.trackedSource$.subscribe(
      (trackedData) => {
        if (trackedData.length > 0) {
          this.trackedAssets = Array.from(trackedData);
          this.filteredAssets = Array.from(this.trackedAssets);
          super.next(this.filteredAssets);
        }

      }
    )
  }


  filter(text: string) {
    if (text && text !== '') {
      this.filteredAssets = this.trackedAssets.filter(v => {
        return v.name.toLowerCase().startsWith(text.toLowerCase())
      });
    } else {
      this.filteredAssets = this.trackedAssets;
    }
    super.next(this.filteredAssets);
  }

  get components(): UiComponent[] {
    return this.uiComponents;
  }
}
