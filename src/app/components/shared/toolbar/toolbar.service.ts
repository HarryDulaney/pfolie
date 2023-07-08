import { Injectable } from "@angular/core";
import { MenuItem } from "primeng/api";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Portfolio, WatchList } from "src/app/models/portfolio";

@Injectable()
export class ToolbarService {
    private menuSource: Subject<MenuItem[]> = new Subject<MenuItem[]>();
    /* Subject controls opening and closing the Toolbar */
    private displaySource: Subject<boolean> = new Subject();
    private eventSource: Subject<any> = new Subject();

    menuSource$ = this.menuSource.asObservable();
    displaySource$ = this.displaySource.asObservable();
    eventSource$ = this.eventSource.asObservable();

    constructor() { }

    setMenuSource(data: MenuItem[]) {
        this.menuSource.next(data);
    }

    openToolbar() {
        this.displaySource.next(true);
    }

    hideToolbar() {
        this.displaySource.next(false);
    }

    closeToolbar() {
        this.displaySource.next(false);
    }

    setEventSource(data: any) {
        this.eventSource.next(data);
    }

}

