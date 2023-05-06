import { Injectable } from '@angular/core';

@Injectable()
export class StringUtility {
    public static isNotEmpty(value: any): any {
        return value !== undefined && value !== null && value !== '';
    }

    public static isEmpty(value: any): any {
        return value === undefined && value === null && value === '';
    }
}

