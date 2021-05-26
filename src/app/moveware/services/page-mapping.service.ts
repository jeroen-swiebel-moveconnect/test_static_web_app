import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { ContextService } from './context.service';

@Injectable()
export class PageMappingService {
    constructor(private cache: CacheService, private contextService: ContextService) {}

    private containerMetaData: any;
    setContainerMetaData(metaData: any) {
        this.containerMetaData = metaData;
    }
    getContainerMetaData() {
        return this.containerMetaData;
    }

    public getViewSelectors(containerID) {
        let allSelectors = this.contextService.getViewSelectors(containerID);

        return allSelectors;
    }
}
