import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HeaderListenerService {
    protected messageSource = new Subject();
    public headerUpdateListener = this.messageSource.asObservable();
    onHeaderUpdate(data: any) {
        this.messageSource.next(data);
    }

    protected headerMenuSource = new Subject();
    public headerMenuListener = this.headerMenuSource.asObservable();
    onHeaderMenuUpdate(data: any) {
        this.headerMenuSource.next(data);
    }
}
