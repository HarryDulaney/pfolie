import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'primeng/api';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss'],
    imports: [SharedModule],
    standalone: true
})
export class PrivacyPolicyComponent {
    readonly title = 'Privacy Policy';
}
