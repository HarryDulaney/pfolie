import { Injectable } from '@angular/core';
import { ApiNewsFeed, NewsFeed } from 'src/app/models/news-feed';
import { ApiService } from '../../services/api.service';
import { NEWS_CATEGORY, RSS_FEEDS } from 'src/app/constants';
import { catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable()
export class NewsService {
  private _fetchLimit = 40;


  public get fetchLimit() {
    return this._fetchLimit;
  }
  public set fetchLimit(value) {
    this._fetchLimit = value;
  }


  constructor(public apiService: ApiService) {
  }

  getAllFeedItems(apiLimit: number): Promise<NewsFeed[]> {
    let promises: Promise<NewsFeed>[] = [];
    for (const prop in RSS_FEEDS) {
      const feed = this.getFeedSubscription(RSS_FEEDS[prop], prop);
      if (feed) {
        promises.push(feed);
      }
    }
    promises.push(this.getAPINewsSource("polygon", apiLimit));

    return Promise.all(promises);
  }

  getRSSFeedItems(): Promise<NewsFeed[]> {
    let promises: Promise<NewsFeed>[] = [];
    for (const prop in RSS_FEEDS) {
      const feed = this.getFeedSubscription(RSS_FEEDS[prop], prop);
      if (feed) {
        promises.push(feed);
      }
    }

    return Promise.all(promises);
  }

  getAPIFeedItems(limit: number): Promise<NewsFeed> {
    return this.getAPINewsSource("polygon", limit);
  }

  getFeedSubscription(feedUrl: string, feedSource: string): Promise<NewsFeed> {
    return firstValueFrom(this.apiService.fetchFeedByUrl(feedUrl).pipe(
      catchError((err) => {
        console.log("Skipping malformed RssFeed Item...")
        console.log(err);
        return of(null);    //Return null, happy path
      }),
      map((newsItems) => {
        if (!newsItems) {
          return newsItems;
        }
        newsItems.source = feedSource;
        newsItems.items = newsItems.items.map((item) => {
          item.source = NEWS_CATEGORY.CRYPTO;
          item.origin = "rssFeed";
          return item;
        });
        return newsItems;
      })
    ));
  }

  getAPINewsSource(source: string, fetchLimit: number): Promise<NewsFeed> {
    return firstValueFrom(this.apiService.getRecentStockNews(fetchLimit).pipe(
      map((res: ApiNewsFeed) => {
        return {
          items: res.results,
          error: res.error,
          source: NEWS_CATEGORY.STOCK
        } as NewsFeed;
      }),
      map(newsItems => {
        if (!newsItems) {
          return null;
        }
        newsItems.items = newsItems.items.map((item) => {
          item.origin = "polygon";
          item.source = NEWS_CATEGORY.STOCK;
          return item;
        });

        return newsItems;
      })));

  }

  isFeedValid(feed: NewsFeed) {
    return feed && feed.items && feed.items.length > 0;
  }


}

