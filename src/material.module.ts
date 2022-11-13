import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DndModule } from 'ngx-drag-drop';
import { NgModule } from '@angular/core';

@NgModule({
    exports: [
        DndModule,
        MatSidenavModule,
        MatIconModule,
        MatToolbarModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatRippleModule
    ]
})
export class MaterialExportModule { }
