import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import Utils from './utils';
interface BroadcastEvent {
    key: any;
    data?: any;
}
@Injectable({
    providedIn: 'root'
})
export class Broadcaster {
    private _eventBus: Subject<BroadcastEvent>;
    events = {};
    constructor() {
        this._eventBus = new Subject<BroadcastEvent>();
    }

    broadcast(key: any, data?: any) {
        this._eventBus.next({ key, data });
    }

    on<T>(key: any): Observable<T> {
        //   console.log('=======> ' + key + ' ---' + this._eventBus.observers.length);
        return this._eventBus
            .asObservable()
            .filter((event) => event.key === key)
            .map((event) => <T>event.data);
    }
}
