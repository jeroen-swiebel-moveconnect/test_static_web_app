import { Injectable } from '@angular/core';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EventsListenerService {
    protected eventSource = new Subject();
    public eventUpdateListener = this.eventSource.asObservable();
    onEventUpdate(data: any) {
        this.eventSource.next(data);
    }

    private selectedRow = new BehaviorSubject('');

    public selectedRowChangeListener = this.selectedRow.asObservable();

    onRowUpdate(data: any) {
        this.selectedRow.next(data);
    }
}
