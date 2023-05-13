import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Subject } from 'rxjs';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';
import { ArticleService } from '../article.service';
import { NewsService } from '../news.service';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { SharedModule } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { NEWS_ORIGIN } from 'src/app/constants';
@Component({
  selector: 'app-news-carosel',
  templateUrl: './news-carosel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ProgressSpinnerModule, CarouselModule, SkeletonModule, SharedModule, ArticleCardComponent]
})
export class NewsCaroselComponent implements OnInit, OnDestroy {
  @Input() isMobile: boolean;
  @Input() type: string;

  newsItems: NewsItem[];
  isLoading: boolean;
  responsiveOptions;
  destroySubject$ = new Subject();

  showIndicators: boolean = false;

  constructor(
    public newsService: NewsService,
    public articleService: ArticleService,
    private cd: ChangeDetectorRef) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }


  ngOnInit(): void {
    this.isLoading = true;
    if (this.type === NEWS_ORIGIN.POLYGON) {
      let loadedItems = [];
      this.newsService.getAPIFeedItems(50).then(
        (feed) => {
          if (feed && feed.items) {
            loadedItems = feed.items;
          }
        }
      ).finally(() => {
        this.newsItems = loadedItems;
        this.isLoading = false;
        this.cd.markForCheck();
      });

    } else if (this.type === NEWS_ORIGIN.RSS) {
      let loadedItems = [];
      this.newsService.getRSSFeedItems().then(
        (feeds) => {
          for (let i = 0; i < feeds.length; i++) {
            loadedItems.push(...feeds[i].items);
          }
        }
      ).finally(() => {
        this.newsItems = loadedItems;
        this.isLoading = false;
        this.cd.markForCheck();
      });

    }

  }

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  openHandler(feedItem: CleanedNewsItem) {
    window.open(feedItem.link, '_blank');
  }

  closeHandler(event: any) {
    this.articleService.next(null);
  }
}