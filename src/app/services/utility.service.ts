import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Injectable, OnInit } from '@angular/core';
import { CONSTANT } from '../constants';

@Injectable()
export class UtilityService implements OnInit {
    USD_LONG = '1.2-10';
    USD_SHORT = '1.2-5';
    USD_FORMAT_BASE = '1.2-';

    constructor(
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private percentPipe: PercentPipe,
        private decimalPipe: DecimalPipe
    ) { }

    ngOnInit(): void {
    }


    public format(value: any, format: string): any {
        switch (format) {
            case 'c':
                return this.formatCurrency(value);
            case 'USD':
                return this.formatUsd(value);
            case 'BTC':
                return this.currencyPipe.transform(value, 'BTC', '', CONSTANT.FORMAT.BTC);
            case '2dec':
                return this.formatCurrencyTwoDecimalPlaces(value);
            /** Date Long */
            case 'dt':
                return this.datePipe.transform(value, 'MM-dd-yyyy h:mm a')?.toString();
            /** Date Short */
            case 'd':
                return this.datePipe.transform(value, 'MM-dd-yyyy')?.toString();
            case 'p':
                return this.percentPipe.transform(value, CONSTANT.FORMAT.PERCENT);
            case 'pd':
                return this.formatPercentDynamic(value);
            case 'decp':
                return Number(this.decimalPipe.transform(value, CONSTANT.FORMAT.PERCENT_DEC))
            default:
                return '';
        }

    }

    formatPercentDynamic(decimalPercentage: any): any {
        if (decimalPercentage === 0 || decimalPercentage === undefined) {
            return 'n/a';
        }

        const percent = decimalPercentage;
        return this.decimalPipe.transform(percent, CONSTANT.FORMAT.PERCENT_EX_SHORT) + "%";
    }

    formatCurrency(value: any, localization?: string): any {
        const absoluteValue = Math.abs(value);
        if (absoluteValue > 1) {
            return this.currencyPipe.transform(value, 'USD', '$', CONSTANT.FORMAT.USD_SHORT);
        }
        return this.currencyPipe.transform(value, 'USD', '$', CONSTANT.FORMAT.USD);
    }

    formatUsd(value): any {
        let maxDecimalPlaces = 2;
        for (let i = 100; i < 100000000; i *= 10) {
            let formating = this.USD_FORMAT_BASE + maxDecimalPlaces;
            if ((value * i) % 1 === 0) {
                return this.currencyPipe.transform(value, 'USD', '$', formating);
            }
            maxDecimalPlaces++;
        }

        return this.currencyPipe.transform(value, 'USD', '$', this.USD_LONG);
    }

    formatCurrencyTwoDecimalPlaces(value: any): string {
        return this.currencyPipe.transform(value, 'USD', '$', '1.2-2');

    }

}

