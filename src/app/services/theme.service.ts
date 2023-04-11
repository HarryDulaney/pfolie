import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { UserPreferences } from "../models/appconfig";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_ELEMENT_ID = 'app-theme';
    themeSource$ = new BehaviorSubject<string>(null);

    constructor(@Inject(DOCUMENT) private document: Document) { }


    init(userPreferences: UserPreferences) {
        let theme = userPreferences.theme;
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
            this.themeSource$ = new BehaviorSubject<string>(theme);
        }
    }

    setTheme(theme: string) {
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
            this.themeSource$.next(theme);
        }
    }


}


