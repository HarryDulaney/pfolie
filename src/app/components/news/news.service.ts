import { Injectable } from '@angular/core';
import { ApiNewsFeed, NewsFeed } from 'src/app/models/news-feed';
import { ApiService } from '../../services/api.service';
import { RSS_FEEDS } from 'src/app/constants';
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

  getAllFeedItems(): Promise<NewsFeed[]> {
    let promises: Promise<NewsFeed>[] = [];
    for (const prop in RSS_FEEDS) {
      const feed = this.getFeedSubscription(RSS_FEEDS[prop], prop);
      if (feed) {
        promises.push(feed);
      }
    }


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

  getAPIFeedItems(): Promise<ApiNewsFeed> {
    return this.getAPINewsSource("polygon");
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
          item.source = feedSource;
          item.origin = "rssFeed";
          return item;
        });
        return newsItems;
      })
    ));
  }

  getAPINewsSource(source: string): Promise<ApiNewsFeed> {
    return firstValueFrom(this.apiService.getRecentStockNews(this.fetchLimit).pipe(
      map(newsItems => {
        if (!newsItems) {
          return null;
        }
        newsItems.results = newsItems.results.map((item) => {
          item.origin = "polygon";
          item.source = source;
          return item;
        });

        return newsItems;
      })));

  }
}

