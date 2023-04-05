import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FeedItem, ParsedFeedItem } from 'src/app/models/rssfeed';
import { ArticleService } from '../article.service';

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styles: [`
  :host ::ng-deep .p-card {
    height:fit-content;
    width:auto;
    transition: transform .2s;
    text-decoration: none;
  }
  :host ::ng-deep .p-card:hover {
    transform: scale(1.05);
  }
  a {
    text-decoration: none;
  }
  #article-card button {
    border-color: var(--blue-700) !important;
    border-style: solid !important;
    border-radius: 15px !important;
    border-width: 1px !important;
}

#article-date {
    font-size: 0.7rem;
}

.article-category {
    margin: 0.3rem;
}

::ng-deep .p-card .p-card-title {
    font-size: 1rem;

}`],
  providers: [DatePipe]
})
export class ArticleCardComponent implements OnInit {
  @Input('rss-item') rssItem: FeedItem;
  @Input('isCarousel') isCarousel: boolean = false;
  @Output() open: EventEmitter<ParsedFeedItem> = new EventEmitter();

  feedContent: ParsedFeedItem;
  showArticle: boolean = false;

  constructor(
    private articleService: ArticleService
  ) {
  }

  ngOnInit(): void {
    this.feedContent = this.articleService.getFeedContent(this.rssItem, this.isCarousel);
  }


  openArticle(event: any) {
    if (this.isCarousel) {
      this.articleService.navOriginIsHome = true;
    } else {
      this.articleService.navOriginIsHome = false;
    }
    this.open.emit(this.feedContent);
  }

  closeArticle(event: any) {
    this.articleService.closeArticle(event.message);
  }

}
