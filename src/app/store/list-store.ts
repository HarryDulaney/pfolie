import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// When updating the state, the caller has the option to define the new state partial
// using a a callback. This callback will provide the current state snapshot.
interface SetStateCallback<T> {
    (currentState: T): Partial<T>;
}

interface MutateCallback<T> {
    (currentState: T[]): T[];
}

export class ListStore<StoreType = any> {
    private state$: BehaviorSubject<StoreType[]>;

    get state(): StoreType[] {
        return this.state$.getValue();
    }

    constructor(initialState: StoreType[]) {
        this.state$ = new BehaviorSubject<StoreType[]>(initialState);
    }

    public select(): Observable<StoreType[]> {
        return this.state$.asObservable();
    }

    public clone(): ListStore<StoreType> {
        return new ListStore<StoreType>([...this.state]);
    }

    public set(newState: StoreType[]): void {
        this.state$.next(newState);
    }

    public update(_callback: SetStateCallback<StoreType[]>): void;
    public update(_partialState: Partial<StoreType[]>): void;
    public update(setter: any): void {
        var currentState = this.state;
        switch (setter) {
            case (setter instanceof Function):
                var newState = setter(currentState);
                this.state$.next(newState);
                break;
            default:
                this.state$.next({
                    ...this.state,
                    ...setter,
                });
        }

    }

    mutate(callback: MutateCallback<StoreType>) {
        const result = callback(this.state);
        this.state$.next(result);
    }


}
