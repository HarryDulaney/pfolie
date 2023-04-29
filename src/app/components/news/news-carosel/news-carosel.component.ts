import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeedItem, ParsedFeedItem } from 'src/app/models/rssfeed';
import { ConfigService } from 'src/app/services/config.service';
import { ArticleService } from '../article.service';
import { NewsService } from '../news.service';
import { ArticleCardComponent } from '../article-card/article-card.component';
import { SharedModule } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
@Component({
    selector: 'app-news-carosel',
    templateUrl: './news-carosel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ProgressSpinnerModule, CarouselModule, SkeletonModule, SharedModule, ArticleCardComponent]
})
export class NewsCaroselComponent implements OnInit, OnDestroy {
  @Input() isMobile: boolean;

  feedItems: FeedItem[];
  isLoading: boolean;
  responsiveOptions;
  destroySubject$ = new Subject();

  showIndicators: boolean = false;

  constructor(
    public newsService: NewsService,
    public articleService: ArticleService,
    private cd: ChangeDetectorRef,
    private router: Router) {
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

  ngOnDestroy(): void {
    this.destroySubject$.next(true);
    this.destroySubject$.complete();
  }

  ngOnInit(): void {
    this.isLoading = true;
    let loadedItems = [];
    this.newsService.getAllFeedItems().then(
      (feeds) => {
        for (let i = 0; i < feeds.length; i++) {
          loadedItems.push(...feeds[i].items);
        }
      }
    ).finally(() => {
      this.feedItems = loadedItems;
      this.isLoading = false;
      this.cd.markForCheck();
    });
  }

  openHandler(feedItem: ParsedFeedItem) {
    this.articleService.next(feedItem);
    this.router.navigate(['/', 'feature']);

  }

  closeHandler(event: any) {
    this.articleService.next(null);
  }
}