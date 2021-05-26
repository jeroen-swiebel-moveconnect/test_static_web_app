import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheService } from '../services/cache.service';
import { HttpProvider } from './http.provider';

@Injectable()
export class WebBaseProvider extends HttpProvider {
    constructor(http: HttpClient, cacheService: CacheService) {
        super(http, cacheService);
    }

    formatUrl(relativeUrl: string, command?: boolean): string {
        relativeUrl = super.formatUrl(relativeUrl, command);
        //console.log(relativeUrl);
        return relativeUrl;
    }
}
