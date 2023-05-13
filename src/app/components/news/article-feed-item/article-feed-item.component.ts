import { CommonModule, DatePipe, NgIf, NgSwitch } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';
import { ArticleService } from '../article.service';
import { SharedModule } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { NEWS_ORIGIN } from 'src/app/constants';

@Component({
  selector: 'app-article-feed-item',
  standalone: true,
  providers: [ DatePipe, ArticleService],
  imports: [CardModule, SharedModule, NgIf, DatePipe, NgSwitch,CommonModule],
  templateUrl: './article-feed-item.component.html',
  styleUrls: ['./article-feed-item.component.scss']
})
export class ArticleFeedItemComponent implements OnInit {
  @Input('content') content: NewsItem;
  @Output('open') open: EventEmitter<CleanedNewsItem> = new EventEmitter();

  cleanedNewsItem: CleanedNewsItem;
  showArticle: boolean = true;

  constructor(
    private articleService: ArticleService,
  ) {
  }

  ngOnInit(): void {
    if (this.content.origin === NEWS_ORIGIN.RSS) {
      this.cleanedNewsItem = this.articleService.extractRssFeedContent(this.content, false);
    } else if (this.content.origin === NEWS_ORIGIN.POLYGON) {
      this.cleanedNewsItem = this.articleService.extractPolygonNewsContent(this.content, false);
    }
  }


  openArticle(event: any) {
    this.open.emit(this.cleanedNewsItem);
  }

  closeArticle(event: any) {
    this.articleService.closeArticle(event.message);
  }

}

