import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';

export interface UserPreferences {
  sideNav: 'expand' | 'contract';

}


@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private _userPreferences: UserPreferences = { sideNav: 'expand' } as UserPreferences;

  constructor(private cacheService: CacheService) { }

  public get userPreferences(): UserPreferences {
    const prefs = this.cacheService.getUserPreferences();
    if (prefs) {
      this._userPreferences = prefs;
    }

    return this._userPreferences;
  }
  public set userPreferences(prefs: UserPreferences) {
    this._userPreferences = prefs;
    this.cacheService.setUserPreferences(this._userPreferences);
  }

}
