import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NewsItem, CleanedNewsItem } from 'src/app/models/news-feed';

@Injectable()
export class ArticleService extends BehaviorSubject<CleanedNewsItem> {
    navOriginIsHome: boolean;
    imageNotFound = 'assets/img/image_filler_icon_blank.jpg';

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
        let cleanedNewsItem = new CleanedNewsItem();
        cleanedNewsItem.featureImageUrl = raw['image_url'];
        if (!cleanedNewsItem.featureImageUrl || cleanedNewsItem.featureImageUrl === '') {
            cleanedNewsItem.featureImageUrl = this.imageNotFound;
        }
        cleanedNewsItem.title = raw['title'];
        cleanedNewsItem.author = raw['author'];
        cleanedNewsItem.link = raw['article_url'];
        cleanedNewsItem.subTitle = "By: " + raw.author;
        cleanedNewsItem.publishedDate = new Date(raw['published_utc']);
        cleanedNewsItem.source = raw['publisher']['name'];
        cleanedNewsItem.description = raw['description'];
        cleanedNewsItem.tickers = raw['tickers'];

        if (raw.keywords instanceof Array) {
            for (let i = 0; i < 2 && i < raw.keywords.length; i++) {
                cleanedNewsItem.categories.push(raw.keywords[i]);
            }
        } else {
            cleanedNewsItem.categories[0] = '';
        }

        return cleanedNewsItem;

    }

    public extractRssFeedContent(rssItem: NewsItem, isCarouselNews: boolean): CleanedNewsItem {
        let cleanedNewsItem = new CleanedNewsItem();
        cleanedNewsItem.media = rssItem['media'];
        cleanedNewsItem.enclosures = rssItem['enclosures'];
        cleanedNewsItem.featureImageUrl = this.parseImageUrl(cleanedNewsItem.media, cleanedNewsItem.enclosures);
        if (!cleanedNewsItem.featureImageUrl || cleanedNewsItem.featureImageUrl === '') {
            cleanedNewsItem.featureImageUrl = this.imageNotFound;
        }

        if (rssItem.category instanceof Array) {
            if (isCarouselNews) {
                for (let i = 0; i < 2 && i < rssItem.category.length; i++) {
                    cleanedNewsItem.categories.push(rssItem.category[i]);
                }
            } else {
                cleanedNewsItem.categories.push(...rssItem.category);
            }

        } else {
            cleanedNewsItem.categories[0] = rssItem.category.toString() || '';
        }

        cleanedNewsItem.title = rssItem['title'];
        cleanedNewsItem.author = rssItem['author'];
        cleanedNewsItem.link = rssItem['link'];
        cleanedNewsItem.subTitle = "By: " + cleanedNewsItem.author;
        cleanedNewsItem.publishedDate = new Date(rssItem['published']);
        cleanedNewsItem.source = rssItem['source'];
        cleanedNewsItem.description = rssItem['description'];
        return cleanedNewsItem;

    }

}
