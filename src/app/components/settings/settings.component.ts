import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "primeng/api";
import { Sidebar, SidebarModule } from "primeng/sidebar";
import { RadioButtonModule } from "primeng/radiobutton";
import { UserPreferences } from "src/app/models/appconfig";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, SharedModule, SidebarModule, RadioButtonModule]
})
export class SettingsComponent implements OnInit {
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    @Input() settings: UserPreferences;
    @Output() settingsChange = new EventEmitter<UserPreferences>();
    selectedTheme: string;
    el: ElementRef;

    constructor(private cd: ChangeDetectorRef, el: ElementRef) {
        this.el = el;
    }

    ngOnInit(): void {
        this.selectedTheme = this.settings.theme;
        this.cd.markForCheck();
    }


    changeTheme(newTheme) {
        this.settings.theme = newTheme;
        this.settingsChange.emit(this.settings);
    }

}