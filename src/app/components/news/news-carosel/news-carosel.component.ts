import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FeedItem, ParsedFeedItem, RssFeed } from 'src/app/models/rssfeed';
import { ConfigService } from 'src/app/services/config.service';
import { ArticleService } from '../article.service';
import { NewsService } from '../news.service';

@Component({
  selector: 'app-news-carosel',
  templateUrl: './news-carosel.component.html'
})
export class NewsCaroselComponent implements OnInit, OnDestroy {
  @ViewChild(Carousel) carousel!: Carousel;
  @Input() isMobile: boolean;

  feedItems: FeedItem[];
  isLoading: boolean;
  responsiveOptions;
  destroySubject$ = new Subject();

  showIndicators: boolean = false;

  constructor(
    public newsService: NewsService,
    public articleService: ArticleService,
    private router: Router) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
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