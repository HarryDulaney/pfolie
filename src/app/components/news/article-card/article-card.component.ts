import { CommonModule, DatePipe, NgIf, NgSwitch } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';
import { ArticleService } from '../article.service';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { NEWS_ORIGIN } from 'src/app/constants';

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styles: [`
  :host ::ng-deep .p-card {
    height: 10rem !important;
    transition: transform .2s;
    text-decoration: none;
  }
  :host ::ng-deep .p-card:hover {
    transform: scale(1.05);
  }
  :host ::ng-deep .p-card .p-card-content{
    padding: 0.1rem;
    textwrap: ellipsis !important;
  }
  a {
    text-decoration: none;
  }
  #article-card button {
    border-color: var(--text-color-secondary) !important;
    border-style: solid !important;
    border-radius: 15px !important;
    border-width: 1px !important;
}

#article-date {
    font-size: 0.7rem;
    color: var(--text-color-secondary);
}

.article-category {
    margin: 0.3rem;
}
.news-card-title {
  color: var(--text-color);
  fontweight: bold;
}

::ng-deep .p-card .p-card-title {
    font-size: 1rem;
    textwrap: ellipsis !important;

}`],
  providers: [DatePipe],
  standalone: true,
  imports: [CardModule, SharedModule, NgIf, DatePipe, NgSwitch]
})
export class ArticleCardComponent implements OnInit {
  @Input('content') content: NewsItem;
  @Input('isCarousel') isCarousel: boolean = false;
  @Input() showImagePreview: boolean = false;
  @Output() open: EventEmitter<CleanedNewsItem> = new EventEmitter();

  feedContent: CleanedNewsItem;
  showArticle: boolean = false;

  constructor(
    private articleService: ArticleService
  ) {
  }

  ngOnInit(): void {
    if (this.content.origin === NEWS_ORIGIN.RSS) {
      this.feedContent = this.articleService.extractRssFeedContent(this.content, this.isCarousel);
    } else if (this.content.origin === NEWS_ORIGIN.POLYGON) {
      this.feedContent = this.articleService.extractPolygonNewsContent(this.content, this.isCarousel);
    }
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
