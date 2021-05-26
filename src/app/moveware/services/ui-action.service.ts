import { Injectable, NgZone } from '@angular/core';
import { MenuService } from './menu.service';
import Utils from './utils';
import { StandardCodes } from '../constants/StandardCodes';
import { QuickTextHandlerService } from './quick-text-handler.service';
import { CollectionsService } from './collections.service';
import { CacheService } from './cache.service';
import { Subject } from 'rxjs';
import { Broadcaster } from './broadcaster';

@Injectable({
    providedIn: 'root'
})
export class UIActionService {
    currentPage: any;
    dialog: any;
    dialogConfig: any;
    dataFields: any;
    private showLoaderSubject = new Subject<boolean>();
    showLoader$ = this.showLoaderSubject.asObservable();
    constructor(
        private menuService: MenuService,
        private quickTextHandler: QuickTextHandlerService,
        private collectionService: CollectionsService,
        private cacheService: CacheService,
        private broadcaster: Broadcaster,
        private ngZone: NgZone
    ) {}
    appendSequenceId(parsedObject, responseData) {
        parsedObject['sequenceId'] = responseData.sequenceId;
        if (responseData.relationships) {
            return this.appendSequenceId(
                parsedObject.relationships[0],
                responseData.relationships[0]
            );
        }
    }

    getDeleteRequest(currentContext, currentView) {
        let requestObj = {};
        requestObj = {
            type: currentContext.dataObjectCodeCode,
            _id: currentContext.id,
            meta: {
                viewId: currentView._id
            }
        };
        if (currentContext['criteria']) {
            let relationships = this.getNestedDeleteReq(currentContext['criteria']);
            requestObj['relationships'] = relationships;
        }
        return requestObj;
    }

