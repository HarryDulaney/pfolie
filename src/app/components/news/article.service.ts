import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { FeedItem, ParsedFeedItem } from 'src/app/models/rssfeed';

@Injectable({
    providedIn: 'root'
})
export class ArticleService extends BehaviorSubject<ParsedFeedItem> {
    navOriginIsHome: boolean;

    constructor(
        private domSanitizer: DomSanitizer
    ) {
        super({} as ParsedFeedItem);
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

    openArticle(content: ParsedFeedItem) {
        super.next(content);
    }

    closeArticle(result: string) {
        super.next(null);
    }

    public getFeedContent(rssItem: FeedItem, isCarouselNews: boolean): ParsedFeedItem {
        let feedContent = new ParsedFeedItem();
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
        feedContent.subTitle = "By: " + feedContent.author;
        feedContent.publishedDate = new Date(rssItem['published']);
        feedContent.source = rssItem.source;
        feedContent.htmlContent = this.parseHtmlContent(rssItem);

        return feedContent;

    }

    parseHtmlContent(item: FeedItem): SafeHtml {
        switch (item.source) {
            case 'CoinJournal':
            case 'Coinbase':
                return this.domSanitizer.sanitize(SecurityContext.NONE, item['content']);
            case 'CoinTelegraph':
                return this.domSanitizer.sanitize(SecurityContext.NONE, item['description']);
        }

        return { content: '<div>Error occured while parsing html content of the article</div>' } as SafeHtml;
    }
}
