import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { UserPreferences } from "../models/appconfig";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class ThemeService {
    private readonly THEME_ELEMENT_ID = 'app-theme';
    themeSource$ = new BehaviorSubject<string>(null);
    styles: any;

    constructor(@Inject(DOCUMENT) private document: Document) { }


    init(userPreferences: UserPreferences) {
        let theme = userPreferences.theme;
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
            this.themeSource$ = new BehaviorSubject<string>(theme);
        }
        this.styles = this.initStyles(this.document);
    }

    setTheme(theme: string) {
        let themeLink = this.document.getElementById(this.THEME_ELEMENT_ID) as HTMLLinkElement;
        if (themeLink) {
            themeLink.href = `${theme}.css`;
            this.themeSource$.next(theme);
        }
        this.styles = this.initStyles(this.document);
    }

    initStyles(document: Document) {
        const documentStyle = getComputedStyle(document.documentElement);
        const chartFillColor = documentStyle.getPropertyValue('--chart-fill-color');
        const textColor = documentStyle.getPropertyValue('--text-color');
        const chartLineColor = documentStyle.getPropertyValue('--chart-line-color');
        const chartBackgroundColor = documentStyle.getPropertyValue('--chart-bg-color');
        const chartVolumeColor = documentStyle.getPropertyValue('--chart-volume-color');
        return {
            textColor,
            chartFillColor,
            chartLineColor,
            chartBackgroundColor,
            chartVolumeColor
        };
    }

    getCssVariableValue(name: string): string {
        const documentStyle = getComputedStyle(this.document.documentElement);
        return documentStyle.getPropertyValue(name);

    }


}


