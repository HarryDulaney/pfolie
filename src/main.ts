import { enableProdMode, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { withInterceptorsFromDi, provideHttpClient, HttpClientXsrfModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { HighchartsChartModule } from 'highcharts-angular';
import { DatePipe, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { NavService } from './app/services/nav.service';
import { CoinDataService } from './app/services/coin-data.service';
import { CacheService } from './app/services/cache.service';
import { ApiService } from './app/services/api.service';
import { UtilityService } from './app/services/utility.service';
import { ToastService } from './app/services/toast.service';
import { BasicCoinInfoStore } from './app/store/global/basic-coins.store';
import { SessionService } from './app/services/session.service';
import { ThemeService } from './app/services/theme.service';
import { StringUtility } from './app/services/string.utility';
import { ArticleService } from './app/components/news/article.service';
import { NewsService } from './app/components/news/news.service';
import { UserService } from './app/services/user.service';
import { PortfolioBuilderService } from './app/components/portfolio/portfolio-builder.service';
import { WatchListService } from './app/services/watchlist.service';
import { PortfolioService } from './app/services/portfolio.service';
import { ScreenService } from './app/services/screen.service';

if (environment.production) {
  enableProdMode();
}


function initializeAppFactory(sessionService: SessionService): () => Promise<void> {
  return () => sessionService.preload();
}




bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      HighchartsChartModule,
      BrowserModule,
      LayoutModule,
      HttpClientXsrfModule,
      FormsModule,
      AppRoutingModule,
      ReactiveFormsModule,
      AngularFireModule.initializeApp(environment.firebaseConfig)),
    BasicCoinInfoStore,
    ToastService,
    UtilityService,
    ApiService,
    NewsService,
    ArticleService,
    CacheService,
    CoinDataService,
    NavService,
    PortfolioService,
    ScreenService,
    ThemeService,
    StringUtility,
    PortfolioBuilderService,
    WatchListService,
    MessageService,
    UserService,
    SessionService,
    DatePipe,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initializeAppFactory,
      'deps': [SessionService, CacheService, BasicCoinInfoStore, ApiService, UserService, PortfolioService, WatchListService],
      'multi': true,
    },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
  .catch(err => console.error(err));

