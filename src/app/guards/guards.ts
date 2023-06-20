import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { SessionService } from '../services/session.service';
import { inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

export const authGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean> => {
    const router = inject(Router);
    const sessionService = inject(SessionService)
    if (sessionService.initialized) {
        return of(sessionService.authenticated)
            .pipe(
                map((result) => {
                    if (result) {
                        return true;
                    } else {
                        let fragment = route.url[0];
                        sessionService.displayLoginModal(fragment.path + '/' + route.url[1].path);
                        return false;
                    }
                }
                ));
    }

    return sessionService.getAuth().pipe(
        map((user) => {
            if (user !== null) {
                return true;
            } else {
                let fragment = route.url[0];
                sessionService.displayLoginModal(fragment.path + '/' + route.url[1].path);
                return false;
            }
        }
        ));

}


