import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NewsItem, CleanedNewsItem, NewsFeed } from 'src/app/models/news-feed';
import { NewsService } from 'src/app/components/news/news.service';
import { NEWS_CATEGORY, NEWS_CATEGORY_LIST } from '../../constants';
import { ArticleService } from './article.service';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { NgFor, NgIf, AsyncPipe, CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { ThemeService } from 'src/app/services/theme.service';
import { ArticleFeedItemComponent } from './article-feed-item/article-feed-item.component';
import { NewsCategoryComponent } from './news-category/news-category.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule,SharedModule, NgFor, ChipModule, NgIf, ProgressSpinnerModule, AsyncPipe, ArticleFeedItemComponent, NewsCategoryComponent]
})
export class NewsComponent implements OnInit, OnDestroy {
  title: string = NEWS_CATEGORY.ALL;
  feedItems: NewsItem[] = [];
  feedView: NewsItem[] = [];
  filteredFeedItems: NewsItem[] = [];
  displayedFeed: BehaviorSubject<NewsItem[]> = new BehaviorSubject<NewsItem[]>([]);

  destorySubject$ = new Subject<boolean>();
  activeCategory: string = NEWS_CATEGORY.ALL;
  isLoading: boolean = false;
  allCategories: string[] = NEWS_CATEGORY_LIST;
  filterBy: string = '';

  constructor(public newsService: NewsService,
    public articleService: ArticleService,
    private themeService: ThemeService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.displayedFeed.pipe(
      takeUntil(this.destorySubject$),
    ).subscribe((feedItems: NewsItem[]) => {
      if (feedItems) {
      this.feedView = feedItems;
      this.isLoading = false;
      this.cd.markForCheck();
      }
    });

    this.isLoading = true;
    this.newsService.getAllFeedItems(100).then(
      (feeds: NewsFeed[]) => {
        this.feedItems = [];
        feeds.forEach((feed: NewsFeed) => {
          if (this.newsService.isFeedValid(feed)) {
            this.feedItems.push(...feed.items);
          }
        });

      }
    ).finally(() => {
      this.applyFilter();
    });


  }


  applyFilter() {
    if (this.filterBy && this.filterBy !== '') {
      this.filteredFeedItems = this.feedItems.filter(feedItem => {
        return feedItem.source === this.filterBy;
      });
    } else {
      this.filteredFeedItems = this.feedItems;
    }
    this.displayedFeed.next(this.filteredFeedItems);
  }

  selectHandler(category: string) {
    this.title = category;
    if (category === NEWS_CATEGORY.ALL) {
      this.filterBy = '';
    } else {
      this.filterBy = category;
    }
    this.activeCategory = category;
    this.applyFilter();
    this.displayedFeed.next(this.filteredFeedItems);
  }

  openHandler(feedItem: CleanedNewsItem) {
    window.open(feedItem.link, '_blank');
  }

  closeHandler(event: any) {
    this.articleService.next(null);
  }

  selectAllSources() {
    this.title = NEWS_CATEGORY.ALL;
    this.filterBy = '';
    this.filteredFeedItems = this.feedItems;
    this.displayedFeed.next(this.filteredFeedItems);
  }

  ngOnDestroy(): void {
    this.feedItems = [];
    this.destorySubject$.next(true);
    this.destorySubject$.complete();
  }
}
