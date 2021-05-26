import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

import { HttpProvider } from './http.provider';
import { CacheService } from '../services/cache.service';

@Injectable()
export class WebApiProvider extends HttpProvider {
    constructor(http: HttpClient, cacheService: CacheService) {
        super(http, cacheService);
    }

    formatUrl(relativeUrl: string): string {
        relativeUrl = environment.FRAMEWORK_QUERY_CONTEXT + relativeUrl;
        relativeUrl = super.formatUrl(relativeUrl);
        return relativeUrl;
    }
}
