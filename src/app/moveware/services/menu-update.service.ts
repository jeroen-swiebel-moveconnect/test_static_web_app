import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MenuUpdateService {
    protected _menuEventSubject = new Subject();
    public menuUpdateListener = this._menuEventSubject.asObservable();

    onMenuUpdate(event: Event) {
        this._menuEventSubject.next(event);
    }
}
