import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SessionService } from './services/session.service';
import { HomeComponent } from './components/home/home.component';
import { MobileCheckComponent } from './components/mobile-check/mobile-check.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MobileCheckComponent, HomeComponent]
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(
    private primengConfig: PrimeNGConfig,
    private sessionService: SessionService
  ) { }

  async ngOnInit() {
    this.primengConfig.ripple = true;

  }

  ngAfterViewInit(): void {
    if (!this.sessionService.initialized) {
      this.sessionService.init();
    }
  }

}
