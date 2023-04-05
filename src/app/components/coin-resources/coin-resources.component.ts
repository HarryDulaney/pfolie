import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SecurityContext, ViewEncapsulation } from '@angular/core';
import { CoinFullInfo, DeveloperData, Links, MarketData, Ticker } from '../../models/coin-gecko'
import { NavService } from 'src/app/services/nav.service';
import { SessionService } from 'src/app/services/session.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChartService } from '../charts/chart.service';
import { UtilityService } from 'src/app/services/utility.service';
import { PortfolioService } from '../portfolio/services/portfolio.service';
import * as Const from '../../constants';
import { takeUntil } from 'rxjs/operators';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { CoinChartComponent } from '../charts/coin-chart/coin-chart.component';
import { NgClass, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-coin-resources',
    templateUrl: './coin-resources.component.html',
    styleUrls: ['./coin-resources.component.scss'],
    encapsulation: ViewEncapsulation.Emulated,
    standalone: true,
    imports: [TooltipModule, MatButtonModule, NgClass, CoinChartComponent, NgIf, NgFor, ChipModule, CardModule, TableModule, SharedModule, AsyncPipe]
})
export class CoinResourcesComponent implements OnInit, AfterViewInit, OnDestroy {

  chartType: string = Const.CHART_TYPE.PRICE; // Default chart type

  /* Interactive Chart attribute values */
  chartDataInterval: string = 'daily';
  isLoading: boolean;

  isTracked: boolean;

  htmlDescription: SafeHtml;
  titleContent: string;
  description: string;
  coinInfo: CoinFullInfo;
  imageSource: string;
  categories: string[] = [];
  rank: number;
  score: number;
  hashingAlgo: string;
  countryOfOrigin: string;
  symbol: string;
  tooltipOptions = Const.TOOLTIP_OPTIONS;

  descriptionTabHeader: string;

  links: Links;
  homepage: string;
  chatChannel: string;
  subReddit: string;
  githubRepoUrl: string;
  blockChainSite: string;
  officialForum: string;
  telegramChannelId: string;
  twitterScreenName: string;
  facebookUserName: string;

  developerData: DeveloperData;
  forks: number;
  subscribers: number;
  stars: number;
  totalIssues: number;
  closedIssues: number;
  prsMerged: number;
  prsContributors: number;
  commitCount4Weeks: number;
  commitHistoryDataSeries: number[];

  marketData: MarketData;
  totalSupply: number;
  maxSupply: undefined;
  circulatingSupply: number;
  currentPrice: string;

  tickers: BehaviorSubject<Ticker[]> = new BehaviorSubject<Ticker[]>([]);
  destroySubject$: Subject<boolean> = new Subject<boolean>();

  columnDefs = [
    { header: "TimeStamp", field: 'timestamp' },
    { header: "Market", field: 'market' },
    { header: "Price", field: 'price' },
    { header: "Pair", field: 'pair' },
    { header: "Spread", field: 'bid_ask_spread_percentage' },
    { header: "Volume", field: 'converted_volume' },
    { header: "Link", field: 'trade_url' },
  ];
  maximizeChart = false;



