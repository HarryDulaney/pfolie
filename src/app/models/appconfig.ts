export interface UserPreferences {
    theme: string;
    sideNav: 'contract' | 'expand';
    localization: string;
    currency: string;
}

export interface LastCoin {
    id: string;
    name: string;
}


export interface TimeStamp {
    timeInMillis: number;
}


export const BLUE_DARK_THEME = 'lara-dark-blue';
export const BLUE_LIGHT_THEME = 'lara-light-blue';
export const INDIGO_DARK_THEME = 'dark-indigo';
export const INDIGO_LIGHT_THEME = 'light-indigo';
export const OLD_THEMES = [BLUE_DARK_THEME, BLUE_LIGHT_THEME, INDIGO_DARK_THEME, INDIGO_LIGHT_THEME];
export const SOHO_DARK_THEME = 'soho-dark';
export const SOHO_LIGHT_THEME = 'soho-light';

export const DEFAULT_USER_PREFS: UserPreferences = {
    theme: SOHO_DARK_THEME,
    sideNav: 'expand',
    localization: 'en',
    currency: 'usd'

};

