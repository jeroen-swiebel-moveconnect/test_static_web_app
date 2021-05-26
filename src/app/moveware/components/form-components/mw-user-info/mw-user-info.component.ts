import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig, Validator } from '../field.interface';
import { EventsListenerService, LoginService } from 'src/app/moveware/services';
import Utils from 'src/app/moveware/services/utils';
import { Router } from '@angular/router';
import { UserService } from 'src/app/moveware/services/user-service';
import { CacheService } from 'src/app/moveware/services/cache.service';

@Component({
    selector: 'mw-user',
    template: `
        <section [hidden]="!field.CodeVisible" class="pad-0">
            <a class="list-group-item user-info pad-0">
                <div class="media">
                    <div class="media-img pd-15">
                        <span class="avatar">
                            <img src="{{ avatar }}" />
                        </span>
                    </div>
                    <div class="media-body pd-10">
                        <div class="user-title">{{ userName }}</div>
                        <small class="text-muted"
                            ><a class="mail-text" href="mailto:{{ user.email }}">{{
                                user.email
                            }}</a></small
                        >
                    </div>
                </div>
            </a>
        </section>
    `,
    styleUrls: ['./mw-user-info.component.scss']
})
export class UserProfileInfoComponent implements OnInit {
    @Input() field: FieldConfig;
    group: FormGroup;
    public avatar: string;
    public user;
    hasAdminRights: boolean;
    public userName: string;
    globalEventsNames: any[];

    constructor(
        private eventsListener: EventsListenerService,
        private loginService: LoginService,
        private router: Router,
        private userService: UserService,
        private cacheService: CacheService
    ) {}
    ngOnInit() {
        if (this.loginService.user != null) {
            this.user = this.loginService.user;
            this.hasAdminRights = this.loginService.hasAdminRights();
        }
        this.hasAdminRights = this.loginService.hasAdminRights();
        if (this.cacheService.getLocalData('user') != null) {
            this.user = JSON.parse(this.cacheService.getLocalData('user'));
        }

        let userDetails = this.userService.getLoggedInUserDetails();
        this.avatar = userDetails.Image
            ? Utils.getFileFullpath(userDetails.Image?._id)
            : 'assets/images/admin-avatar.png';
        this.userName = userDetails.EntitySearchName;
    }
}
