import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../services/session.service';

export class AuthGuard {

    constructor(
        private sessionService: SessionService,
        private router: Router,
    ) {

    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return this.sessionService.getUser().pipe(
            map((user) => {
                if (user === null) {
                    let fragment = route.url[0]['path'];
                    this.sessionService.displayLoginModal(fragment);
                    this.router.navigate(['/home']);
                    return false;
                }

                return (user !== null && user !== undefined);
            })
        );
    }
}