import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArticleService } from '../article.service';


@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FeatureComponent implements OnInit, OnDestroy {

  htmlContent: SafeHtml;
  categories: string[] = [];
  title: string = '';
  subTitle: string = '';
  publishedDate: Date;
  author: string = '';
  articleSource = '';

  destroySubject$ = new Subject();

  constructor(
    public articleService: ArticleService,
    private router: Router) {

  }
  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }


  ngOnInit(): void {
    this.articleService.pipe(takeUntil(this.destroySubject$)).subscribe((content) => {
      if (content !== null && content['title']) {
        this.title = content.title;
        this.categories = content.categories;
        this.subTitle = content.subTitle;
        this.publishedDate = content.publishedDate;
        this.author = content.author;
        this.htmlContent = content.htmlContent;
        this.articleSource = "Publisher: " + content.source;

      } else {
        this.router.navigate(['/', 'home']);
      }
    });
  }

  close() {
    if (this.articleService.navOriginIsHome) {
      this.router.navigate(['/', 'home']);
    } else {
      this.router.navigate(['/', 'news']);
    }
  }

}
