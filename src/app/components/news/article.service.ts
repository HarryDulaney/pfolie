import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';

@Injectable()
export class ArticleService extends BehaviorSubject<CleanedNewsItem> {
    navOriginIsHome: boolean;

    constructor() {
        super({} as CleanedNewsItem);
    }

    parseImageUrl(media: any, enclosures: any): string {
        let m = media;
        let e = enclosures;

        if (m && m['thumbnail']) {
            let thumbnail = m['thumbnail'];
            if (thumbnail['url']) {
                return thumbnail['url'];
            }
        }

        for (var i = 0; i < e.length; i++) {
            if (e[i]) {
                if (e[i]['url']) {
                    let url = e[i]['url'];
                    let type = e[i]['type'] || 'no-type';
                    if (url.length > 10 && type.startsWith('image')) {
                        return url;
                    }
                }
            }
        }

        return '';
    }

    openArticle(content: CleanedNewsItem) {
        super.next(content);
    }

    closeArticle(result: string) {
        super.next(null);
    }

    public extractPolygonNewsContent(raw: NewsItem, isCarouselNews: boolean): CleanedNewsItem {
        let feedContent = new CleanedNewsItem();
        feedContent.featureImageUrl = raw['image_url'];
        feedContent.title = raw['title'];
        feedContent.author = raw['author'];
        feedContent.link = raw['article_url'];
        feedContent.subTitle = "By: " + raw.author;
        feedContent.publishedDate = new Date(raw['published_utc']);
        feedContent.source = raw['publisher']['name'];
        feedContent.description = raw['description'];
        feedContent.tickers = raw['tickers'];

        if (raw.keywords instanceof Array) {
            for (let i = 0; i < 2 && i < raw.keywords.length; i++) {
                feedContent.categories.push(raw.keywords[i]);
            }
        } else {
            feedContent.categories[0] = '';
        }

        return feedContent;

    }

    public extractRssFeedContent(rssItem: NewsItem, isCarouselNews: boolean): CleanedNewsItem {
        let feedContent = new CleanedNewsItem();
        feedContent.media = rssItem['media'];
        feedContent.enclosures = rssItem['enclosures'];
        feedContent.featureImageUrl = this.parseImageUrl(feedContent.media, feedContent.enclosures);


        if (rssItem.category instanceof Array) {
            if (isCarouselNews) {
                for (let i = 0; i < 2 && i < rssItem.category.length; i++) {
                    feedContent.categories.push(rssItem.category[i]);
                }
            } else {
                feedContent.categories.push(...rssItem.category);
            }

        } else {
            feedContent.categories[0] = rssItem.category.toString() || '';
        }

        feedContent.title = rssItem['title'];
        feedContent.author = rssItem['author'];
        feedContent.link = rssItem['link'];
        feedContent.subTitle = "By: " + feedContent.author;
        feedContent.publishedDate = new Date(rssItem['published']);
        feedContent.source = rssItem['source'];
        feedContent.description = rssItem['description'];
        return feedContent;

    }

}
