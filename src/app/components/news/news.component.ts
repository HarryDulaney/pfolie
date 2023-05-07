import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsItem, CleanedNewsItem, NewsFeed, ApiNewsFeed } from 'src/app/models/news-feed';
import { NewsService } from 'src/app/components/news/news.service';
import { FEED_SOURCES } from '../../constants';
import { ArticleService } from './article.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { ArticleCardComponent } from './article-card/article-card.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { SharedModule } from 'primeng/api';
@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule, NgFor, ChipModule, NgIf, ProgressSpinnerModule, ArticleCardComponent, AsyncPipe]
})
export class NewsComponent implements OnInit, OnDestroy {

  rssFeedItems: NewsItem[];
  filterdRssFeedItems: NewsItem[] = [];
  displayedFeed: BehaviorSubject<NewsItem[]> = new BehaviorSubject<NewsItem[]>([]);


  stockFeedItems: NewsItem[];
  filterdStockFeedItems: NewsItem[] = [];
  displayedStockFeed: BehaviorSubject<NewsItem[]> = new BehaviorSubject<NewsItem[]>([]);
  destorySubject$ = new Subject<boolean>();

  isRssLoading: boolean = false;
  allCategories: string[] = FEED_SOURCES;
  stockCategories: string[] = [];
  rssFilterBy: string = '';
  stockFilterBy: string = '';
  isStockLoading: boolean;

  constructor(public newsService: NewsService,
    public articleService: ArticleService
  ) {
  }


  ngOnInit(): void {
    this.isRssLoading = true;
    this.isStockLoading = true;
    this.rssFeedItems = [];
    this.stockFeedItems = [];

    this.newsService.getRSSFeedItems().then(
      (feeds: NewsFeed[]) => {
        for (let feed of feeds) {
          this.rssFeedItems.push(...feed.items);
        }
      }
    ).finally(() => {
      this.runFilter();
      this.displayedFeed.next(this.filterdRssFeedItems);
      this.isRssLoading = false;
    });


    this.newsService.getAPIFeedItems().then(
      (feed: ApiNewsFeed) => {
        this.stockFeedItems = feed.results;
      }
    ).finally(() => {
      this.runStockFilter();
      this.displayedStockFeed.next(this.filterdStockFeedItems);
      this.isStockLoading = false;
    });
  }

  runFilter() {
    if (this.rssFilterBy && this.rssFilterBy !== '') {
      this.filterdStockFeedItems = this.stockFeedItems.filter(feedItem => {
        return feedItem.source === this.rssFilterBy;
      });
    } else {
      this.filterdRssFeedItems = this.rssFeedItems;
    }
    this.displayedFeed.next(this.filterdRssFeedItems);
  }

  runStockFilter() {
    if (this.stockFilterBy && this.stockFilterBy !== '') {
      this.filterdRssFeedItems = this.rssFeedItems.filter(feedItem => {
        return feedItem.source === this.stockFilterBy;
      });
    } else {
      this.filterdStockFeedItems = this.stockFeedItems;
    }
    this.displayedStockFeed.next(this.filterdStockFeedItems);
  }

  rssNewsSourceSelected(source: string) {
    this.rssFilterBy = source;
    this.runFilter();
    this.displayedFeed.next(this.filterdRssFeedItems);
  }

  stockNewsSourceSelected(source: string) {
    this.stockFilterBy = source;
    this.runStockFilter();
    this.displayedStockFeed.next(this.filterdStockFeedItems);
  }


  openHandler(feedItem: CleanedNewsItem) {
    window.open(feedItem.link, '_blank');
  }

  closeHandler(event: any) {
    this.articleService.next(null);
  }

  selectAllRssSources() {
    this.rssFilterBy = '';
    this.filterdRssFeedItems = this.rssFeedItems;
    this.displayedFeed.next(this.filterdRssFeedItems);
  }

  selectAllStockSources() {
    this.stockFilterBy = '';
    this.filterdStockFeedItems = this.stockFeedItems;
    this.displayedStockFeed.next(this.filterdStockFeedItems);
  }

  getStyleClass(source: string) {
    if (this.rssFilterBy === '') {
      return 'bg-gray-600';
    } else if (this.rssFilterBy === source) {
      return 'bg-blue-300';
    }

    return 'bg-gray-600';

  }

  ngOnDestroy(): void {
    this.destorySubject$.next(true);
    this.destorySubject$.complete();
  }
}
