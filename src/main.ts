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
import { ConfigService } from './app/services/config.service';
import { CoinDataService } from './app/services/coin-data.service';
import { CacheService } from './app/services/cache.service';
import { ApiService } from './app/services/api.service';
import { UtilityService } from './app/services/utility.service';
import { ToastService } from './app/services/toast.service';
import { BasicCoinInfoStore } from './app/store/global/basic-coins.store';
import { SessionService } from './app/services/session.service';

if (environment.production) {
  enableProdMode();
}

export function initializeServices(configService: ConfigService) {
  return () => configService.load();
}



bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HighchartsChartModule, BrowserModule, LayoutModule, HttpClientXsrfModule, FormsModule, AppRoutingModule, ReactiveFormsModule, AngularFireModule.initializeApp(environment.firebaseConfig)),
    BasicCoinInfoStore,
    ToastService,
    UtilityService,
    ApiService,
    CacheService,
    CoinDataService,
    ConfigService,
    NavService,
    MessageService,
    SessionService,
    DatePipe,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initializeServices,
      'deps': [ConfigService, CacheService, BasicCoinInfoStore],
      'multi': true,
    },
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
})
  .catch(err => console.error(err));

