export interface UserPreferences {
    theme: string;
    sideNav: 'contract' | 'expand';
}

export interface LastCoin {
    id: string;
    name: string;
}

export interface CachedPortfolio {
    pid: number;
    pName: string;
}

export interface TimeStamp {
    timeInMillis: number;
}


export const BLUE_DARK_THEME = 'lara-dark-blue';
export const BLUE_LIGHT_THEME = 'lara-light-blue';
export const INDIGO_DARK_THEME = 'dark-indigo';
export const INDIGO_LIGHT_THEME = 'light-indigo';
export const DEFAULT_USER_PREFS: UserPreferences = {
    theme: BLUE_DARK_THEME,
    sideNav: 'expand'
};

