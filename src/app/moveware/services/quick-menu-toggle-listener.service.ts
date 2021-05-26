import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class QuickMenuToggleService {
    protected messageSource = new Subject();

    protected quickMenuToggleSource = new Subject();
    public quickMenuToggleListener = this.quickMenuToggleSource.asObservable();
    onQuickMenuToggle(data: any) {
        this.quickMenuToggleSource.next(data);
    }
}
