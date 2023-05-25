import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { SessionService } from '../services/session.service';
import { map } from 'rxjs';
import { inject } from '@angular/core';


const isValid = (user) => {
    return (user && user !== null && user !== undefined);
}

const isNotValid = (user) => {
    return (user === null || user === undefined);
}

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


