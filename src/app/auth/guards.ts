import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { SessionService } from '../services/session.service';
import { map } from 'rxjs';
import { inject } from '@angular/core';

export const authGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const sessionService = inject(SessionService)
    return sessionService.getUser()
        .pipe(
            map((user) => {
                if (user === null) {
                    let fragment = route.url[0]['path'];
                    sessionService.displayLoginModal(fragment);
                    router.navigate(['/home']);
                    return false;
                }

                return (user !== null && user !== undefined);
            })
        );
}