import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Injectable, OnInit } from '@angular/core';
import { CONSTANT } from '../constants';
import { ThemeService } from './theme.service';
import { Coin, CoinFullInfo, CoinTableView } from '../models/coin-gecko';

@Injectable()
export class UtilityService {
    USD_LONG = '1.2-10';
    USD_SHORT = '1.2-5';
    USD_FORMAT_BASE = '1.2-';
    CHART_COLOR_PALLETTE = [];

    constructor(
        private currencyPipe: CurrencyPipe,
        private datePipe: DatePipe,
        private percentPipe: PercentPipe,
        private decimalPipe: DecimalPipe,
        private themeService: ThemeService
    ) {
        this.themeService.themeSource$.subscribe(theme => {
            this.CHART_COLOR_PALLETTE = []
        });

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

    generateColorPallete(theme: string)/* : string[] */ {
        // if (theme.includes('dark')) {
        //     for (let i = 0; i < 500; i++) {
        //         this.CHART_COLOR_PALLETTE.push(this.getRandomColor(theme));
        //     }
        // } else {
        //     for (let i = 0; i < 500; i++) {
        //         this.CHART_COLOR_PALLETTE.push(this.getRandomColor(theme));
        //     }
        // }


    }

    getThemeColorPallete(): string[] {
        return this.CHART_COLOR_PALLETTE;
    }

    mapCoinFullInfoToCoinTableView(coinFullInfo: CoinFullInfo): CoinTableView {
        return {
            id: coinFullInfo.id,
            image: coinFullInfo.image.small,
            name: coinFullInfo.name,
            current_price: this.format(coinFullInfo.market_data.current_price['usd'], 'USD'),
            market_cap_rank: coinFullInfo.market_cap_rank,
            market_cap: this.format(coinFullInfo.market_data.market_cap['usd'], 'USD'),
            price_change_24h: this.format(coinFullInfo.market_data.price_change_percentage_24h, 'decp'),
            high_24h: this.format(coinFullInfo.market_data.high_24h['usd'], 'USD'),
            low_24h: this.format(coinFullInfo.market_data.low_24h['usd'], 'USD'),
            sparkline: coinFullInfo.market_data.sparkline_7d.price,
        } as CoinTableView;

    }

    mapCoinFullInfosToCoinTableViews(coinFullInfos: CoinFullInfo[]): CoinTableView[] {
        const coinTableViews: CoinTableView[] = [];
        coinFullInfos.forEach(coinFullInfo => {
            coinTableViews.push(this.mapCoinFullInfoToCoinTableView(coinFullInfo));
        });
        return coinTableViews;
    }


}