  constructor(
    public utilityService: UtilityService,
    public navService: NavService,
    public chartService: ChartService,
    private changeDetectorRef: ChangeDetectorRef,
    private portfolioService: PortfolioService,
    public sessionService: SessionService,
    private domSanitizer: DomSanitizer) {
  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  ngAfterViewInit(): void {
    this.changeDetectorRef.detectChanges();

  }

  ngOnInit() {
    this.navService.pipe(takeUntil(this.destroySubject$)).subscribe(coinData => {
      if (!coinData.id) {
        this.navService.refreshToLastCoinViewed();
      } else {
        this.initCoinData(coinData);
        this.initLinks(coinData);
        this.initCategories(coinData);
        this.initDevData(coinData);
        this.initMarketData(coinData);
      }
    });

    this.portfolioService.portfolio$.pipe(takeUntil(this.destroySubject$)).subscribe(
      portfolio => {
        if (portfolio) {
          let index = portfolio.portfolioData.trackedAssets.findIndex(x => x.id === this.coinInfo.id);
          this.isTracked = (index !== -1);
        }

      }
    )
  }

  initCoinData(coinData: CoinFullInfo) {
    this.coinInfo = coinData;
    this.titleContent = coinData.name;
    this.descriptionTabHeader = 'What is ' + this.titleContent + ' ?';
    this.imageSource = coinData.image.large ? coinData.image.large : coinData.image.small;
    this.description = coinData.description['en'];
    this.htmlDescription = this.cleanDescription(this.description);
    this.rank = coinData.coingecko_rank;
    this.score = coinData.coingecko_score;
    this.symbol = coinData.symbol;
  }

  initLinks(coinData: CoinFullInfo) {
    this.links = coinData.links;
    this.homepage = coinData.links.homepage[0] ? coinData.links.homepage[0] : undefined;
    this.chatChannel = (coinData.links.chat_url && coinData.links.chat_url[0]) ? coinData.links.chat_url[0] : undefined;
    this.subReddit = (coinData.links.subreddit_url && coinData.links.subreddit_url) ? coinData.links.subreddit_url : undefined;
    this.githubRepoUrl = (coinData.links.repos_url.github && coinData.links.repos_url.github[0]) ? coinData.links.repos_url.github[0] : undefined;
    this.blockChainSite = (coinData.links.blockchain_site && coinData.links.blockchain_site[0]) ? coinData.links.blockchain_site[0] : undefined;
    this.officialForum = (coinData.links.official_forum_url && coinData.links.official_forum_url[0]) ? coinData.links.official_forum_url[0] : undefined;
    this.facebookUserName = coinData.links.facebook_username ? coinData.links.facebook_username : undefined;
    this.twitterScreenName = coinData.links.twitter_screen_name ? coinData.links.twitter_screen_name : undefined;
    this.telegramChannelId = coinData.links.telegram_channel_identifier ? coinData.links.telegram_channel_identifier : undefined;

  }

  initCategories(coinData: CoinFullInfo) {
    if (coinData.categories.length > 0) {
      this.categories = coinData.categories;
    } else {
      this.categories = undefined;
    }
  }

  initDevData(coinData: CoinFullInfo) {
    this.hashingAlgo = coinData.hashing_algorithm ? coinData.hashing_algorithm : undefined;
    this.developerData = coinData.developer_data;
    this.forks = this.developerData.forks;
    this.subscribers = this.developerData.subscribers;
    this.stars = this.developerData.stars;
    this.totalIssues = this.developerData.total_issues;
    this.closedIssues = this.developerData.closed_issues;
    this.prsMerged = this.developerData.pull_requests_merged;
    this.prsContributors = this.developerData.pull_request_contributors;
    this.commitCount4Weeks = this.developerData.commit_count_4_weeks;
    this.commitHistoryDataSeries = coinData.developer_data.last_4_weeks_commit_activity_series;
    this.countryOfOrigin = coinData.country_origin ? coinData.country_origin : undefined;
  }

  initMarketData(coinFullInfo: CoinFullInfo) {
    this.marketData = coinFullInfo.market_data;
    this.currentPrice = this.utilityService.format(coinFullInfo.market_data.current_price['usd'], 'USD');
    let tickerViews = this.getTickerViews(coinFullInfo.tickers);
    this.tickers.next(tickerViews);
  }

  cleanDescription(description: string): SafeHtml {
    let d = '<p>' + description + '</p>';
    return this.domSanitizer.sanitize(SecurityContext.NONE, d);

  }

  getTickerViews(tickers: Ticker[]): any[] {
    let tickerViews = [];
    for (var i = 0; i < tickers.length; i++) {
      tickerViews.push(this.getTickerView(tickers[i]));
    }
    return tickerViews;
  }

  getTickerView(ticker: Ticker): any {
    let view = {
      timestamp: this.utilityService.format(ticker.timestamp, 'dt'),
      market: ticker.market.name,
      price: this.utilityService.format(ticker.last, 'USD'),
      pair: ticker.base + '/' + ticker.target,
      volume: ticker.volume,
      bid_ask_spread_percentage: (ticker.bid_ask_spread_percentage) + '%',
      converted_volume: ticker.converted_volume['usd'],
      trade_url: ticker.trade_url
    };
    return view;
  }

  favoriteButtonTooltip(): string {
    if (this.isTracked) {
      return 'Remove from Watchlist.';
    }
    return 'Add to Watchlist';
  }


  favoriteButtonClicked(ref: any) {
    if (!this.sessionService.getCurrentUser()) {
      this.sessionService.showLoginModal = true;
      return;
    }

    if (this.isTracked) {
      this.portfolioService.removeTrackedFromCurrentUserPortfolio(this.coinInfo.id).then(
        () => console.log('removed'));
    } else {
      this.portfolioService.addTrackedToCurrentUserPortfolio(this.coinInfo.id);
    }
  }
}
