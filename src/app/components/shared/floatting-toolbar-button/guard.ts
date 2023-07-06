import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FloatingButtonService } from './floating-button.service';

export class RouteGuard {

  constructor(private floatButtonService: FloatingButtonService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (route.url[0]['path'] === 'portfolio') {
      this.floatButtonService.show();
      return true;
    }

    this.floatButtonService.hide();
    return true;
  }

}
