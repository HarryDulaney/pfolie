import { AfterViewInit, Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    private primengConfig: PrimeNGConfig,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }

  ngAfterViewInit(): void {
    if (!this.sessionService.initialized) {
      this.sessionService.init();
    }
  }

}
