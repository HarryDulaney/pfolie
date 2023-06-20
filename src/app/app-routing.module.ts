import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CoinResourcesComponent } from './components/coin-resources/coin-resources.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewsComponent } from './components/news/news.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TrackingComponent } from './components/portfolio/tracking/tracking.component';
import { authGuard } from './guards/guards';


const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent },
  {
    path: 'portfolio',
    component: PortfolioComponent,
    canActivate: [authGuard],
  },
  {
    path: 'watch-list',
    component: TrackingComponent,
    canActivate: [authGuard],
  },
  { path: 'news', component: NewsComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'tokens/:id', component: CoinResourcesComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}


