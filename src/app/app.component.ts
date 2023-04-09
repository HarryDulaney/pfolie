import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SessionService } from './services/session.service';
import { HomeComponent } from './components/home/home.component';
import { MobileCheckComponent } from './components/mobile-check/mobile-check.component';
import { ThemeService } from './services/theme.service';
import { ConfigService } from './services/config.service';
import { ScreenService } from './services/screen.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MobileCheckComponent, HomeComponent]
})
export class AppComponent implements OnInit, AfterViewInit {
  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    this.screenService.documentClickedSource$.next(event.target);
  }


  constructor(
    private primengConfig: PrimeNGConfig,
    private sessionService: SessionService,
    private themeService: ThemeService,
    public configService: ConfigService,
    private screenService: ScreenService
  ) {
    this.themeService.init(this.configService.getPreferences());
  }

  ngOnInit() {
    this.primengConfig.ripple = true;

  }

  ngAfterViewInit(): void {
    if (!this.sessionService.initialized) {
      this.sessionService.init();
    }
  }

}
