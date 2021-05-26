import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WebBaseProvider } from '../providers/web.base.provider';
import { genericRetryStrategy } from './rxjs-utils';
import { retryWhen, catchError } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { delay } from 'rxjs/operators';

@Injectable()
export class CollectionsService {
    constructor(private webBaseProvider: WebBaseProvider, private cacheService: CacheService) {}

    public getMenus(): Observable<any> {
        return this.webBaseProvider.get<any>('objects/codes/Menu');
    }

    public getFullDetailsByModuleAndCollectionTypes(themeId: string): Observable<any> {
        return this.webBaseProvider.get<any>('objects?themeId=' + themeId);
    }

    public getActiveMenus(menuBar: String): Observable<any> {
        return this.webBaseProvider.get<any>('objects/active-menus?menuBar=' + menuBar);
    }

    public getFilterPaneViews(module: string): Observable<any> {
        return this.webBaseProvider.get<any>('objects/left-views?module_code=' + module);
    }

    public getFilterPaneViewData(viewObject, page, limit): Observable<any> {
        return this.webBaseProvider.post<any>(
            'objects/search?page=' + page + '&limit=' + limit,
            viewObject
        );
    }
    /**
     * fetches the grid records from the backend
     * @param viewObject : request body for the http request
     * @param page : page number
     * @param limit : limit of the records to fetched
     * @returns : Observable of the http request
     */
    public getGridRecords(viewObject, page, limit, restrictAPI?): Observable<any> {
        if (restrictAPI) {
            return new Observable<any>((obs) =>
                obs.next({ body: JSON.stringify({ result: [], items: [] }) })
            ).pipe(delay(100));
        } else {
            return this.webBaseProvider.post<any>(
                'objects/container-search?page=' +
                    page +
                    '&limit=' +
                    limit +
                    '&skip=' +
                    page * limit +
                    '&take=' +
                    limit,
                viewObject
            );
        }
    }
    public searchFullDetails(viewObject, module: string, page, limit) {
        return this.webBaseProvider.post<any>(
            'objects/detailed-search?module_code=' + module + '&page=' + page + '&limit=' + limit,
            viewObject
        );
    }

    // LOADING RIGHT-PANE  SERVICES START
    public loadListOfViewsByType(
        module_code: string,
        codeType: string,
        recordId: string,
        viewSelectorType: string,
        collectionName: string
    ): Observable<any> {
        let reqUrl =
            'module_code=' +
            module_code +
            '&collection_code=' +
            collectionName +
            '&typeSelector=' +
            viewSelectorType;
        if (codeType) {
            reqUrl = reqUrl + '&typeId=' + codeType;
        }
        if (recordId) {
            reqUrl = reqUrl + '&recordId=' + recordId;
        }
        return this.webBaseProvider.get<any>('objects/view-names?' + reqUrl);
    }

    public loadViewByCode(viewCode: string, typeField: String, codeType: String) {
        return this.webBaseProvider.get<any>(
            'objects/view?view_code=' +
                viewCode +
                '&field=' +
                typeField +
                '&field_value=' +
                codeType
        );
    }

    public loadContainerViewByCode(viewCode: string, parentId) {
        return this.webBaseProvider.get<any>(
            'objects/form-metadata?view_id=' + viewCode + '&parent_id=' + parentId
        );
    }

    public loadTemplate(templateId: string) {
        return this.webBaseProvider.get<any>('objects/fetch-template?template_id=' + templateId);
    }

    public loadViewWithDataByCode(
        codeType: string,
        code: string,
        module: string,
        viewCode: string,
        id?: string
    ) {
        return this.webBaseProvider.get<any>(
            'objects/view-data?view_code=' + viewCode + '&id=' + id
        );
    }
    // LOADING RIGHT-PANE  SERVICES END

