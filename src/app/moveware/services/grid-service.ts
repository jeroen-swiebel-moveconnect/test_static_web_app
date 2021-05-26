import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';
import { CacheService } from './cache.service';
import { StandardCodes } from '../constants/StandardCodes';
import { ISearchCriteria } from '../models';
import { ActivatedRoute, Router } from '@angular/router';
import { PageMappingService } from './page-mapping.service';
import { Location } from '@angular/common';
import { RuleEngineService } from './rule-engine.service';
import { TableCellComponent } from '../components/data-util-view/table-cell/table-cell.component';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { OAuthService } from 'angular-oauth2-oidc';
import Utils from './utils';
import { DataUtilViewComponent } from '../components/data-util-view/data-util-view.component';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { UIActionService } from './ui-action.service';
import { DataFormService } from './dataform-service';

export const CREATE_MODE: string = 'CREATE_MODE';

@Injectable()
export class GridService {
    parentRecord: any;
    reloadFormOnce: boolean;
    gridEditData: any = {};
    buildselectedFiltersInLocale(selectedFilters): Observable<any> {
        let subject: Subject<any> = new Subject();
        Object.keys(selectedFilters).forEach((filter) => {
            Object.keys(selectedFilters[filter]).forEach((eachfilter) => {
                if (eachfilter === 'CodeValue') {
                    if (
                        typeof selectedFilters[filter][eachfilter] === 'object' &&
                        typeof selectedFilters[filter][eachfilter] != 'string'
                    ) {
                        Object.keys(selectedFilters[filter][eachfilter]).forEach((filValue) => {
                            if (Array.isArray(selectedFilters[filter][eachfilter][filValue])) {
                                selectedFilters[filter][eachfilter][filValue].forEach(
                                    (data, index) => {
                                        this.translationService.get(data).subscribe((data) => {
                                            selectedFilters[filter][eachfilter][filValue][
                                                index
                                            ] = data;
                                            subject.next(selectedFilters);
                                        });
                                    }
                                );
                            } else {
                                subject.next(selectedFilters);
                            }
                        });
                    } else {
                        subject.next(selectedFilters);
                    }
                }
            });
        });
        return subject;
    }
    appendNamedParameters(requestObject, metaData) {
        if (metaData) {
            let namedParameters = metaData['namedParameters'];
            if (namedParameters) {
                namedParameters.forEach((key) => {
                    if (!requestObject.criteria['namedParameters']) {
                        requestObject.criteria['namedParameters'] = {};
                    }
                    requestObject.criteria['namedParameters'][key] = this.getMartchedValue(key);
                });
            }
        }
    }

    public setGridEditData(key, value) {
        this.gridEditData[key] = value;
    }
    public getGridEditData() {
        return this.gridEditData;
    }
    public clearGridEditData() {
        this.gridEditData = {};
    }
    getMartchedValue(key: any): any {
        let currentRecord = JSON.parse(this.cacheService.getSessionData('previousSelectedRecord'));
        for (let index = 0; index < Object.keys(currentRecord).length; index++) {
            const element = Object.keys(currentRecord)[index];
            if (element.match(key)) {
                return currentRecord[element];
            }
        }
    }
    routeEventSubscriber: any;
    queryParam: { queryParams: { [x: number]: any; viewId: any } };
    viewType: any;
    removeStateParams() {
        let currentState = JSON.parse(this.cacheService.getLocalData('CurrentSate'));
        if (currentState && currentState.currentActionCriteria) {
            let paramsCopy;
            this.route.queryParams.subscribe((params) => {
                paramsCopy = Utils.getCopy(params);
                Object.keys(currentState.currentActionCriteria).forEach((key) => {
                    if (window.location.href.match(key)) {
                        delete paramsCopy[key];
                    }
                });
            });
            let href = Utils.getCurrentUrl();
            href = href.split('?')[0] + '?';
            Object.keys(paramsCopy).forEach((key) => {
                if (href.match(/=/)) {
                    href = href + '&' + key + '=' + paramsCopy[key];
                } else {
                    href = href + key + '=' + paramsCopy[key];
                }
            });
            if (Utils.getCurrentUrl() != href) {
                href = href.split('#')[1];
                this.location.go(href);
                this.cacheService.removeLocalData('CurrentSate');
            }
        }
    }
    deleteNestedCriteria(context: any) {
        if (context && context.criteria && !context.criteria.criteria) {
            delete context.criteria;
        } else {
            this.deleteNestedCriteria(context.criteria);
        }
    }
    /**
     * checks for the filter to focus after filtered datasource is updated in grid
     * @param ref :reference of the DataUtilViewComponent
     */
    public checkFilterToFocus(ref: DataUtilViewComponent, element) {
        if (element?.focusIn) {
            element.focusIn();
        }
    }
    getNestedViewId(context): any {
        if (context.criteria) {
            return this.getNestedViewId(context.criteria);
        } else {
            return context.viewId;
        }
    }
    addRouterFilters(currentState, filters) {
        let filterKeys;
        filterKeys =
            currentState && currentState['currentActionCriteria']
                ? currentState['currentActionCriteria']
                : undefined;
        this.route.queryParams.subscribe((params) => {
            let recordKey = [];
            let queryParams = Object.keys(params);
            queryParams.forEach((key) => {
                if (filterKeys) {
                    Object.keys(filterKeys).forEach((filterkey) => {
                        if (key.match(filterkey)) {
                            recordKey.push(filterkey);
                        }
                    });
                } else if (window.location.href.match(/_id/) && key.match(/_id/)) {
                    recordKey.push(key);
                }
            });

            if (recordKey && recordKey.length) {
                recordKey.forEach((key) => {
                    filters.push({
                        CodeElement: key,
                        CodeFilterType: 'Text',
                        CodeSubField: key,
                        CodeValue: {
                            Equals: params[key]
                        }
                    });
                });
            }
        });
    }

