import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { CoinFullInfo, DeveloperData, Links, MarketData, Ticker } from '../../models/coin-gecko'
import { NavService } from 'src/app/services/nav.service';
import { SessionService } from 'src/app/services/session.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChartService } from '../charts/chart.service';
import { UtilityService } from 'src/app/services/utility.service';
import * as Const from '../../constants';
import { takeUntil } from 'rxjs/operators';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { CoinChartComponent } from '../charts/coin-chart/coin-chart.component';
import { NgClass, NgIf, NgFor, AsyncPipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from 'src/app/services/theme.service';
import { WatchListService } from '../../services/watchlist.service';
import { UserService } from 'src/app/services/user.service';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { ListCardComponent } from '../shared/list-card/list-card.component';
import { WatchList, WatchListMeta } from 'src/app/models/portfolio';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-coin-resources',
  templateUrl: './coin-resources.component.html',
  styleUrls: ['./coin-resources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SelectButtonModule,
    OverlayPanelModule,
    TooltipModule,
    MatButtonModule,
    CommonModule,
    NgClass,
    CoinChartComponent,
    NgIf,
    NgFor,
    FormsModule,
    ChipModule,
    CardModule,
    TableModule,
    SharedModule,
    AsyncPipe,
    ListCardComponent
  ]
})
export class CoinResourcesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chart') chart!: CoinChartComponent;
  @ViewChild('selectWatchListPanel') selectWatchListPanel!: OverlayPanel;

  chartType: string = Const.CHART_TYPE.PRICE; // Default chart type
  /* Interactive Chart attribute values */
  chartDataInterval: string = 'daily';
  isLoading: boolean;
  mainChartHeight: string = '60vh';
  mainChartWidth: string = '100%';
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
  currentChartType = 'price';
  chartTypeOptions: any[] = [
    { name: Const.CHART_TYPE.PRICE, value: Const.CHART_TYPE.PRICE },
    { name: Const.CHART_TYPE.VOLUME, value: Const.CHART_TYPE.VOLUME },
  ];

  tickers: BehaviorSubject<Ticker[]> = new BehaviorSubject<Ticker[]>([]);
  destroySubject$: Subject<boolean> = new Subject<boolean>();
  isNavExpanded: boolean;
  hasMainWatchList = false;
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
  watchListOptions: WatchListMeta[] = [];


  constructor(
    public utilityService: UtilityService,
    public navService: NavService,
    public chartService: ChartService,
    private cd: ChangeDetectorRef,
    private toast: ToastService,
    public sessionService: SessionService,
    private userService: UserService,
    private watchListService: WatchListService,
    public readonly themeService: ThemeService,
    private domSanitizer: DomSanitizer) {
  }


  ngOnInit() {
    this.navService
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(coinData => {
        if (!coinData.id) {
          this.navService.refreshToLastCoinViewed();
        } else {
          this.initCoinData(coinData);
          this.initLinks(coinData);
          this.initCategories(coinData);
          this.initDevData(coinData);
          this.initMarketData(coinData);
          this.cd.markForCheck();

        }
        this.cd.markForCheck();

      });

    this.navService.navExpandedSource$
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(expandStateChange => {
        this.isNavExpanded = expandStateChange;
        if (this.chart && this.chart.chartInstance) {
          this.chart.chartInstance.reflow();
          this.chart.cd.detectChanges();
          this.cd.markForCheck();
          ""
        }
      });

    this.watchListService.mainWatchListSource$
      .pipe(takeUntil(this.destroySubject$)
      ).subscribe(
        mainWatchList => {
          if (mainWatchList) {
            this.hasMainWatchList = true;
            if (mainWatchList.watchListData.trackedAssets) {
              let index = mainWatchList.watchListData.trackedAssets.findIndex(x => x.id === this.coinInfo.id);
              this.isTracked = (index !== -1);
            }
            this.cd.markForCheck();
          } else {
            this.hasMainWatchList = false;
          }
        });

    this.userService.basicWatchlistSource$.subscribe(
      wlists => {
        if (wlists) {
          this.watchListOptions = wlists;
          this.cd.markForCheck();
        }
      });

  }

  initCoinData(coinData: CoinFullInfo) {
    this.coinInfo = coinData;
    this.titleContent = coinData.name;
    this.descriptionTabHeader = 'Asset Description';
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


  ngAfterViewInit(): void {
    this.cd.markForCheck();

  }


  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }


  onChartTypeChange(event: any) {
    this.chartType = event.value;
    this.cd.markForCheck();
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


  favoriteButtonClicked(ref: any, event: any) {
    if (!this.sessionService.getCurrentUser()) {
      this.sessionService.showLoginModal = true;
      this.cd.markForCheck();
      return;
    }

    if (!this.hasMainWatchList) {
      this.selectWatchListPanel.show(event);
    } else if (this.isTracked) {
      this.watchListService.removeFromMainWatchList(this.coinInfo.id).then(
        () => {
          console.log('removed');
          this.cd.markForCheck();
        });
    } else {
      this.watchListService.addToMainWatchList(this.coinInfo.id);
      this.cd.markForCheck();

    }
  }

  onWatchListSelected(event: any) {
    this.watchListService.addToWatchList(event, this.coinInfo.id);
    this.cd.markForCheck();
  }

  createWatchList() {
    this.watchListService.createNewWatchlist(this.sessionService.getCurrentUser().uid)
      .subscribe(
        (watchList: WatchList) => {
          const newWatchListMeta = {
            uid: watchList.uid,
            watchListId: watchList.watchListId,
            watchListName: watchList.watchListName,
            isMain: watchList.isMain
          } as WatchListMeta;
          this.userService.addWatchListMeta(newWatchListMeta);
          watchList.isNew = false;
          this.toast.showSuccessToast('Created New Watch-list, named: ' + watchList.watchListName);
          this.cd.markForCheck();
        });
  }

}