    public getViewData(collectionCode: string, codeType: string, code: string, module: string) {
        return this.webBaseProvider.get<any>(
            'objects/view-data?type=' + codeType + '&view_code=' + code
        );
    }

    // New API for Container View Data
    public getContainerViewData(criteria: any) {
        return this.webBaseProvider.post<any>('objects/form-data', criteria);
    }

    public getLanguageData(criteria: any) {
        return this.webBaseProvider.post<any>('objects/fetch-language-document', criteria);
    }

    // This has to be removed once add endpoint validates this too
    public verifyNumberFormat(
        id: string,
        org_prefix: string,
        company_prefix: string,
        branch_prefix: string,
        type_prefix: string,
        digit: Number,
        format: string,
        delimiter: string
    ) {
        return this.webBaseProvider.get<any>(
            'objects/verify-format?id=' +
                id +
                '&org_prefix=' +
                org_prefix +
                '&company_prefix=' +
                company_prefix +
                '&branch_prefix=' +
                branch_prefix +
                '&type_prefix=' +
                type_prefix +
                '&digit=' +
                digit +
                '&format=' +
                format +
                '&delimiter=' +
                delimiter
        );
    }

    public addCollectionItem(itemToBeSaved: any): Observable<any> {
        return this.webBaseProvider.post<any>('objects', itemToBeSaved, true);
    }

    public updateCollectionItem(itemToBeSaved: any): Observable<any> {
        return this.webBaseProvider.put<any>('objects', itemToBeSaved, true);
    }

    updatePassword(reqObj) {
        return this.webBaseProvider.post<any>('user/change-password', reqObj, true);
    }
    public getGridMetaData(viewId: string): Observable<any> {
        return this.webBaseProvider.get<any>('objects/grid-metadata?view_id=' + viewId);
    }
    public removeCollectionItem(reqObj): Observable<any> {
        return this.webBaseProvider.delete<any>('objects', reqObj, true);
    }

    public searchGlobally(searchText: string) {
        return this.webBaseProvider.get<any>('objects/global-search?search_text=' + searchText);
    }
    public uploadFile(file: File, command?, parentId?) {
        let userId = this.cacheService.getUserId();
        const formdata: FormData = new FormData();
        formdata.append('file_name', file);
        formdata.append('userId', userId);
        formdata.append('fileId', parentId);
        return this.webBaseProvider.post<any>('objects/file-upload', formdata, command);
    }

    public revertToThisVersion(fileId, revertId, command?) {
        let userId = this.cacheService.getUserId();
        const formdata: FormData = new FormData();
        formdata.append('fileId', fileId);
        formdata.append('userId', userId);
        formdata.append('revertId', revertId);
        return this.webBaseProvider.post<any>('objects/file-revert-version', formdata, command);
    }
    public getUser(userId: String) {
        return this.webBaseProvider.get<any>('objects/users?id=' + userId);
    }
    public getFilterViews(userId: String, containerId: String) {
        return this.webBaseProvider.get<any>(
            'objects/group-filters?userId=' + userId + '&containerId=' + containerId
        );
    }

    public getDetailsById(collectionCode: string, id: string) {
        return this.webBaseProvider.get<any>(
            'objects/filter-view?collection_code=' + collectionCode + '&id=' + id
        );
    }
    public multiChange(ObjectsToBeUpdated: any) {
        return this.webBaseProvider.put<any>(
            'objects/batch-add-or-update',
            ObjectsToBeUpdated,
            true
        );
    }

    public pinToFavourite(id: string) {
        const url = 'objects/favourite-tasks?task_id=' + id;
        return this.webBaseProvider.post<any>(url, null, true);
    }

    public unpinFromFavourite(id: string, settingId: string) {
        const url = 'objects/favourite-tasks/' + id + '?setting_id=' + settingId;
        return this.webBaseProvider.delete<any>(url, null, true);
    }

