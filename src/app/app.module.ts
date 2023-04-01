/* Core Modules */
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';

/* HighCharts */
import { HighchartsChartModule } from 'highcharts-angular';
/* Firebase */
import { AngularFireModule } from '@angular/fire/compat';
/* Custom Modules */
import { MaterialExportModule } from 'src/material.module';
import { PrimeNgExportModule } from 'src/primeng.module';
import { AppRoutingModule } from './app-routing.module';

/* env */
import { environment } from 'src/environments/environment';

/* Components */
import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SearchComponent } from './components/search/search.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NewsComponent } from './components/news/news.component';
import { ArticleCardComponent } from './components/news/article-card/article-card.component';
import { CoinResourcesComponent } from './components/coin-resources/coin-resources.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { FeatureComponent } from './components/news/feature/feature.component';
import { NewsCaroselComponent } from './components/news/news-carosel/news-carosel.component';
import { SearchTrackComponent } from './components/search/search-track/search-track.component';
import { SparklineComponent } from './components/charts/sparkline/sparkline.component';
import { CoinChartComponent } from './components/charts/coin-chart/coin-chart.component'

/* Services */
import { ConfigService } from './services/config.service';
import { SessionService } from './services/session.service';
import { CacheService } from './services/cache.service';
/* PrimeNg Service */
import { MessageService } from 'primeng/api';
import { PortfolioPartComponent } from './components/builder/portfolio-part/portfolio-part.component';
import { PortfolioModalComponent } from './components/portfolio/components/portfolio-modal/portfolio-modal.component';
import { ToolbarComponent } from './components/portfolio/components/toolbar/toolbar.component';
import { FloattingToolbarButtonComponent } from './components/portfolio/components/floatting-toolbar-button/floatting-toolbar-button.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { WorkspaceComponent } from './components/portfolio/components/workspace/workspace.component';
import { FragmentDirective } from './components/builder/portfolio-part/fragment.directive';
import { CustomComponent } from './components/builder/custom/custom.component';
import { PartsPaletteComponent } from './components/portfolio/components/parts-palette/parts-palette.component';
import { MedStatCardComponent } from './components/portfolio/components/parts/med-stat-card/med-stat-card.component';
import { SmStatCardComponent } from './components/portfolio/components/parts/sm-stat-card/sm-stat-card.component';
import { DeltaIcon } from './components/icons/change-icon/delta.component';
import { PartHostDirective } from './components/portfolio/components/parts-palette/part-host.directive';
import { SelectComponent } from './components/portfolio/components/select/select.component';
import { TrackingComponent } from './components/portfolio/components/tracking/tracking.component';
import { AddEditComponent } from './components/portfolio/components/add-edit/add-edit.component';
import { PortfolioTableComponent } from './components/portfolio/components/portfolio-table/portfolio-table.component';
import { PortfolioTableExpandComponent } from './components/portfolio/components/portfolio-table-expand/portfolio-table-expand.component';
import { AllocationChartComponent } from './components/portfolio/components/allocation-chart/allocation-chart.component';
import { AssetSearchSelect } from './components/search-select/search-select.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { MobileCheckComponent } from './components/mobile-check/mobile-check.component';
import { BasicCoinInfoStore } from './store/global/basic-coins.store';
import { ScreenService } from './services/screen.service';
import { ToastService } from './services/toast.service';
import { UtilityService } from './services/utility.service';
import { ApiService } from './services/api.service';
import { CoinDataService } from './services/coin-data.service';
import { NavService } from './services/nav.service';
import { BrowserModule } from '@angular/platform-browser';


export function initializeServices(configService: ConfigService) {
  return () => configService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FooterComponent,
    PageNotFoundComponent,
    CoinResourcesComponent,
    HomeComponent,
    SearchComponent,
    LoginComponent,
    RegisterComponent,
    NewsComponent,
    ArticleCardComponent,
    PortfolioComponent,
    FeatureComponent,
    NewsCaroselComponent,
    SearchTrackComponent,
    SparklineComponent,
    CoinChartComponent,
    PortfolioPartComponent,
    PortfolioModalComponent,
    PieChartComponent,
    ToolbarComponent,
    FloattingToolbarButtonComponent,
    PrivacyPolicyComponent,
    WorkspaceComponent,
    FragmentDirective,
    CustomComponent,
    PartsPaletteComponent,
    MedStatCardComponent,
    SmStatCardComponent,
    DeltaIcon,
    PartHostDirective,
    SelectComponent,
    TrackingComponent,
    AddEditComponent,
    PortfolioTableComponent,
    PortfolioTableExpandComponent,
    AllocationChartComponent,
    AssetSearchSelect,
    MobileCheckComponent
  ],
  imports: [
    MaterialExportModule,
    PrimeNgExportModule,
    HighchartsChartModule,
    BrowserModule,
    LayoutModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [
    BasicCoinInfoStore,
    ToastService,
    UtilityService,
    ApiService,
    CacheService,
    CoinDataService,
    ConfigService,
    NavService,
    MessageService,
    DatePipe,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    {
      'provide': APP_INITIALIZER,
      'useFactory': initializeServices,
      'deps': [ConfigService, CacheService, BasicCoinInfoStore],
      'multi': true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }