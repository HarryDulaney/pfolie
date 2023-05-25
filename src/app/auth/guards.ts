import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { SessionService } from '../services/session.service';
import { inject } from '@angular/core';

export const authGuard = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const sessionService = inject(SessionService)
    if (sessionService.authenticated) {
        return true;
    } else {
        let fragment = route.url[0]['path'];
        sessionService.displayLoginModal(fragment);
        return false;
    }
}


