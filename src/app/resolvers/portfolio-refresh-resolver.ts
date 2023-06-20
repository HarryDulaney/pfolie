import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { PortfolioMeta, Portfolio } from 'src/app/models/portfolio';
import { PortfolioService } from '../services/portfolio.service';
import { UserService } from '../services/user.service';


export const portfoloRefreshResolver: ResolveFn<Portfolio> = (route: ActivatedRouteSnapshot): Observable<any> => {
    const router = inject(Router);
    const portfolioService = inject(PortfolioService);
    const userService = inject(UserService);
    /* Create new portfolio */
    return portfolioService.createAndOpen()
        .pipe(
            concatMap((result) => portfolioService.saveAs(result)),
            tap(result => {
                if (result) {
                    portfolioService.setPortfolio(result);
                    const newPortfoiloMeta = {
                        uid: result.uid,
                        portfolioId: result.portfolioId,
                        portfolioName: result.portfolioName,
                        isMain: result.isMain
                    } as PortfolioMeta;
                    
                    userService.addPortfolioMeta(newPortfoiloMeta);
                }
            }),
            map(result => {
                return result;
            })


        );

};