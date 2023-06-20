import { AfterViewInit, ChangeDetectionStrategy, Component, HostListener, Inject, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SessionService } from './services/session.service';
import { HomeComponent } from './components/home/home.component';
import { MobileCheckComponent } from './components/mobile-check/mobile-check.component';
import { ThemeService } from './services/theme.service';
import { ScreenService } from './services/screen.service';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MobileCheckComponent, HomeComponent]
})
export class AppComponent implements OnInit {
  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    this.screenService.documentClickedSource$.next(event);
  }

  @HostListener('document:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    this.screenService.documentKeydownSource$.next(event);

  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    this.screenService.beforeUnload$.next(event);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    this.screenService.windowScrollSource$.next(event);
  }




  constructor(
    @Inject(DOCUMENT) private document: Document,
    private primengConfig: PrimeNGConfig,
    private sessionService: SessionService,
    private themeService: ThemeService,
    private screenService: ScreenService
  ) {

    this.themeService.init(this.sessionService.getPreferences(), this.document);

  }

  ngOnInit() {
    this.primengConfig.ripple = true;
  }


}
