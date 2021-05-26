import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    preventDefault: boolean = false;

    constructor() {}

    public setLocalData(key, value) {
        localStorage.setItem(key, value);
    }
    public getLocalData(key) {
        return localStorage.getItem(key);
    }
    public removeLocalData(key) {
        localStorage.removeItem(key);
    }

    public setSessionData(key, value) {
        sessionStorage.setItem(key, value);
    }
    public getSessionData(key) {
        return sessionStorage.getItem(key);
    }
    public removeSessionData(key) {
        sessionStorage.removeItem(key);
    }
    public getCurrentUserId() {
        if (this.getLocalData('CurrentUser')) {
            return JSON.parse(this.getLocalData('CurrentUser'))._id;
        }
    }

    public clear() {
        sessionStorage.clear();
        localStorage.clear();
    }

    public getUserId() {
        if (this.getLocalData('user')) {
            return JSON.parse(this.getLocalData('user')).preferred_username;
        }
    }

    public getUserSignatures() {
        if (this.getLocalData('CurrentUser')) {
            return JSON.parse(this.getLocalData('CurrentUser')).Signatures;
        }
    }
}
