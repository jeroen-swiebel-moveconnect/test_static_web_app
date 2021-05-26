import { Injectable } from '@angular/core';
import { CollectionsService } from './collections.service';
import { WebBaseProvider } from '../providers';
import { ISearchRequest } from '../models';
import { CacheService } from './cache.service';
import { Subject } from 'rxjs';

@Injectable()
export class LazyLoadingService {
    constructor(
        private collectionService: CollectionsService,
        private webBaseProvider: WebBaseProvider,
        private cacheService: CacheService
    ) {}

    public loadRecords(recordsRequest: ISearchRequest, page, limit, path): Promise<any> {
        let sessionData = JSON.parse(this.cacheService.getSessionData('groupByPaths'));
        let currentDataPath =
            sessionData && sessionData.hasOwnProperty(path) ? sessionData[path] : null;
        if (currentDataPath && currentDataPath['dataPage'] >= page) {
            return new Promise((resolve, reject) => {
                resolve(currentDataPath['data'].slice(page * limit, page * limit + (limit - 1)));
            });
        } else {
            if (currentDataPath) {
                currentDataPath['dataPage'] = currentDataPath['dataPage'] + 1;
                sessionData[path] = currentDataPath;
                this.cacheService.setSessionData('groupByPaths', JSON.stringify(sessionData));
            }
            return this.fetchRecords(recordsRequest, page, limit);
        }
    }
    private fetchRecords(metaData: ISearchRequest, page, limit): Promise<any> {
        return new Promise((resolve, reject) => {
            this.collectionService
                .getGridRecords(metaData, page, limit)
                .subscribe((responseData) => {
                    let _responseBody = JSON.parse(responseData.body);
                    resolve(_responseBody.result);
                });
        });
    }
}
