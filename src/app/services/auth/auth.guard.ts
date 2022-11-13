import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

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