import { Injectable } from '@angular/core';
import {
    startOfToday,
    startOfTomorrow,
    startOfYesterday,
    startOfMonth,
    endOfMonth,
    startOfDay
} from 'date-fns';
import { CacheService } from './cache.service';
import { ContextService } from './context.service';
import Utils from './utils';
import { CollectionsService } from './collections.service';

@Injectable({
    providedIn: 'root'
})
export class QuickTextHandlerService {
    constructor(
        private cacheService: CacheService,
        private collectionService: CollectionsService,
        private contextService: ContextService
    ) {}
    public currentRecord: any;
    public currentView: any;
    public currentField: any;
    public previousRecord: any;
    public implementQuickText(quickText: string, clearValue: boolean = true) {
        switch (quickText) {
            case '@@Now':
                return new Date();
            case '@@Today':
                return startOfToday();
            case '@@Tomorrow':
                return startOfTomorrow();
            case '@@Yesterday':
                return startOfYesterday();
            case '@@StartDateofMonth':
                return startOfMonth(new Date());
            case '@@EndDateofMonth':
                return startOfDay(endOfMonth(new Date()));
            case '@@CurrentRecord':
                return this.getCurrentRecord();
            case '@@CurrentUser':
                return this.getCurrentUser();
            case '@@CurrentField':
                return this.currentField;
            case '@@CurrentView':
                return this.currentView;
            case '@@CurrentMenu':
                return this.contextService['CurrentMenu'];
            case '@@CurrentContainer':
                if (this.currentView && this.currentView.containerID) {
                    return this.contextService.getContiainer(this.currentView.containerID);
                } else {
                    return {};
                }
            default:
                if (!clearValue) {
                    return quickText;
                }
        }
    }
    public getCurrentRecord() {
        return this.currentRecord;
    }

    public setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    public setRecentCurrentRecord() {
        this.currentRecord = this.previousRecord;
    }

    public setPreviousRecord(previousRecord) {
        this.previousRecord = previousRecord;
    }

    private getCurrentUser() {
        const currentUser = JSON.parse(this.cacheService.getLocalData('CurrentUser'));
        return currentUser;
    }

    public computeParamterName(parameterName, parentFieldsData) {
        let quickTextValue = parameterName.split('.', 2);
        parentFieldsData[parameterName] = Utils.getNestedObject(
            this.implementQuickText(quickTextValue[0]),
            parameterName.split('.'),
            1
        );
        return parentFieldsData;
    }
    public getComputedValue(quickText) {
        let quickTextValue = quickText.split('.', 2);
        let val = Utils.getNestedObject(
            this.implementQuickText(quickTextValue[0]),
            quickText.split('.'),
            1
        );
        return val;
    }

    public loadQuickText(searchString) {
        return this.collectionService.loadQuickText(searchString);
    }
}
