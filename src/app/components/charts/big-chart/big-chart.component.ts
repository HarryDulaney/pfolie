import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { OwnedAssetView } from 'src/app/models/portfolio';
import { ChartModule } from 'primeng/chart';
import { UtilityService } from 'src/app/services/utility.service';


@Component({
    selector: 'app-big-chart',
    templateUrl: './big-chart.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ChartModule],
    providers: [UtilityService]
})
export class BigChartComponent implements OnInit {
    @Input('title') title: string;
    @Input() style: any;
    @Input() data: any;
    @Input() options: any;

    textColor: string;

    constructor(
        private cd: ChangeDetectorRef,
        private utilityService: UtilityService
    ) { }


    ngOnInit(): void {
        let documentStyle = getComputedStyle(document.documentElement);
        this.textColor = documentStyle.getPropertyValue('--text-color');
    }



    setData(assetData: OwnedAssetView[]) {

    }


    setupChartData(assetData: OwnedAssetView[], chartData: any[]) {

    }


}