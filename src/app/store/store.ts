import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// When updating the state, the caller has the option to define the new state partial
// using a a callback. This callback will provide the current state snapshot.
interface SetStateCallback<T> {
  (currentState: T): Partial<T>;
}

export class Store<StoreType = any> {
  private state$: BehaviorSubject<StoreType>;
  get state(): StoreType {
    return this.state$.getValue();
  }

  constructor(initialState: StoreType) {
    this.state$ = new BehaviorSubject<StoreType>(initialState);
  }

  public selectAll(): Observable<StoreType> {
    return this.state$.asObservable();
  }


  public select<K extends keyof StoreType>(key: K): Observable<StoreType[K]> {
    var selectStream = this.state$.pipe(
      map(
        (state: StoreType) => {
          return (state[key]);
        }
      ),
      distinctUntilChanged()
    );
    return (selectStream);
  }

  public setState(_callback: SetStateCallback<StoreType>): void;
  public setState(_partialState: Partial<StoreType>): void;
  public setState(updater: any): void {
    var currentState = this.getCurrentValue();

    var newState = (updater instanceof Function)
      ? updater(currentState)
      : updater;

    this.state$.next({
      ...this.state,
      ...newState,
    });
  }

  // I get the current state snapshot.
  public getCurrentValue(): StoreType {
    return (this.state$.getValue());

  }

}
