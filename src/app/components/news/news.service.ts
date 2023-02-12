import { Injectable } from '@angular/core';
import { RssFeed } from 'src/app/models/rssfeed';
import { ApiService } from '../../services/api.service';
import { RSS_FEEDS } from 'src/app/constants';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(public apiService: ApiService) {
  }

  getAllFeedItems(): Promise<RssFeed[]> {
    let promises: Promise<RssFeed>[] = [];
    for (const prop in RSS_FEEDS) {
      const feed = this.getFeedSubscription(RSS_FEEDS[prop], prop);
      if (feed) {
        promises.push(feed);
      }
    }

    return Promise.all(promises);
  }

  getFeedSubscription(feedUrl: string, feedSource: string): Promise<RssFeed> {
    let promise = new Promise<RssFeed>((resolve, reject) => {
      this.apiService.fetchFeedByUrl(feedUrl).pipe(
        catchError((err) => {
          console.log("Skipping malformed RssFeed Item...")
          console.log(err);
          return of(null);    //Return null, happy path
        }),
        map((feedResult) => {
          if (!feedResult) {
            return feedResult;
          }
          feedResult.source = feedSource;
          feedResult.items = feedResult.items.map((item) => {
            item.source = feedSource;
            return item;
          });
          return feedResult;
        })
      ).toPromise().then(
        (res) => {
          resolve(res);
        }
      )
    });

    return promise;
  }

}

