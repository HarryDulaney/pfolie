import { Injectable } from '@angular/core';
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