    private getNestedDeleteReq(context) {
        let relationships = [];
        relationships.push({
            type: context.dataObjectCodeCode,
            _id: context.id
        });
        if (context['criteria']) {
            //relationships = this.getNestedDeleteReq(req, context["criteria"])
            context = context['criteria'];
            relationships[0]['relationships'] = [];
            relationships[0]['relationships'].push({
                type: context.dataObjectCodeCode,
                _id: context.id
            });
        }
        return relationships;
    }
    actionHandler(
        selectedData,
        data,
        actionType,
        navigationUrl,
        event?: any,
        dialog?: any,
        dialogConfig?: any
    ) {
        let method = selectedData.Task;
        switch (method) {
            case StandardCodes.TASK_LOAD_LOOKUP:
                this.menuService.loadContainer(
                    selectedData,
                    navigationUrl,
                    actionType,
                    event,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.TASK_LOAD_UI_CONTAINER:
                this.menuService.loadContainer(
                    selectedData,
                    navigationUrl,
                    actionType,
                    event,
                    dialog,
                    dialogConfig
                );
                break;
            case StandardCodes.TASK_LOAD_DASHBOARD:
                this.menuService.loadContainer(
                    selectedData,
                    navigationUrl,
                    actionType,
                    event,
                    dialog,
                    dialogConfig
                );
                break;
        }
    }
    public getAction(actions, standarAction, task) {
        if (!Utils.isArrayEmpty(actions)) {
            return actions.filter((action) => {
                if (task) {
                    return action.CodeUIAction === standarAction && action.Task.CodeCode === task;
                } else {
                    return action.CodeUIAction === standarAction;
                }
            })[0];
        }
    }
    public getActionDetails(column, data, actionType, task) {
        let action = this.getAction(column['CodeActions'], actionType, task);
        return this.getActionMetaData(column, action, data);
    }

    public loadAction(codeActions: any) {
        var loadAction;
        if (!Utils.isArrayEmpty(codeActions)) {
            codeActions.forEach((action) => {
                if (
                    action['CodeUIAction'] &&
                    action['Task'] &&
                    action['Task']['CodeCode'] === StandardCodes.TASK_GET_OPTIONS
                ) {
                    loadAction = action['Task'];
                }
            });
        }
        return loadAction;
    }

    public getActionMetaData(column, action, data) {
        if (!action) {
            return;
        }
        column[StandardCodes.TASK_CODE] = action[StandardCodes.TASK_CODE]?.CodeCode;
        column['CodeUILocation'] = action['CodeUILocation'];
        column['CodeUIAction'] = action['CodeUIAction'];
        column['defaultView'] = action['CodeView'];
        column['CodeCallback'] = action['CodeCallback'];
        if (action['CodeSize']) {
            column['CodeSize'] = action['CodeSize'];
        }
        if (action['CodeCacheData']) {
            column['CodeCacheData'] = action['CodeCacheData'];
        }
        if (action['rowSelect']) {
            column['rowSelect'] = action['rowSelect'];
        }
        if (action['CodeGridDefaultLayout']) {
            column['defaultLayout'] = action['CodeGridDefaultLayout'];
        }
        column[StandardCodes.UI_CONTAINER_CODE] = action[StandardCodes.UI_CONTAINER_CODE];
        action[StandardCodes.JSON_PARAMETER_CODE];
        if (action[StandardCodes.JSON_PARAMETER_CODE]) {
            column.SetAddMode = action[StandardCodes.JSON_PARAMETER_CODE].SetAddMode;
            column.IsParentViewId = action[StandardCodes.JSON_PARAMETER_CODE].IsParentViewId;
            column.IsParentContext = action[StandardCodes.JSON_PARAMETER_CODE].IsParentContext;
            column.multiSelection = action[StandardCodes.JSON_PARAMETER_CODE].multiSelection;
            column.rowSelect = action[StandardCodes.JSON_PARAMETER_CODE].rowSelect;
            column.settingJSON = action[StandardCodes.JSON_PARAMETER_CODE].settingJSON;
        }
        if (
            action[StandardCodes.JSON_PARAMETER_CODE] &&
            action[StandardCodes.JSON_PARAMETER_CODE].criteria
        ) {
            column.criteria = this.getCriteria(
                data,
                Utils.getCopy(action[StandardCodes.JSON_PARAMETER_CODE])
            );
        }
        return column;
    }
    getCriteria(selectedRecord, actionData) {
        let isMatchCriteria = false;
        let criteria = {};
        if (actionData['criteria']['#match']) {
            isMatchCriteria = true;
            criteria = actionData['criteria']['#match'];
        } else {
            criteria = actionData['criteria'];
        }
        for (let property in criteria) {
            let value = criteria[property];
            if (value) {
                if (value['#in']) {
                    let inValues = value['#in'];
                    inValues.forEach((element, index) => {
                        if (element.includes('?')) {
                            element = element.replace('?', '');
                            if (selectedRecord && selectedRecord[element]) {
                                inValues[index] = selectedRecord[element];
                            }
                        } else if (element.includes('@@')) {
                            inValues[index] = this.quickTextHandler.getComputedValue(element);
                        }
                    });
                    //criteria[property] = inValues
                } else {
                    if (value.includes('?')) {
                        value = value.replace('?', '');
                    } else if (value.includes('@@')) {
                        value = this.quickTextHandler.getComputedValue(value);
                        criteria[property] = value;
                    }
                }
            }
            if (!value) {
                value = property;
            }
            if (criteria[property] && selectedRecord && selectedRecord[value]) {
                criteria[property] = selectedRecord[value];
            } else if (
                selectedRecord &&
                selectedRecord[property] === undefined &&
                selectedRecord.data &&
                selectedRecord.data[value]
            ) {
                criteria[property] = selectedRecord.data[value];
            }
        }
        if (isMatchCriteria) {
            let customCriteria = {};
            customCriteria['#match'] = criteria;
            if (actionData['criteria']['#sort']) {
                customCriteria['#sort'] = actionData['criteria']['#sort'];
            }
            return customCriteria;
        }
        return criteria;
    }

    public getLookupCharacterIfReplaceQuickTextAction(
        currentRecord,
        field,
        lookupCharacter
    ): string {
        if (currentRecord) {
            if (field && field.CodeValue) {
                if (!Utils.isArrayEmpty(field.CodeActions)) {
                    field.CodeActions.forEach((action) => {
                        if (
                            action['JSONParameter'] &&
                            action['JSONParameter']['output'] &&
                            action['JSONParameter']['output'] === 'replace'
                        ) {
                            if (
                                !currentRecord._id ||
                                currentRecord.mode !== StandardCodes.VIEW_UPDATE_MODE ||
                                (!Utils.isArrayEmpty(action['JSONParameter']['additionalModes']) &&
                                    action['JSONParameter']['additionalModes'].includes('update'))
                            ) {
                                lookupCharacter = action[StandardCodes.LOOKUP_CHARACTER];
                                return lookupCharacter;
                            }
                        }
                    });
                }
            }
        }
        return lookupCharacter;
    }

    public runWorkFlow(workflowName, uiaction) {
        let userId = this.cacheService.getUserId();
        this.showLoaderSubject.next(true);
        this.collectionService
            .startWorkflowProcess(workflowName, userId)
            .subscribe(async (response) => {
                let processInstanceId = response.body;
                this.broadcaster.on('Task Completed').subscribe((viewId) => {
                    this.getActiveTasks(processInstanceId, userId, uiaction, true, viewId);
                });
                this.getActiveTasks(processInstanceId, userId, uiaction, false);
            });
    }

    public getActiveTasks(processInstanceId, userId, uiaction, isNextTask, viewId?) {
        this.collectionService
            .getActiveTasks(processInstanceId, userId)
            .subscribe(async (response) => {
                if (!Utils.isArrayEmpty(response)) {
                    this.showLoaderSubject.next(false);
                    let activeTask = response[0];
                    if (isNextTask) {
                        this.broadcaster.broadcast(uiaction['UIContainer']['_id'] + 'close');
                    } else {
                        this.broadcaster.broadcast(this.currentPage.containerID + 'close');
                    }
                    this.cacheService.setSessionData(
                        'queryParams',
                        JSON.stringify({ task_id: activeTask.id, user_name: userId })
                    );
                    let selectedData = {
                        Task: uiaction.Task.CodeCode,
                        CodeUIAction: uiaction.CodeUIAction.CodeCode,
                        CodeUILocation: uiaction.CodeUILocation.CodeCode || null,
                        UIContainer: uiaction.UIContainer._id || null,
                        defaultView: {
                            viewId: activeTask.viewId,
                            viewType: StandardCodes.CODE_TYPE_DATA_FORM,
                            viewName: activeTask.name
                        },
                        IsParentContext: 'true'
                    };
                    if (selectedData.IsParentContext) {
                        selectedData['parentContainerId'] = this.currentPage['contextKey'];
                    } else {
                        selectedData['parentContainerId'] = selectedData.UIContainer;
                    }

                    setTimeout(() => {
                        this.menuService.loadContainer(
                            selectedData,
                            null,
                            event,
                            null,
                            this.dialog,
                            this.dialogConfig
                        );
                    });
                }
            });
    }
    public getParsedReqObject(requestObj) {
        let parsedObject = {};
        for (const iterator in requestObj) {
            if (
                requestObj[iterator] &&
                typeof requestObj[iterator] === 'object' &&
                requestObj[iterator]['_id']
            ) {
                if (requestObj[iterator]['label']) {
                    parsedObject[iterator] = requestObj[iterator]['label'];
                }
                requestObj[iterator] = requestObj[iterator]['_id'];
            } else if (requestObj[iterator] && Array.isArray(requestObj[iterator])) {
                if (requestObj[iterator].length && typeof requestObj[iterator][0] === 'object') {
                    parsedObject[iterator] = Utils.getArrayOfProperties(
                        requestObj[iterator],
                        'label'
                    );
                    requestObj[iterator] = Utils.getArrayOfProperties(requestObj[iterator], '_id');
                }
            } else {
                parsedObject[iterator] = requestObj[iterator];
            }
        }
        return { payload: requestObj, parsedReq: parsedObject };
    }
    public createNewReq(requestPayload, currentContext, currentView) {
        if (requestPayload) {
            return {
                type: currentView.CodeDataObject,
                meta: {
                    viewId: currentView._id
                },
                payload: requestPayload
            };
        } else {
            return {
                _id: currentContext.id,
                type: currentContext.dataObjectCodeCode,
                meta: {}
            };
        }
    }
    public getRequestObj(requestPayload, currentContext, currentView) {
        if (!currentContext) {
            return this.createNewReq(requestPayload, null, currentView);
        } else {
            let reqObj = this.createNewReq(null, currentContext, currentView);
            let nestedReqObject = this.getNestedReqObj(
                reqObj,
                currentContext,
                requestPayload,
                currentView
            );
            return nestedReqObject;
        }
    }
    public getNestedReqObj(reqObj, context, requestPayload, currentView) {
        if (context['criteria'] && context['criteria']['id']) {
            let relationship = {};
            relationship['type'] = context['criteria'].dataObjectCodeCode;
            relationship['_id'] = context['criteria'].id;

            let obj = this.getNestedReqObj(
                relationship,
                context['criteria'],
                requestPayload,
                currentView
            );
            let relationships = [];
            relationships.push(obj);
            reqObj['relationships'] = relationships;
        } else {
            reqObj = this.getRelationshipObj(reqObj, currentView, requestPayload);
        }
        return reqObj;
    }
    private getRelationshipObj(reqObj, currentView, requestPayload) {
        let relationships = [];
        relationships.push({
            type: currentView.CodeDataObject,
            meta: {
                viewId: currentView._id,
                userId: this.getUserId()
            },
            payload: requestPayload
        });
        reqObj['relationships'] = relationships;
        return reqObj;
    }
    public getSettingJSONReq(req, payloadId) {
        let userId = this.getUserId();
        req['meta']['userId'] = userId;
        let relationShips = [];
        relationShips.push(req.relationships ? req.relationships : req);
        return {
            type: 'Codes',
            _id: payloadId,
            relationships: relationShips,
            meta: {
                userId: userId
            }
        };
    }
    private getUserId() {
        if (this.cacheService.getLocalData('user')) {
            return JSON.parse(this.cacheService.getLocalData('user')).preferred_username;
        }
    }
    public getUpdateNewReqObj(reqObj, context) {
        reqObj = {
            type: context.dataObjectCodeCode,
            _id: context.id
        };
        return reqObj;
    }
    public getUpdateNestedReq(reqObj, context, requestPayload, currentView, isSpecialCase) {
        if (context['criteria']) {
            let relationship = {};
            relationship['type'] = context['criteria'].dataObjectCodeCode;
            relationship['_id'] = context['criteria'].id;
            if (context['criteria'] && !context['criteria']['criteria'] && isSpecialCase) {
                let view = {
                    CodeDataObject: context['criteria'].dataObjectCodeCode,
                    _id: context['criteria'].viewId
                };
                return this.getUpdateRelationshipObj(reqObj, requestPayload, view);
            }
            let obj = this.getUpdateNestedReq(
                relationship,
                context['criteria'],
                requestPayload,
                currentView,
                isSpecialCase
            );
            let relationships = [];
            relationships.push(obj);
            reqObj['relationships'] = relationships;
        } else {
            reqObj = this.getUpdateRelationshipObj(reqObj, requestPayload, currentView);
        }
        return reqObj;
    }
    private getUpdateRelationshipObj(reqObj, requestPayload, currentView) {
        let recordId = requestPayload._id;
        delete requestPayload._id;

        reqObj = {
            type: currentView.CodeDataObject,
            _id: recordId,
            meta: {
                viewId: currentView._id,
                userId: this.getUserId()
            },
            payload: requestPayload
        };
        return reqObj;
    }
    public getUpdateReqObj(reqObj, context, requestPayload, ref) {
        let recordId = requestPayload._id;
        delete requestPayload._id;

        reqObj = {
            _id: recordId,
            meta: {
                viewId: ref.currentView._id,
                userId: this.getUserId()
            },
            payload: requestPayload
        };
        if (context) {
            reqObj['type'] = context.dataObjectCodeCode;
        }
        if (ref.selectedRecord && ref.selectedRecord.LanguageReferenceID) {
            reqObj.meta.referenceId = ref.selectedRecord.LanguageReferenceID;
        }
        if (
            ref.selectedRecord &&
            ref.selectedRecord.LanguageField &&
            (!this.dataFields || !this.dataFields.LanguageReference)
        ) {
            if (typeof ref.selectedRecord.LanguageField === 'object') {
                reqObj.meta.languageField = ref.selectedRecord.LanguageField.CodeCode;
            } else {
                reqObj.meta.languageField = ref.selectedRecord.LanguageField;
            }
        }
        return reqObj;
    }
}
