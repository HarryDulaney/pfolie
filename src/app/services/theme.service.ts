import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { UserPreferences } from "../models/appconfig";
import { BehaviorSubject, take, tap, timer } from "rxjs";

@Injectable()
export class ThemeService {
    private readonly THEME_ELEMENT_ID = 'app-theme';
    themeSource$ = new BehaviorSubject<string>(null);
    private document: Document;

    init(userPreferences: UserPreferences, document: Document) {
        this.document = document;
        let theme = userPreferences.theme;
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
        }
        this.themeSource$.next(theme);

    }

    setTheme(theme: string) {
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
            timer(500).pipe(
                tap(() => {
                    this.themeSource$.next(theme);
                })
            ).subscribe();

        }
    }

    getCssVariableValue(name: string, document?: Document) {

        if (!document) { document = this.document; }
        const documentStyle: CSSStyleDeclaration = getComputedStyle(document.documentElement);
        return documentStyle.getPropertyValue(name);

    }

}