    createSearchRequetObj(viewId, filters, sortObj, groupBy, isTreeTable, context, metaData) {
        let meta = {};
        //let criteria = {};
        meta['viewId'] = viewId;
        let criteria = Utils.getCopy(context);
        if (Utils.isObjectEmpty(criteria)) {
            criteria = {};
        }
        if (sortObj && sortObj.length) {
            criteria['sortBy'] = sortObj;
        }
        if (groupBy && groupBy.length) {
            criteria['groupBy'] = groupBy;
        }
        delete criteria.viewId;
        // if (columnFilter) {
        //   criteria["columnFilter"] = Utils.getOnlyIds(columnFilter);
        // }
        let _selectedFilters;
        if (filters && typeof filters == 'object') {
            _selectedFilters = Object.values(filters);
        }
        criteria['filters'] = _selectedFilters;
        criteria['isTreeView'] = isTreeTable;
        if (metaData && metaData.criteria) {
            criteria['customCriteria'] = metaData.criteria;
        }
        return { meta: meta, criteria: criteria };
    }
    processData(dataSource, columns) {
        let codeDisplayColumns = {};
        let headers = [];
        if (!Utils.isArrayEmpty(columns)) {
            columns.forEach((element) => {
                if (!Utils.isArrayEmpty(element.options) && element.CodeDisplay) {
                    codeDisplayColumns[element.CodeCode] = element.CodeDisplay;
                }
                headers.push(element.CodeCode);
            });
        }
        dataSource = dataSource.map((record) => {
            let obj = {};
            headers.forEach((header) => {
                if (record[header] && Array.isArray(record[header])) {
                    obj[header] = '';
                    record[header].forEach((data) => {
                        let displayedData = '';
                        if (codeDisplayColumns[header]) {
                            displayedData = data[codeDisplayColumns[header]];
                        } else {
                            displayedData = data['CodeDescription']
                                ? data['CodeDescription']
                                : data['CodeCode'];
                        }
                        obj[header] = obj[header] + displayedData.toString() + ',';
                    });
                    obj[header] = obj[header].slice(0, -1);
                } else if (record[header] && typeof record[header] === 'object') {
                    if (codeDisplayColumns[header]) {
                        obj[header] = record[header][codeDisplayColumns[header]];
                    } else {
                        obj[header] = record[header]['CodeDescription']
                            ? record[header]['CodeDescription']
                            : record[header]['CodeCode'];
                    }
                } else {
                    obj[header] = record[header];
                }
            });
            return obj;
        });
        return dataSource;
    }
    exportToCSV(dataSource: any, CodeDescription: any) {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(dataSource);
            var csv = xlsx.utils.sheet_to_csv(worksheet);
            const data: Blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            import('file-saver').then((FileSaver) => {
                FileSaver.saveAs(
                    data,
                    CodeDescription + '_export_' + new Date().getTime() + '.csv'
                );
            });
        });
    }
    rowSelect: boolean = true;
    parentViewID: any;
    constructor(
        private oauthService: OAuthService,
        private toastService: ToastService,
        private cacheService: CacheService,
        private route: ActivatedRoute,
        private router: Router,
        private ruleEngine: RuleEngineService,
        private location: Location,
        private globalPageMappings: PageMappingService,
        private translationService: TranslateService,
        private titleService: Title,
        private actionService: UIActionService
    ) {}
    public isMenuClick: boolean;
    public tableCellComponentRef: TableCellComponent;
    currentViewId: any;
    findNestedViewId(criteria: any): any {
        if (criteria.criteria) {
            return this.findNestedViewId(criteria.criteria);
        } else {
            return criteria.viewId;
        }
    }
    // getFilterPaneHidden(viewAlias) {
    //     let gridMetaData = this.getSessionGridMetaData();
    //     if (gridMetaData && gridMetaData[viewAlias]) {
    //         return gridMetaData[viewAlias].filterStatus.filterPaneHidden;
    //     } else {
    //         return false;
    //     }
    // }
    getRouteURL(currentRecord, currentPage, currentView, currentActionCriteria, context) {
        let currentState = {};
        if (context.criteria) {
            currentState['context'] = context;
        }
        let url = Utils.getCurrentUrl();
        Object.keys(currentActionCriteria).forEach((key) => {
            if (url.match(key)) {
                url = url.split('&' + key)[0];
            }
            url = url + '&' + key + '=' + currentRecord[key];
        });
        currentState['currentView'] = currentView;
        currentState['currentActionCriteria'] = currentActionCriteria;
        this.cacheService.setLocalData('CurrentSate', JSON.stringify(currentState));
        return url;
    }
    public handleUpdate(): TableCellComponent {
        if (this.tableCellComponentRef) {
            this.tableCellComponentRef.currentViewId = this.currentViewId;
            return this.tableCellComponentRef;
        } else {
            return null;
        }
    }

    // setFilterPaneHidden(viewAlias) {
    //     let gridMetaData = this.getSessionGridMetaData();
    //     let filterStatus = {
    //         isfilterPaneVisible: true,
    //         filterPaneHidden: true,
    //         filterPanePinned: false
    //     };
    //     gridMetaData[viewAlias]['filterStatus'] = filterStatus;
    //     this.cacheService.setSessionData('gridMetaData', JSON.stringify(gridMetaData));
    // }

    // getFilterPanePinned(viewAlias) {
    //     let gridMetaData = this.getSessionGridMetaData();
    //     if (gridMetaData && gridMetaData[viewAlias]) {
    //         return gridMetaData[viewAlias].filterStatus.filterPanePinned;
    //     } else {
    //         return false;
    //     }
    // }

    getIsFilterPaneVisible(viewAlias) {
        let gridMetaData = this.getSessionGridMetaData();
        if (gridMetaData && gridMetaData[viewAlias]) {
            return gridMetaData[viewAlias].filterStatus.isFilterPaneVisible;
        } else {
            return false;
        }
    }

    private getSessionGridMetaData() {
        if (this.cacheService.getSessionData('gridMetaData')) {
            return JSON.parse(this.cacheService.getSessionData('gridMetaData'));
        } else {
            return null;
        }
    }

    setIsMenuClick(menuClick) {
        this.isMenuClick = menuClick;
    }

    getIsMenuClick() {
        return this.isMenuClick;
    }

    buildAndGetTabName(selectRecord) {
        let tabName = '';
        for (let index = 0; index < this.fieldTypeToDisplayTabName.length; index++) {
            const field = this.fieldTypeToDisplayTabName[index];
            if (selectRecord && selectRecord[field]) {
                tabName = tabName + selectRecord[field];
            } else if (selectRecord && selectRecord.data && selectRecord.data[field]) {
                tabName = tabName + selectRecord.data[field];
            }
            if (this.fieldTypeToDisplayTabName[index + 1]) {
                tabName = tabName + '-';
            }
        }
        return tabName;
    }
    public fieldTypeToDisplayTabName: any[] = [];
    setTabDetails(fieldTypes: any) {
        fieldTypes = Utils.getCodeDisplay(fieldTypes);
        this.fieldTypeToDisplayTabName = [];
        if (fieldTypes && fieldTypes.length) {
            fieldTypes.forEach((record) => {
                this.fieldTypeToDisplayTabName.push(record['CodeCode']);
            });
        }
    }

    public SetDisplayTabEmpty(clickFromMenu?) {
        this.fieldTypeToDisplayTabName = [];
    }

    public getChildHeaderOptions(selectedColumn, value) {
        let options;
        let dynamicOptions = selectedColumn.dynamicOptions;
        if (!Utils.isArrayEmpty(dynamicOptions)) {
            options = Utils.getCopy(dynamicOptions);
            let optionIndex = Utils.getIndexByProperty(options, '_id', value._id);
            return options[optionIndex].Children;
        } else {
            return null;
        }
    }
    getAvailableActions(column) {
        return Utils.getArrayOfProperties(column.CodeActions, 'CodeUIAction');
    }
    removeClick(list) {
        return Utils.removeElement(list, StandardCodes.UI_ACTION_CLICK);
    }
    loadContainer(field) {
        if (!field.UIContainer) {
            this.toastService.addErrorMessage(
                StandardCodes.EVENTS.CONFIGURATION_ERROR,
                '104 - Configuration Error'
            );
            console.error('No UI Container Configured');
        } else {
            if (!field.CodeUILocation) {
                field.CodeUILocation = '';
            }
            // this.menuService.loadContainer(field, null);
        }
    }
    public getCreateRecordObj(currentRecord, currentContainerID, selectedRow, createChild?) {
        let eventData = {
            data: {},
            parentRecord: currentRecord
                ? currentRecord.parentRecord
                    ? currentRecord.parentRecord
                    : null
                : null
        };
        if (selectedRow) {
            //  eventData.data[this.viewSelector] = this.selectedRow[this.viewSelector]
            let viewSelectors = this.globalPageMappings.getViewSelectors(currentContainerID);
            let selectorObject = Utils.getSelectorObject(selectedRow, viewSelectors);
            eventData.data = selectorObject;
        }
        (eventData.data['mode'] = CREATE_MODE), (eventData.data['createChild'] = createChild);

        return eventData;
    }

    public checkForRowSelectUIAction(codeActions) {
        let allActions = Utils.getArrayOfProperties(codeActions, 'CodeUIAction');
        let isRowSelect = Utils.arrayHasProperty(allActions, StandardCodes.UI_ACTION_ROW_SELECT);
        return isRowSelect;
    }

    public checkForRowDoubleSelectUIAction(codeActions) {
        let allActions = Utils.getArrayOfProperties(codeActions, 'CodeUIAction');
        let isRowSelect = Utils.arrayHasProperty(allActions, StandardCodes.UI_ACTION_DOUBLE_CLICK);
        return isRowSelect;
    }
    public getCommunicationId(currentView) {
        if (currentView.CodeElement) {
            return currentView.CodeAlias ? currentView.CodeAlias : currentView.CodeElement;
        } else if (currentView.SettingViewId) {
            return currentView.CodeAlias ? currentView.CodeAlias : currentView.SettingViewId;
        }
    }

    addViewId(newviewId: any) {
        let navigationUrl = this.router.routerState.snapshot.url.substring(
            0,
            this.router.routerState.snapshot.url.indexOf('viewId=')
        );
        if (navigationUrl.includes('%20')) {
            navigationUrl = navigationUrl.replace(/%20/g, ' ');
        }
        if (navigationUrl) {
            navigationUrl =
                navigationUrl + (navigationUrl.match('\\?') ? 'viewId=' : '?viewId=') + newviewId;
            this.location.go(navigationUrl);
        }
    }

    getDefaultView(viewList, containerID) {
        let viewCode;
        //  viewCode = this.cacheService.getSessionData(containerID);
        this.routeEventSubscriber = this.route.queryParams.subscribe((params) => {
            viewCode = params['viewId'];
        });
        let defaultView = viewList[0];
        if (viewCode) {
            let defaultViews = viewList.filter((view) => {
                return viewCode === view.CodeElement;
            });
            if (!Utils.isArrayEmpty(defaultViews)) {
                defaultView = defaultViews[0];
            }
        }
        this.cacheService.removeSessionData(containerID);
        return defaultView;
    }

    public createBatchReq(records, dataObject, parentId, viewId) {
        let batchRequests = [];

        records.forEach((record) => {
            let recordParent = Utils.getArrayOfProperties(record.Parents, '_id');
            let parents = recordParent ? recordParent : [];
            if (recordParent.indexOf(parentId) < 0) {
                parents.push(parentId);
            } else {
                return;
            }
            let req = {
                type: dataObject,
                _id: record._id,
                meta: {
                    viewId: viewId
                },
                payload: {
                    Parents: parents
                }
            };
            batchRequests.push(req);
        });
        return batchRequests;
    }
    buildNestedFetchContainerReqObject(field, context, currentRecord) {
        let req = {};
        if (context['criteria']) {
            let reqobj = {
                criteria: {
                    dataObjectCodeCode: context.dataObjectCodeCode,
                    _id: context.id,
                    criteria: this.buildNestedFetchContainerReqObject(
                        field,
                        context['criteria'],
                        currentRecord
                    )
                }
            };
        } else {
            req = {
                dataObjectCodeCode: context['dataObjectCodeCode'],
                _id: currentRecord['_id']
            };
        }
        return req;
    }
    buildFetchContainerReqObject(field, currentRecord, context) {
        let req = {};
        if (context['criteria']) {
            req = {
                meta: {
                    viewId: this.currentViewId,
                    userId: 'alok'
                },
                criteria: {
                    dataObjectCodeCode: context.dataObjectCodeCode,
                    _id: context.id,
                    criteria: this.buildNestedFetchContainerReqObject(
                        field,
                        context['criteria'],
                        currentRecord
                    )
                },
                userId: 'alok'
            };
        } else {
            req = {
                criteria: {
                    dataObjectCodeCode: context.dataObjectCodeCode,
                    _id: currentRecord._id
                },
                meta: {
                    viewId: this.currentViewId,
                    userId: 'alok'
                },
                userId: 'alok'
            };
        }
        return req;
    }
    buildPayLoad(field): any {
        if (
            field.CodeFieldType === 'Password' ||
            field.CodeFieldType === 'Data' ||
            field.CodeFieldType === 'Color' ||
            field.CodeFieldType === 'Heading' ||
            field.CodeFieldType === 'text'
        ) {
            return field.CodeValue;
        } else if (field.CodeFieldType === 'Number') {
            return parseFloat(field.CodeValue);
        } else if (field.options && field.options.length > 0) {
            if (field.CodeValue._id) {
                return field.CodeValue._id;
            } else if (field.CodeValue instanceof Array) {
                let value: any = [];
                field.CodeValue.forEach((element) => {
                    value.push(element._id);
                });
                return value;
            } else {
                return field.CodeValue;
            }
        } else {
            return field.CodeValue;
        }
    }

    buildReqObject(field, currentRecord, context) {
        let req = {};
        if (context['criteria']) {
            // let relationship = {}
            req['type'] = context.dataObjectCodeCode;
            req['_id'] = context.id;
            let obj = this.buildReqObject(field, currentRecord, context['criteria']);
            let relationships = [];
            relationships.push(obj);
            req['relationships'] = relationships;
        } else {
            req = {
                type: context['dataObjectCodeCode'],
                _id: currentRecord._id || context['_id'],
                meta: {
                    viewId: this.currentViewId || context['viewId'],
                    userId: 'alok'
                },
                payload: {}
            };
            if (!Utils.isArrayEmpty(field)) {
                field.forEach((ele) => {
                    req['payload'][ele.CodeCode] = this.buildPayLoad(ele);
                });
            } else {
                req['payload'][field.CodeCode] = this.buildPayLoad(field);
            }
        }
        return req;
    }

    public buildUpdateRequestObject(currentContext, requestObj, currentView, ref) {
        let req = {};
        if (currentContext) {
            if (currentContext['criteria']) {
                req = this.actionService.getUpdateNewReqObj(req, currentContext);
                requestObj = this.actionService.getUpdateNestedReq(
                    req,
                    currentContext,
                    requestObj.payload,
                    currentView,
                    false
                );
            } else {
                requestObj = this.actionService.getUpdateReqObj(
                    req,
                    currentContext,
                    requestObj.payload,
                    ref
                );
            }
        } else {
            requestObj = this.actionService.getUpdateReqObj(
                req,
                { dataObjectCodeCode: currentView.CodeDataObject },
                requestObj.payload,
                ref
            );
        }
        return requestObj;
    }

    public getLookupType(actions, action) {
        let lookupAction = Utils.getElementsByProperty(actions, 'CodeUIAction', action);
        return lookupAction && lookupAction[0].Task.CodeCode === StandardCodes.TASK_LOAD_LOOKUP;
    }
    public saveAsExcelFile(buffer: any, fileName: string): void {
        import('file-saver').then((FileSaver) => {
            let EXCEL_TYPE =
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            let EXCEL_EXTENSION = '.xlsx';
            const data: Blob = new Blob([buffer], {
                type: EXCEL_TYPE
            });
            FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
        });
    }
    public exportToExcel(dataSource, name) {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(dataSource);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            this.saveAsExcelFile(excelBuffer, name);
        });
    }
    createViewRequetObj(viewId, filters, sortObj, groupBy, isTreeTable, context, metaData) {
        let meta = {};
        //let criteria = {};
        meta['viewId'] = viewId;
        //let context = this.contextService.getContextRecord(contextKey);
        let criteria = {} as ISearchCriteria;

        if (!Utils.isObjectEmpty(criteria)) {
            criteria = Utils.getCopy(context);
        }
        if (sortObj && sortObj.length) {
            criteria['sortBy'] = sortObj;
        }
        if (groupBy && groupBy.length) {
            criteria['groupBy'] = groupBy;
        }
        delete criteria['viewId'];
        criteria.filters = filters;

        criteria.isTreeView = isTreeTable;
        if (metaData && metaData.criteria) {
            criteria.customCriteria = metaData.criteria;
        }

        return { meta: meta, criteria: criteria };
    }
    getViewSelectorObject(selectedRecrod, containerID) {
        let viewSelectors = this.globalPageMappings.getViewSelectors(containerID);
        let obj = {};
        let cells = Object.keys(selectedRecrod);
        cells.forEach((cell) => {
            if (cell.indexOf(viewSelectors) >= 0) {
                obj[cell] = selectedRecrod[cell];
            }
        });
        return obj;
    }

    public createChildrenRequetObj(viewId, filters, columnFilter, sortObj, recordId, sortState) {
        let requestObject = {};
        requestObject['viewId'] = viewId;
        requestObject['filters'] = filters;
        requestObject['id'] = recordId;
        if (columnFilter) {
            requestObject['columnFilter'] = Utils.getOnlyIds(columnFilter);
        }
        if (sortObj && sortObj.length) {
            requestObject['sortBy'] = sortState;
        }
        return requestObject;
    }
    public buildParentRootContext(children: any, recordId: any, parentsRoot: any): any {
        children.forEach((record) => {
            if (!(record.data['ParentRoot'] instanceof Array)) {
                record.data['ParentRoot'] = [];
            }
            if (parentsRoot && parentsRoot.length) {
                for (let index = 0; index < parentsRoot.length; index++) {
                    if (record.data['ParentRoot'].indexOf(parentsRoot[index]) < 0) {
                        record.data['ParentRoot'].push(parentsRoot[index]);
                    }
                }
            }
            if (record.data['ParentRoot'].indexOf(recordId) < 0) {
                record.data['ParentRoot'].push(recordId);
            }
        });
        return children;
    }

    public getChildIndex(array, value, property) {
        if (!Utils.isArrayEmpty(array)) {
            return array.findIndex((elem) => {
                return elem.data[property] === value;
            });
        } else {
            return -1;
        }
    }
    async getViewsByType(record, views) {
        let viewsByType = [];
        //  let views = this.cache.getSessionData("DesignerViews");
        //   let pages = JSON.parse(views)
        let tempRecord = Object.assign({}, record);
        this.getProcessedObject(tempRecord);
        viewsByType = await this.ruleEngine.processSettings(tempRecord, views, 'Form');
        return viewsByType;
    }
    async checkLoadForms(currentRecord, prevRecord, views, eventData) {
        if (Utils.isObjectEmpty(prevRecord)) {
            return true;
        }
        let currentView = await this.getViewsByType(currentRecord, views);
        eventData['views'] = currentView;
        let prevViews = await this.getViewsByType(prevRecord, views);
        return !Utils.isObjectsEqual(currentView, prevViews);
    }

    public getProcessedObject(record) {
        let keys = Object.keys(record);
        keys.forEach((key) => {
            if (record[key] instanceof Object && !(record[key] instanceof Array)) {
                record[key] = record[key]['CodeCode'] ? record[key]['CodeCode'] : record[key];
            }
        });
    }
    public processGroupFitlers(filter) {
        if (filter && filter['children']) {
            let childFilters = [];
            filter['children'].forEach((chilld) => {
                chilld.CodeFilterType = 'Text';
                childFilters.push(
                    Utils.createContainsTextFilter(chilld, filter.value, 'CodeDescription')
                );
            });

            return { Or: childFilters };
        }
    }
    public getSortOrder(column) {
        if (!column.sorted) {
            column.sorted = 'ASC';
        } else if (column.sorted === 'ASC') {
            column.sorted = 'DESC';
        } else if (column.sorted === 'DESC') {
            column.sorted = undefined;
        }
        return column;
    }

    public getGroupShow(column, type) {
        if (column.showGroup && type.startsWith('Group')) {
            switch (column.showGroup.code) {
                case 'BT':
                    return type === 'GroupShow' ? 'Header,Footer' : 'Header,Footer';
                case 'B':
                    return type === 'GroupShow' ? 'Header,Footer' : '';
                case 'H':
                    return type === 'GroupShow' ? 'Header' : '';
                case 'F':
                    return type === 'GroupShow' ? 'Footer' : '';
                case 'N':
                    return type === 'GroupShow' ? '' : '';
                case 'HTF':
                    return type === 'GroupShow' ? 'Header,Footer' : 'Header';
                case 'HT':
                    return type === 'GroupShow' ? 'Header' : 'Header';
                case 'HFT':
                    return type === 'GroupShow' ? 'Header,Footer' : 'Footer';
                case 'FT':
                    return type === 'GroupShow' ? 'Footer' : 'Footer';
                case 'ShowTotal':
                    return 'Show';
                case 'Show':
                    return type === 'GroupShow' ? 'Show' : 'Hide';
                default:
                    return column.showGroup.code;
            }
        } else if (column.totalCalc) {
            if (column.totalCalc) {
                return column.totalCalc.code;
            }
        }
        return '';
    }

    public reorderObjectBasedOnAnother(objectToBeReordered, objectOrderBasedOn) {
        let result = [];
        objectOrderBasedOn.forEach((element) => {
            let found = false;
            objectToBeReordered = objectToBeReordered.filter(function (item) {
                if (!found && item.CodeCode == element.CodeCode) {
                    result.push(element);
                    found = true;
                    return false;
                } else {
                    return true;
                }
            });
        });
        return result;
    }

    public setPropertyToDisabled(disabled, array, option, limit?) {
        if (option) {
            if (Utils.isArrayEmpty(option) && array) {
                let obj = array.find((item) => item.CodeCode === option.CodeCode);
                if (obj) {
                    obj['disabled'] = disabled;
                }
            } else {
                if (!limit && array) {
                    option.forEach((o) => {
                        let obj = array.find((item) => item.CodeCode === o.CodeCode);
                        if (obj && !limit) {
                            obj['disabled'] = disabled;
                        }
                    });
                } else {
                    if (array) {
                        array.forEach((o) => {
                            let obj = option.find((item) => item.CodeCode === o.CodeCode);
                            if (!obj) {
                                o['disabled'] = disabled;
                            }
                        });
                    }
                }
            }
        }
        return array;
    }

    public setReportSorting(report, paramName, sortOrder) {
        let component = report.getComponentByName(paramName);
        if (component) {
            switch (sortOrder) {
                case 'DESC': {
                    component.sortDirection = 1;
                    break;
                }
                case 'ASC': {
                    component.sortDirection = 0;
                    break;
                }
                default: {
                    component.sortDirection = 2;
                    break;
                }
            }
        }
    }

    public setReportSummary(report, summaryName, calcType, dataValue?) {
        let sum = report.getComponentByName(summaryName);
        if (sum) {
            switch (calcType) {
                case 'Sum': {
                    sum.summary = 1;
                    break;
                }
                case 'Average': {
                    sum.summary = 2;
                    break;
                }
                case 'Min': {
                    sum.summary = 3;
                    break;
                }
                case 'Max': {
                    sum.summary = 4;
                    break;
                }
                case 'Count': {
                    sum.summary = 5;
                    break;
                }
                case 'CountDistinct': {
                    sum.summary = 6;
                    break;
                }
                default: {
                    // default on count
                    sum.summary = 5;
                    break;
                }
            }
            if (dataValue) {
                sum.val = '{Data.' + dataValue + '}';
            }
        }
    }

    public removeReportComponent(report, componentName) {
        let tempComp = report.getComponentByName(componentName);
        if (tempComp) {
            tempComp.parent.components.remove(tempComp);
        }
    }

    public getRowHeight(layoutSize) {
        //  if (layoutSize !== undefined && layoutSize) {
        // this.customisedLayoutSize = layoutSize;
        let rowHeight = layoutSize.CodeCode;
        switch (layoutSize.CodeCode) {
            case StandardCodes.TASK_GRID_SIZE_LARGE: {
                rowHeight = 35;
                break;
            }
            case StandardCodes.TASK_GRID_SIZE_MEDIUM: {
                rowHeight = 30;
                break;
            }
            case StandardCodes.TASK_GRID_SIZE_VERY_SMALL: {
                rowHeight = 20;
                break;
            }
            default: {
                rowHeight = 25;
                break;
            }
        }
        return rowHeight;
        //        }
    }
    public updateSelectedRow(selectedRow, row, selectedColumns) {
        if (Utils.verifyCalculatedField(selectedColumns)) {
            for (let key in row) {
                selectedRow[key] = key ? row[key] : '';
            }
        } else {
            for (let key in row) {
                selectedRow[key] = row[key];
            }
        }
        return selectedRow;
    }
    public getStiColumnObj(column) {
        return {
            Label: column.CodeDescription,
            DataType: column.CodeDataType,
            TotalCalc: this.getGroupShow(column, 'Column'),
            relationId: column._id,
            SortOrder: column.sorted || 'ASC'
        };
    }
    public getStiGroupObj(groupColumn, column, i) {
        return {
            Column: 'Column' + (i + 1),
            Show: this.getGroupShow(groupColumn, 'GroupShow'),
            ShowTotal: this.getGroupShow(groupColumn, 'GroupShowTotal'),
            relationId: column._id
        };
    }
    public getStiSummaryObj(sum, i) {
        return {
            Label: sum.CodeDescription,
            Value: 'Column' + (i + 1),
            DataType: sum.CodeDataType,
            TotalCalc: sum['totalCalc']['code'] || ''
        };
    }
    public getStiSummaryRowObj(sum, i) {
        return {
            Label: sum.CodeDescription,
            Value: 'Row' + (i + 1),
            DataType: sum.CodeDataType,
            TotalCalc: sum['totalCalc']['code'] || ''
        };
    }
    public getStiRowObj(row) {
        return {
            Label: row.CodeDescription,
            DataType: row.CodeDataType,
            TotalCalc: this.getGroupShow(row, 'Column'),
            relationId: row._id,
            SortOrder: row.sorted || 'ASC'
        };
    }
    public getStiTotalSummaryObj(sum) {
        return {
            Label: sum.CodeDescription,
            Value: sum.CodeCode,
            DataType: sum.CodeDataType,
            TotalCalc: sum['totalCalc']['code'] || ''
        };
    }

    public getColumnToBeAlteredCount(
        alteredSize,
        currentSize,
        columnWidth,
        intialWindowSize,
        displayedColumns,
        intialColumnWidth
    ) {
        if (currentSize >= intialWindowSize) {
            return displayedColumns.length * -1;
        } else {
            if (alteredSize < currentSize) {
                columnWidth = intialColumnWidth;
            }
            let alteredColumns = Math.round(alteredSize / columnWidth);
            let currentColumns = Math.round(currentSize / columnWidth);

            return alteredColumns - currentColumns;
        }
    }
    public getContainerSearchReq(
        contextService,
        currentPage,
        sortState,
        metaData,
        viewId,
        filters,
        sortObj,
        groupBy,
        isTreeTable,
        contextKey,
        action?: any
    ) {
        let meta = {};
        //let criteria = {};
        meta['viewId'] = viewId;
        if (action) {
            meta['actionId'] = action;
        }
        let context = contextService.getContextRecord(
            contextKey + contextService.getRootViewMap(contextKey)
        );
        let currentState = JSON.parse(this.cacheService.getLocalData('CurrentSate'));
        if (currentState && currentState.context) {
            context = currentState.context;
            contextService.setContextRecord(
                currentPage.contextKey + contextService.getRootViewMap(contextKey),
                context
            );
            meta['viewId'] = this.getNestedViewId(context);
            this.deleteNestedCriteria(context);
            delete currentState.context;
            this.cacheService.setLocalData('CurrentSate', JSON.stringify(currentState));
        }
        let criteria = Utils.getCopy(context);

        if (Utils.isObjectEmpty(criteria)) {
            criteria = {};
        }
        if (sortObj && sortObj.length) {
            criteria['sortBy'] = sortState;
        }
        if (groupBy && groupBy.length) {
            criteria['groupBy'] = groupBy;
        }
        delete criteria.viewId;

        let _selectedFilters;
        if (filters && typeof filters == 'object') {
            _selectedFilters = Object.values(filters);
        }
        criteria['filters'] = _selectedFilters;

        criteria['isTreeView'] = isTreeTable;
        if (metaData && metaData.criteria) {
            criteria['customCriteria'] = metaData.criteria;
        }
        this.addRouterFilters(currentState, filters);
        let request = { meta: meta, criteria: criteria };
        this.appendNamedParameters(request, metaData);
        return request;
    }
    public setTabName(selectRecord, currentView) {
        if (currentView && currentView.isDashboard) {
            return;
        }
        let tabName = this.buildAndGetTabName(selectRecord);
        let existingTabName = this.titleService.getTitle();
        if (tabName !== '') {
            existingTabName = Utils.removeStringInsideBracket(existingTabName);
            existingTabName = existingTabName + ' (';
            existingTabName = existingTabName + tabName;
            existingTabName = existingTabName + ')';
            this.titleService.setTitle(existingTabName);
        } else {
            this.titleService.setTitle(existingTabName);
        }
    }

    /**
     * adjusts the grid height for the virtual scroll feature
     *
     * @param gridInstance : instance of the gridComponent
     * @param currentViewId : currentView _id which is the class name to know the height
     * @param isHeaderVisible : flag to determine the header visibility
     * @param isFilterVisible :  flag to determine the filter visibility
     * @param rowHeight : each row height of the grid
     */
    public setVirtualGridHeight(
        gridInstance,
        currentViewId,
        isHeaderVisible,
        isFilterVisible,
        rowHeight,
        groupBy?
    ) {
        let adjustedHeight = 0;
        if (isFilterVisible) {
            adjustedHeight = rowHeight;
            adjustedHeight = adjustedHeight + 8;
        }
        if (isHeaderVisible) {
            adjustedHeight = adjustedHeight + rowHeight;
            adjustedHeight = adjustedHeight + 8;
        }
        if (groupBy) {
            adjustedHeight = adjustedHeight + 34;
        }
        let actualHeight = $('.data-view--' + currentViewId).height();
        gridInstance.height = actualHeight - adjustedHeight + 'px';
        setTimeout(() => {
            let height = $('.data-view--' + currentViewId).height();
            if (actualHeight !== height) {
                gridInstance.height = height - adjustedHeight + 'px';
            }
        }, 1000);
    }
    public getHttpWithToken() {
        let selectedLanguage = JSON.parse(this.cacheService.getSessionData('language'));
        return [
            { 'Accept-Language': selectedLanguage['CodeCode'] },
            { Authorization: `Bearer ${this.oauthService.getAccessToken()}` }
        ];
    }
    /**
     * <p>returns the array of column codecode </p>
     *
     * @param columns : array of columns in grid
     */
    public getColumnCodes(columns) {
        let codes = [];
        columns.forEach((column) => {
            codes.push(column.CodeCode);
        });
        return codes;
    }
    /**
     * <p>returns the aligment of column </p>
     *
     * @param column : metadata of column in grid
     */
    public getColumnAlignment(column) {
        if (column.CodeFieldType === 'Number' || column.CodeFieldType === 'Decimal') {
            return 'Right';
        } else {
            return 'Left';
        }
    }
}
