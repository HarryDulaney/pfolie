import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { UserPreferences } from "../models/appconfig";
import { BehaviorSubject } from "rxjs";
import { OverlayPanel } from 'primeng/overlaypanel';

@Injectable()
export class HelperService {

    public static closeOverlays(overlays: OverlayPanel[]) {
        if (!overlays || overlays.length < 1) return;
        for (let panel of overlays) {
            panel.hide();
        }
    }

}


