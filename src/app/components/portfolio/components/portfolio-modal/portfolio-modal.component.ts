import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Portfolio } from 'src/app/models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { SharedModule } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';

@Component({
    selector: 'app-portfolio-modal',
    templateUrl: './portfolio-modal.component.html',
    styleUrls: ['./portfolio-modal.component.scss'],
    standalone: true,
    imports: [ListboxModule, FormsModule, SharedModule, ButtonModule, RippleModule]
})
export class PortfolioModalComponent implements OnInit {
  selectedPortfolio: Portfolio;
  portfolios: Portfolio[];


  constructor(
    private portfolioService: PortfolioService
  ) { }

  ngOnInit(): void {
    this.portfolioService.portfolio$.subscribe((data) => {
      if (data)
        this.portfolios = [data];
    });
  }

  selectHandler(event) {
    if (this.selectedPortfolio) {
      this.portfolioService.portfolioSelectedEvent.next(this.selectedPortfolio);
    }
  }

}
