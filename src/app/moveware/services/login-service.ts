import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Login } from '../models/';
import { WebApiProvider } from '../providers';
import { UsersResponse } from '../responses';
import { CollectionsService } from './collections.service';
import { CacheService } from './cache.service';

@Injectable()
export class LoginService {
    constructor(
        private webApiProvider: WebApiProvider,
        private collectionService: CollectionsService,
        private cacheService: CacheService
    ) {}

    get user() {
        return this.getUser();
    }

    getUser() {
        return JSON.parse(this.cacheService.getLocalData('user'));
    }

    hasAdminRights(): boolean {
        const role = <boolean>JSON.parse(this.cacheService.getLocalData('adminRole'));
        return role;
    }

    public authenticate(login: Login): Observable<UsersResponse> {
        return this.webApiProvider.post<UsersResponse>('moveware/login', login);
    }

    public logout() {
        this.cacheService.clear();
    }
    changePassword(value) {
        this.collectionService.updatePassword(this.getChangePasswordReqObj(value)).subscribe();
    }
    getChangePasswordReqObj(value) {
        let reqObj = {
            type: null,
            _id: this.cacheService.getCurrentUserId(),
            meta: {
                userId: this.cacheService.getUserId()
            },
            payload: {
                EntityUserId: this.cacheService.getUserId(),
                password: value
            }
        };
        return reqObj;
    }
}
