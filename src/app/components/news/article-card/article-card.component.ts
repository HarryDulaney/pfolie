import { CommonModule, DatePipe, NgIf, NgSwitch } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';
import { ArticleService } from '../article.service';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { NEWS_ORIGIN } from 'src/app/constants';

@Component({
  selector: 'article-card',
  styleUrls: ['./article-card.component.scss'],
  templateUrl: './article-card.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [CardModule, SharedModule, NgIf, DatePipe, NgSwitch]
})
export class ArticleCardComponent implements OnInit {
  @Input('content') content: NewsItem;
  @Input('isCarousel') isCarousel: boolean = false;
  @Input() showImagePreview: boolean = false;
  @Output() open: EventEmitter<CleanedNewsItem> = new EventEmitter();

  cleanedNewsItem: CleanedNewsItem;
  showArticle: boolean = false;

  constructor(
    private articleService: ArticleService
  ) {
  }

  ngOnInit(): void {
    if (this.content.origin === NEWS_ORIGIN.RSS) {
      this.cleanedNewsItem = this.articleService.extractRssFeedContent(this.content, this.isCarousel);
    } else if (this.content.origin === NEWS_ORIGIN.POLYGON) {
      this.cleanedNewsItem = this.articleService.extractPolygonNewsContent(this.content, this.isCarousel);
    }
  }


  openArticle(event: any) {
    if (this.isCarousel) {
      this.articleService.navOriginIsHome = true;
    } else {
      this.articleService.navOriginIsHome = false;
    }
    this.open.emit(this.cleanedNewsItem);
  }

  closeArticle(event: any) {
    this.articleService.closeArticle(event.message);
  }

}
