import { Inject, Injectable } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { UserPreferences } from "../models/appconfig";

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_ELEMENT_ID = 'app-theme';

    constructor(@Inject(DOCUMENT) private document: Document) { }


    init(userPreferences: UserPreferences) {
        let theme = userPreferences.theme;
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
        }
    }

    setTheme(theme: string) {
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
        }
    }


}


