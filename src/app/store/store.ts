import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

// When updating the state, the caller has the option to define the new state partial
// using a a callback. This callback will provide the current state snapshot.
interface SetStateCallback<T> {
  (currentState: T): Partial<T>;
}

export class UpdateOptions<StoreType> {
  _key: keyof StoreType;
  _value: StoreType[keyof StoreType];

  constructor(key: keyof StoreType, value: StoreType[keyof StoreType]) {
    this._key = key;
    this._value = value;
  }

  get key(): keyof StoreType {
    return this._key;
  }

  get value(): StoreType[keyof StoreType] {
    return this._value;
  }

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
  public set(newState: StoreType): void {
    this.state$.next(newState);
  }
  
  public update(options: UpdateOptions<StoreType>): void;
  public update(_callback: SetStateCallback<StoreType>): void;
  public update(_partialState: Partial<StoreType>): void;
  public update(setter: any): void {
    var currentState = this.getCurrentValue();
    switch (setter) {
      case (setter instanceof UpdateOptions):
        this.state$.next({
          ...this.state,
          [setter.key]: setter.value,
        });
        break;
      case (setter instanceof Function):
        var newState = setter(currentState);
        this.state$.next({
          ...this.state,
          ...newState,
        });
        break;
      default:
        this.state$.next({
          ...this.state,
          ...setter,
        });
    }

  }

  // Get Current State snapshot
  public getCurrentValue(): StoreType {
    return this.state$.getValue();

  }

}
