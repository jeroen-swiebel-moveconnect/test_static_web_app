import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { EventsListenerService, LoginService } from 'src/app/moveware/services';
import { Router } from '@angular/router';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';

@Component({
    selector: 'mw-logout',
    template: `
        <section [hidden]="!field.CodeVisible">
            <a class="list-group-item mw-logout" (click)="logout()">
                <i class="fa fa-power-off"></i> Logout
            </a>
        </section>
    `,
    styleUrls: ['./mw-logout.component.scss']
})
export class LogoutComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    group: FormGroup;

    globalEventsNames: any[];

    constructor(
        private eventsListener: EventsListenerService,
        private oauthService: OAuthService,
        private cacheService: CacheService,
        private loginService: LoginService,
        private router: Router,
        private broadcaster: Broadcaster
    ) {}
    ngOnInit() {
        //console.log(this.field);
    }
    // private markDirty() {
    //     this.field['isDirty'] = true;
    //     if (this.globalEventsNames && Utils.isEventSource(this.field, this.globalEventsNames)) {
    //         this.eventsListener.onEventUpdate({ eventType: 'field_update', eventName: this.field.CodeCode });
    //     }
    // }

    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
    }

    async logout() {
        this.cacheService.clear();
        this.oauthService.logOut();
    }
}