    public getContainer(containerID) {
        return this.webBaseProvider.get<any>(
            'objects/container-metadata?container_code=' + containerID
        );
    }
    public getLookupData(fieldId, label) {
        return this.webBaseProvider.get<any>('objects/lookup?id=' + fieldId + '&label=' + label);
    }
    // public getUIStyles(date) {
    //   //date="Tue Aug 20 15:12:19 IST 2019";
    //   return this.webBaseProvider.get<any>('objects/ui-styles?lastUpdatedTimeStamp=' + date);
    // }
    public refreshRecord(criteria: any) {
        return this.webBaseProvider.post<any>('objects/refresh-record', criteria).pipe(
            retryWhen(
                genericRetryStrategy({
                    maxRetryAttempts: 3,
                    scalingDuration: 1000,
                    excludedStatusCodes: [404]
                })
            ),
            catchError((error) => of(error))
        );
    }

    public getChildRecords(reqObj) {
        return this.webBaseProvider.post<any>('objects/fetch-child-records', reqObj).pipe(
            retryWhen(
                genericRetryStrategy({
                    maxRetryAttempts: 3,
                    scalingDuration: 1000,
                    excludedStatusCodes: [404]
                })
            ),
            catchError((error) => of(error))
        );
    }

    public loadFieldOptions(fieldId, namedParameters, codeAction, viewId) {
        return this.webBaseProvider.post<any>(
            'objects/field-options?field_code=' +
                fieldId +
                '&code_action_id=' +
                codeAction +
                '&viewId=' +
                viewId,
            namedParameters
        );
    }
    public getFieldValues(criteria: any) {
        return this.webBaseProvider.post<any>('objects/fetch-values', criteria);
    }
    public getOptions(fieldId, namedParameters, codeId) {
        return this.webBaseProvider.post<any>(
            'objects/options?field_code=' + fieldId + '&codeId=' + codeId,
            namedParameters
        );
    }
    public getOptionsByJson(jsonValue) {
        return this.webBaseProvider.post<any>('objects/options-json', jsonValue);
    }

    public getUserSettings(userId: string) {
        return this.webBaseProvider.get<any>('objects/user-settings?userId=' + userId);
    }

    public getIconGroups() {
        return this.webBaseProvider.get<any>('objects/icon-groups');
    }
    public getIconsByGroup(groupName) {
        return this.webBaseProvider.get<any>('objects/icons-by-group?group_name=' + groupName);
    }
    public getIconsByText(searchString) {
        return this.webBaseProvider.get<any>('objects/icons-by-text?search_string=' + searchString);
    }
    public loadCodes(codeType) {
        return this.webBaseProvider.get<any>('objects/codes?code_type=' + codeType);
    }
    public getFields(dataObject) {
        return this.webBaseProvider.get<any>(
            'objects/fetch-fields?dataObjectCodeCode=' + dataObject
        );
    }
    public startWorkflowProcess(process_name, userId) {
        return this.webBaseProvider.post<any>(
            'objects/workflow/process?process_name=' + process_name + '&user_name=' + userId,
            null,
            true
        );
    }
    public getActiveTasks(processInstanceId, userId) {
        return this.webBaseProvider.get<any>(
            'workflow/task?process_instance_id=' + processInstanceId + '&user_name=' + userId,
            null,
            false
        );
    }
    public getI18nObject(lang): Observable<any> {
        return this.webBaseProvider.get<any>('objects/i18n');
    }
    public validate(req: any): Observable<any> {
        return this.webBaseProvider.post<any>('objects/validation', req, true);
    }
    public loadQuickText(searchString) {
        return this.webBaseProvider.get<any>(
            'objects/quick-text/matching-tags?searchString=' + searchString
        );
    }
    public resolveQuickText(id, collection, quickText) {
        let payload = { tag: quickText, dataObjectCodeCode: collection, domainObjectId: id };
        return this.webBaseProvider.post<any>('objects/quick-text/resolve', payload, true);
    }
}
