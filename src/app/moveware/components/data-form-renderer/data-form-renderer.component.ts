import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ContextMenu } from '@syncfusion/ej2-angular-navigations';
import { DialogService, DynamicDialogConfig } from 'primeng';
import { Observable } from 'rxjs';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { CollectionsService, RequestHandler } from 'src/app/moveware/services';
import { GridService } from 'src/app/moveware/services/grid-service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { StandardCodes } from '../../constants/StandardCodes';
import { Broadcaster } from '../../services/broadcaster';
import { CacheService } from '../../services/cache.service';
import { ContextService } from '../../services/context.service';
import { DataFormService } from '../../services/dataform-service';
import { MenuService } from '../../services/menu.service';
import { QuickTextHandlerService } from '../../services/quick-text-handler.service';
import { UIActionService } from '../../services/ui-action.service';
import Utils from '../../services/utils';
export const OPERATION_RULE_UPDATE: String = 'update_rule';
export const PREVIEW_VIEW_ID = StandardCodesIds.PREVIEW_VIEW_ID; //"7b869103-9c88-4cbb-90d7-d58ac15e32d9"//
export const PROFILE_VIEW_ID = StandardCodesIds.PROFILE_VIEW_ID;
@Component({
    selector: 'data-form-renderer',
    templateUrl: './data-form-renderer.component.html',
    styleUrls: ['./data-form-renderer.component.scss']
})
export class DataFormRendererComponent {
    @Input() currentPage: any;
    @Input() currentRecord: any;
    @Input() recordId: any;
    @Input() currentContainerID;
    // @Input() isSubContainer: boolean;
    @Input() nPages: any;
    @Input() nRows: any;
    @Input() nColumns: any;
    @Input() parentViewID: any;
    @Input() viewCode: string;
    @Input() defaultView: any;
    predefinedCodes: any = null;
    private VIEW_UPDATE_MODE: string = 'VIEW_UPDATE_MODE';
    private CREATE_MODE: string = 'CREATE_MODE';

    // private broadcasterEvent: any;
    private selectedRecord: any;
    // private validateEvent: any;
    isLoading: boolean;
    currentView: any;
    //eventSubscriber: any;
    codeActions: any;
    message: string;
    isPageFound: boolean = true;
    private viewMode;
    //private viewSelector: string;
    private uiContainerDesignerTypeCode: String = StandardCodes.CODE_TYPE_UI_CONTAINER;
    private uiDashboardTypeCode: string = 'Dashboard';
    loadUserProfile: boolean = false;

    private originalCurrentViewObj: any;
    private translationContext: any;
    private isPreview: boolean;
    //languageChangeEvent: any;
    resetFormEvent: any;

    @ViewChild('contextmenu') contextMenu: ContextMenu;
    fieldContextMenus = [];
    rightClickAction: any;
    fieldAction: any;
    //showLoaderEvent: any;
    constructor(
        private formService: DataFormService,
        public collectionsService: CollectionsService,

        private toastService: ToastService,
        private actionService: UIActionService,
        private contextService: ContextService,
        private cacheService: CacheService,
        private gridService: GridService,
        private quickTextService: QuickTextHandlerService,
        private broadcaster: Broadcaster,
        private requestHandler: RequestHandler,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private menuService: MenuService
    ) {}
    ngOnInit() {
        this.registerFormResetEvent();

        if (this.currentPage) {
            if (
                this.currentPage &&
                this.currentPage.CodeType !== this.uiContainerDesignerTypeCode &&
                this.currentPage.CodeType !== this.uiDashboardTypeCode
            ) {
                this.currentRecord =
                    this.currentRecord.criteria && this.currentRecord.criteria.currentRecord
                        ? this.currentRecord.criteria.currentRecord
                        : this.currentRecord;
                this.selectedRecord =
                    this.currentRecord.criteria && this.currentRecord.criteria.currentRecord
                        ? this.currentRecord.criteria.currentRecord
                        : this.currentRecord;
                if (this.currentPage.CodeElement === PROFILE_VIEW_ID) {
                    this.loadUserProfile = true;
                } else {
                    this.loadUserProfile = false;
                }
                this.loadView();
            }
            this.registerRowChange();
            // this.registerValidateEvent();
            this.registerFieldAction();
        }
    }

    registerFieldAction() {
        if (this.fieldAction) {
            this.fieldAction.unsubscribe();
        }
        this.fieldAction = this.broadcaster
            .on('fieldAction' + this.currentPage.CodeElement)
            .subscribe((data: object) => {
                this.handleFieldActions(data);
            });
    }
    /**
     * <p> To handle field level actions
     *
     * @param data : Field Level Action event
     */
    handleFieldActions(data) {
        let action = data.action;
        let taskCode = action?.Task?.CodeCode;
        let fieldValue = data.field.CodeValue;
        switch (taskCode) {
            case StandardCodes.LOAD_TEMPLATE:
                if (this.viewMode !== this.VIEW_UPDATE_MODE && fieldValue) {
                    let formMetaData = JSON.parse(
                        this.cacheService.getSessionData(
                            'formMetaData' + this.currentPage.CodeElement
                        )
                    );
                    let value = {
                        criteria: {
                            'Codes._id': fieldValue._id,
                            dataObjectCodeCode: 'Settings'
                        }
                    };
                    this.loadFormData(
                        StandardCodesIds.SETTING_DETAILS_TEMPLATE,
                        null,
                        value,
                        formMetaData,
                        true
                    );
                }
                break;
        }
    }
    registerRightOnFields() {
        if (this.rightClickAction) {
            this.rightClickAction.unsubscribe();
        }
        this.rightClickAction = this.broadcaster
            .on('right-click-on-field' + this.currentView._id)
            .subscribe((data) => {
                this.contextService.currentContextField = data['field'];
                this.fieldContextMenus = [];
                let actions = Utils.getActions(
                    data['field']['CodeActions'],
                    StandardCodes.CONTEXT_MENU
                );
                if (actions && actions.length) {
                    actions.forEach((action) => {
                        let menuItem: any = {
                            field: data['field'],
                            action: action,
                            event: data['inputElement'],
                            value: action.Task.CodeCode,
                            iconCss:
                                action.JSONParameter && action.JSONParameter.Icon
                                    ? action.JSONParameter.Icon
                                    : '',
                            text:
                                action.JSONParameter && action.JSONParameter.CodeDescription
                                    ? action.JSONParameter.CodeDescription
                                    : action.Task.CodeCode
                        };
                        this.fieldContextMenus.push(menuItem);
                    });
                }
                if (this.fieldContextMenus && this.fieldContextMenus.length) {
                    data['event'].preventDefault();
                    this.contextMenu.open(data['event'].pageY, data['event'].pageX);
                }
            });
    }

    /**
     * <p> Triggers while selecting menu item. </p>
     * @param $event is MenuEventArgs which has mouse click event with the menu that is selected
     */
    select($event) {
        console.log($event);
        this.handleContextMenuActions($event);
    }
    /**
     *
     * <p> To handle context menu(right click) action of fields
     * @param event : Context menu event
     */
    handleContextMenuActions(event: any) {
        this.quickTextService.currentRecord = this.currentRecord;
        switch (event.item.value) {
            case StandardCodes.TASK_COPY:
                if (window.isSecureContext) {
                    Utils.copyToClipboard(event.item.event, event.item.field);
                } else {
                    if (window.getSelection().toString()) {
                        document.execCommand('copy');
                    } else {
                        event.item.event.select();
                        document.execCommand('copy');
                    }
                }
                break;

            case StandardCodes.TASK_PASTE:
                event.item.field['isDirty'] = true;
                this.contextService.saveDataChangeState();
                if (window.isSecureContext) {
                    Utils.pasteTextOnCursorPoint(event.item.field, event.item.event);
                } else {
                    event.item.event.focus();
                    document.execCommand('Paste');
                }
                break;
            case StandardCodes.TASK_UNDO:
                event.item.field['isDirty'] = true;
                this.contextService.saveDataChangeState();
                Utils.executeUndoCammandOnEvent(event.item.event);
                break;
            case StandardCodes.TASK_CUT:
                event.item.field['isDirty'] = true;
                this.contextService.saveDataChangeState();
                if (window.isSecureContext) {
                    Utils.copyToClipboard(event.item.event, event.item.field);
                } else {
                    if (window.getSelection().toString()) {
                        document.execCommand('copy');
                    } else {
                        event.item.event.select();
                        document.execCommand('copy');
                    }
                }
                if (typeof event.item.field.CodeValue === 'string') {
                    event.item.field.CodeValue = Utils.removeSelectedText(
                        event.item.field.CodeValue,
                        event.item.event.selectionStart,
                        event.item.event.selectionEnd
                    );
                }
                break;
            case StandardCodes.TASK_REDO:
                event.item.field['isDirty'] = true;
                this.contextService.saveDataChangeState();
                Utils.executeRedoCammandOnEvent(event.item.event);
                break;
            case 'Add Translation':
                let selectedData = this.actionService.getActionDetails(
                    { CodeActions: [Utils.getCopy(event.item.action)] },
                    this.selectedRecord,
                    event.item.action.CodeUIAction,
                    event.item.action.Task.CodeCode
                );

                if (selectedData.IsParentContext) {
                    selectedData.parentContainerId = this.currentPage['contextKey'];
                    selectedData['parentContext'] =
                        this.currentPage['contextKey'] + this.currentView._id;
                }
                this.menuService.loadContainer(
                    selectedData ? selectedData : event.item.action,
                    null,
                    event,
                    null,
                    this.dialog,
                    this.dialogConfig
                );
                break;
            default:
                break;
        }
    }

    /**
     * resets the form to the last saved state
     */
    registerFormResetEvent() {
        if (this.resetFormEvent) {
            this.resetFormEvent.unsubscribe();
        }
        this.resetFormEvent = this.broadcaster
            .on(this.currentPage.CodeElement + '-resetForm')
            .subscribe((data) => {
                // this.dataFields = JSON.parse(
                //     this.cacheService.getSessionData('FormData-' + this.currentRecord._id)
                // );
                this.setDataFields(this, Utils.getCopy(this.formData));
            });
    }
    rowChangeEvent: any;

    private registerRowChange() {
        if (this.rowChangeEvent) {
            this.rowChangeEvent.unsubscribe();
        }
        if (this.currentPage.containerID && this.currentPage.CodeUIContainerDesignerParent) {
            this.rowChangeEvent = this.broadcaster
                .on<string>(
                    this.currentPage.containerID +
                        this.currentPage.CodeUIContainerDesignerParent +
                        'recordChanged'
                )
                .subscribe((event) => {
                    if (
                        (event['data'] &&
                            event['data']['_id'] &&
                            this.currentRecord?._id != event['data']['_id']) ||
                        event['reloadForm']
                    ) {
                        this.currentRecord = event['data'];
                        //this.currentRecord['parentRecord'] = event['parentRecord'];
                        this.renderData();
                    }
                });
        }
    }
    private renderData() {
        this.selectedRecord = this.currentRecord;
        let context = this.contextService.getContextRecord(
            this.currentPage.contextKey + this.currentPage.CodeUIContainerDesignerParent
        );
        let data = JSON.parse(
            this.cacheService.getSessionData('formMetaData' + this.currentPage.CodeElement)
        );

        this.renderViewWithData(
            this.currentPage.CodeElement,
            this.selectedRecord,
            this.selectedRecord.CodeType,
            context,
            data
        );
    }

    private loadView() {
        if (
            (this.currentRecord &&
                this.currentRecord.mode &&
                this.currentRecord.mode !== this.CREATE_MODE) ||
            (this.currentRecord && this.currentRecord.criteria)
        ) {
            this.viewMode = this.VIEW_UPDATE_MODE;
            this.renderView(this.currentPage, this.currentRecord);
        } else if (
            Utils.isObjectEmpty(this.currentRecord) ||
            (this.currentRecord && this.currentRecord.eventType != 'HIDE_CHILDREN')
        ) {
            this.viewMode = this.CREATE_MODE;
            this.selectedRecord = this.currentRecord;
            this.renderView(this.currentPage, this.currentRecord);
        }
        //    this.quickTextService.currentRecord = this.currentRecord;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['currentPage'] &&
            changes['currentPage'].previousValue !== changes['currentPage'].currentValue &&
            !changes['currentPage'].firstChange
        ) {
            if (this.currentPage.CodeType !== this.uiContainerDesignerTypeCode) {
                if (this.currentRecord && this.currentRecord.mode !== this.CREATE_MODE) {
                    this.viewMode = this.VIEW_UPDATE_MODE;
                    this.selectedRecord = Utils.getCopy(this.currentRecord);
                    this.renderView(this.currentPage, this.currentRecord);
                } else if (this.currentRecord && this.currentRecord.eventType != 'HIDE_CHILDREN') {
                    this.viewMode = this.CREATE_MODE;
                    this.renderView(this.currentPage, this.currentRecord);
                }
            }
        }
    }
    formMetaData: any;
    private async renderView(currentPage, currentRecord?: any) {
        let contextKey =
            this.currentPage.contextKey +
            this.contextService.getRootViewMap(this.currentPage.contextKey);
        let context = this.contextService.getContextRecord(contextKey);
        let parentContext = this.contextService.getParentContextDetails(contextKey);
        let parentId = parentContext ? parentContext.parentId : undefined;
        let viewMetaData =
            currentPage.CodeCode != StandardCodes.DYNAMIC_FORM
                ? this.cacheService.getSessionData('formMetaData' + currentPage.CodeElement)
                : undefined;
        if (this.viewMode !== this.CREATE_MODE && viewMetaData) {
            let data = JSON.parse(viewMetaData);
            this.codeActions = data.CodeActions;
            if (data.UIElements && data.UIElementsMetaData && data.UIElementsMetaData.length) {
                this.setData(data, this.currentPage, context);
                if (!context) {
                    context = this.contextService.getContextRecord(contextKey);
                }
                this.renderViewWithData(
                    this.currentPage.CodeElement,
                    this.selectedRecord,
                    this.selectedRecord.CodeType,
                    context,
                    data
                );
            } else {
                this.setData(data, this.currentPage, context);
            }
        } else if (this.viewMode === this.CREATE_MODE && viewMetaData) {
            let view = JSON.parse(viewMetaData);
            this.setData(view, this.currentPage, context);
        } else {
            let viewId = currentPage.CodeElement;
            if (currentRecord) {
                if (this.currentView && this.currentView['UIElementsMetaData']) {
                    this.currentView.UIElementsMetaData = null;
                }
            }
            viewId = this.getDynamicFormViewId(currentPage, viewId);
            let dynamicFormActions = [];
            if (currentPage.CodeCode === StandardCodes.DYNAMIC_FORM && currentPage.CodeActions) {
                dynamicFormActions = currentPage.CodeActions;
            }
            this.collectionsService.loadContainerViewByCode(viewId, parentId).subscribe(
                async (responseData) => {
                    this.cacheService.setSessionData(
                        'formMetaData' + currentPage.CodeElement,
                        JSON.stringify(responseData)
                    );
                    // this.formMetaData = Utils.getCopy(responseData);
                    responseData.CodeActions = [
                        ...(responseData.CodeActions ? responseData.CodeActions : []),
                        ...dynamicFormActions
                    ];

                    this.codeActions = responseData.CodeActions;
                    if (!Utils.isArrayEmpty(this.codeActions)) {
                        this.codeActions.forEach((action) => {
                            if (
                                action.CodeUIAction &&
                                action.Task &&
                                action.Task.CodeCode === StandardCodes.TASK_GET_RECORD
                            ) {
                                this.loadAction = action.Task;
                            }
                        });
                    }
                    if (this.viewMode === this.CREATE_MODE) {
                        let view = JSON.parse(
                            this.cacheService.getSessionData(
                                'formMetaData' + currentPage.CodeElement
                            )
                        );
                        this.setData(view, this.currentPage, context);
                    } else {
                        let data = JSON.parse(
                            this.cacheService.getSessionData(
                                'formMetaData' + currentPage.CodeElement
                            )
                        );
                        if (
                            data.UIElements &&
                            data.UIElementsMetaData &&
                            data.UIElementsMetaData.length
                        ) {
                            this.setData(data, this.currentPage, context);
                            this.renderViewWithData(
                                this.currentPage.CodeElement,
                                this.selectedRecord,
                                this.selectedRecord.CodeType,
                                context,
                                responseData
                            );
                        } else {
                            this.setData(data, this.currentPage, context);
                        }
                    }
                },
                (errorResponse) => {
                    this.toastService.showCustomToast('error', errorResponse);
                }
            );
        }
    }
    /**
     * gets the dynamic form id configured in the Json parameteres
     * @param currentPage : dynmaic form details
     * @param viewId : viewid if any exists
     * @returns the dynamic formid if avaiable
     */
    private getDynamicFormViewId(currentPage: any, viewId: any) {
        if (
            currentPage.CodeCode === StandardCodes.DYNAMIC_FORM &&
            currentPage?.JSONParameter?.criteria?._id
        ) {
            this.quickTextService.setCurrentRecord(this.actionService.dataFields);
            let jsonParameter = Utils.getCopy(currentPage.JSONParameter);
            jsonParameter = this.actionService.getCriteria(this.dataFields, jsonParameter);
            if (jsonParameter && jsonParameter['_id']) {
                viewId = jsonParameter['_id'];
                this.currentPage.CodeElement = viewId;
            }
        }
        return viewId;
    }

    private setData(responseData, currentPage, context) {
        // UIElementsMetaData
        console.log('loading...' + currentPage.CodeCode);
        this.setLoadTemplateAction(responseData);
        if (this.quickTextAction) {
            this.processLoadAction(responseData, context, currentPage);
        } else {
            this.defineContext(responseData, context, currentPage);
        }
    }

    private getTypeFieldValue(_fields) {
        let obj;
        for (const _property in _fields) {
            if (_fields[_property].CodeCode === 'EntityType') {
                obj = _fields[_property];
            }
        }
        if (obj) {
            return obj.CodeCode;
        }
    }
    public dataFields: any;
    public quickTextAction: any;

    private setLoadTemplateAction(formMetaData) {
        if (formMetaData) {
            let _loadAction = Utils.getElementsByProperty(
                formMetaData['CodeActions'],
                'CodeUIAction',
                'On Load'
            );
            if (
                _loadAction &&
                _loadAction.length &&
                _loadAction[0]['Task'] &&
                _loadAction[0]['Task']['CodeCode'] === StandardCodes.TASK_LOAD_QUICK_TEXT
            ) {
                this.quickTextAction = _loadAction[0];
            }
        }
    }

    private processLoadAction(formMetaData, context, currentPage) {
        let ref = this;
        if (this.selectedRecord && this.selectedRecord._id) {
            this.collectionsService
                .loadTemplate(this.selectedRecord._id)
                .subscribe(async (responseData) => {
                    if (responseData) {
                        // this.viewMode = StandardCodes.VIEW_UPDATE_MODE;
                        this.cacheService.setSessionData(
                            'templateId.' + formMetaData['_id'],
                            JSON.stringify(responseData)
                        );
                        let elements = formMetaData['UIElements'];
                        for (let key in elements) {
                            let element = elements[key];
                            let action = element['CodeActions'] || [];
                            if (this.quickTextAction) {
                                action.push(this.quickTextAction);
                            }
                            element['CodeActions'] = action;
                        }
                        let _responseBody = responseData;
                        ref.setDataFields(ref, _responseBody);
                        ref.copyOfDataFields = Utils.getCopy(ref.dataFields);
                        // this.defineContext(formMetaData, context, currentPage);
                    }
                });
        }
        //else {
        this.defineContext(formMetaData, context, currentPage);
        //}
    }
    copyOfDataFields: any;
    private defineContext(responseData, context, currentPage) {
        let collectionView = responseData;
        delete collectionView.CodeActions;
        let _previousView = Utils.getCopy(this.currentView);
        if (collectionView.UIElementsMetaData) {
            let tempFields = JSON.parse(JSON.stringify(collectionView.UIElementsMetaData));
            collectionView.UIElementsMetaData = [];
            collectionView.viewType = collectionView.CodeType
                ? collectionView.CodeType
                : 'Data Form';
            collectionView.dataObjectId = responseData.CodeDataObject;
            this.currentView = collectionView;
            this.registerRightOnFields();
            this.currentView.UIElementsMetaData = tempFields;
            this.currentView.currentType = this.getTypeFieldValue(collectionView.UIElements);
            this.originalCurrentViewObj = Utils.getCopy(collectionView);
            Utils.appendStyles(collectionView.CSSStyles, collectionView._id);
            if (
                !context &&
                this.currentRecord._id &&
                ((_previousView && !(_previousView.CodeType == this.currentView.CodeType)) ||
                    !_previousView)
            ) {
                this.currentView.baseViewCode = this.currentRecord.baseViewCode;
                this.currentView.createContext = true;
                this.contextService.defineContext(
                    this.currentRecord,
                    this.currentView,
                    currentPage,
                    this.currentContainerID,
                    {}
                );
            }
        } else {
            collectionView.viewType = collectionView.CodeType
                ? collectionView.CodeType
                : 'Data Form';
            this.currentView = collectionView;
        }
        // this.registerValidateEvent();
    }
    private loadAction: any;
    private renderViewWithData(
        _viewId: string,
        _currentRecordId: string,
        _type: string,
        context,
        formMetaData
    ) {
        let onLoadActions;
        if (this.codeActions && this.codeActions.length >= 1) {
            onLoadActions = Utils.getElementsByProperty(
                this.codeActions,
                'CodeUIAction',
                'On Load'
            );
        }
        let onLoadAction;
        if (!Utils.isArrayEmpty(onLoadActions)) {
            if (onLoadActions.length > 1) {
                let index = this.codeActions.findIndex((elem) => {
                    return elem['Task']['CodeCode'] === StandardCodes.TASK_TEMPLATE;
                });
                if (index >= 0) {
                    if (StandardCodesIds.SETTINGS_TAB_CONTAINER == this.currentContainerID) {
                        onLoadAction = onLoadActions[index];
                    }
                } else {
                    onLoadAction = onLoadActions[0];
                }
            } else if (onLoadActions.length == 1) {
                onLoadAction = onLoadActions[0];
            }
            if (onLoadAction) {
                switch (onLoadAction.Task.CodeCode) {
                    case StandardCodes.TASK_LOAD_TRANSLATION_DETAILS:
                        const ref = this;
                        const record =
                            this.currentRecord.criteria && this.currentRecord.criteria.currentRecord
                                ? this.currentRecord.criteria.currentRecord
                                : this.currentRecord;
                        let reqObj: any = {};
                        if (record.parentRecord) {
                            reqObj = {
                                criteria: {
                                    'LanguageReference._id': record._id,
                                    'LanguageField.CodeCode': this.contextService
                                        .currentContextField
                                        ? this.contextService.currentContextField.CodeCode
                                        : undefined
                                },
                                userId: this.cacheService.getUserId()
                            };
                        } else {
                            reqObj = {
                                criteria: {
                                    LanguageReferenceID: record._id,
                                    'LanguageField.CodeCode': this.contextService
                                        .currentContextField
                                        ? this.contextService.currentContextField.CodeCode
                                        : undefined
                                },
                                userId: this.cacheService.getUserId()
                            };
                        }

                        this.collectionsService
                            .getLanguageData(reqObj)
                            .subscribe(async (responseData) => {
                                if (responseData) {
                                    let _responseBody = JSON.parse(responseData.body);
                                    ref.setDataFields(ref, _responseBody);
                                    ref.copyOfDataFields = Utils.getCopy(ref.dataFields);
                                    const newRecord = {
                                        ...record,
                                        ...{
                                            LanguageReferenceID: record.parentRecord
                                                ? record.parentRecord._id
                                                : record._id,
                                            _id: _responseBody._id,
                                            LanguageField: _responseBody.LanguageReference
                                                ? undefined
                                                : reqObj['criteria']['LanguageField.CodeCode']
                                        }
                                    };
                                    this.currentRecord = newRecord;
                                    this.selectedRecord = newRecord;
                                }
                            });
                        break;
                    case StandardCodes.TASK_LOAD_QUICK_TEXT:
                        let data = JSON.parse(
                            this.cacheService.getSessionData(
                                'formMetaData' + this.currentPage.CodeElement
                            )
                        );
                        this.processLoadAction(data, context, this.currentPage);
                        break;
                    case StandardCodes.TASK_TEMPLATE:
                        this.loadFormData(
                            StandardCodesIds.SETTING_DETAILS_TEMPLATE,
                            context,
                            _currentRecordId,
                            formMetaData,
                            true
                        );
                        break;
                    default:
                        break;
                }
            }
        } else {
            this.loadFormData(_viewId, context, _currentRecordId, formMetaData, false);
        }
    }
    private formData: any;
    private loadFormData(_viewId, context, _currentRecordId, formMetaData, readSettingJSON) {
        this.gridService.currentViewId = _viewId;
        const ref = this;
        let rerObj = Utils.getContainerViewReq(context, _viewId, _currentRecordId);
        this.gridService.appendNamedParameters(rerObj, formMetaData);
        this.getFormData(rerObj).subscribe(
            async (responseData) => {
                if (responseData) {
                    let _responseBody = JSON.parse(responseData.body);
                    if (
                        readSettingJSON &&
                        _responseBody['SettingJSON'] &&
                        _responseBody['SettingJSON']['Template']
                    ) {
                        _responseBody = _responseBody['SettingJSON']['Template'];
                    }
                    ref.setDataFields(ref, _responseBody);
                    this.formData = Utils.getCopy(ref.dataFields);
                    // this.cacheService.setSessionData(
                    //     'FormData-' + _currentRecordId['_id'],
                    //     responseData.body
                    // );
                    if (!this.currentRecord._id) {
                        this.currentRecord._id = _responseBody._id;
                    }
                    this.currentRecord.sequenceId = _responseBody.sequenceId;
                }
            },
            (errroResponse) => {
                if (
                    this.cacheService.getSessionData('formMetaData' + this.currentPage.CodeElement)
                ) {
                    this.setData(
                        JSON.parse(
                            this.cacheService.getSessionData(
                                'formMetaData' + this.currentPage.CodeElement
                            )
                        ),
                        this.currentPage,
                        context
                    );
                    if (readSettingJSON) {
                        ref.setDataFields(ref, null);
                        ref.copyOfDataFields = Utils.getCopy(ref.dataFields);
                    }
                }
            }
        );
    }

    resolveJSON(json: any) {
        if (typeof json === 'object') {
            for (const key in json) {
                if (Object.prototype.hasOwnProperty.call(json, key)) {
                    if (typeof json[key] === 'string') {
                        if (json[key].includes('@@')) {
                            json[key] = this.quickTextService.getComputedValue(json[key]);
                        }
                    } else if (typeof json[key] === 'object') {
                        json[key] = this.resolveJSON(json[key]);
                    }
                }
            }
            return json;
        } else {
            return json;
        }
    }

    private getFormData(requestObject): Observable<any> {
        if (this.loadAction) {
            return this.requestHandler.handleRequest(requestObject, this.loadAction, null, null);
        }
        return this.collectionsService.getContainerViewData(requestObject);
    }

    // private createViewRequetObj(collectionFromRoute, code, filters, columnFilter, sortObj) {
    //     let requestObject = {};
    //     requestObject['collectionCode'] = collectionFromRoute.collection;
    //     requestObject['viewCode'] = code;
    //     requestObject['filters'] = filters;
    //     if (columnFilter) {
    //         requestObject['columnFilter'] = columnFilter;
    //     }
    //     return requestObject;
    // }

    updateLayout() {
        let userId = this.cacheService.getUserId();
        let reqOBJ = [];
        this.currentView.UIElementsMetaData.forEach((element) => {
            reqOBJ.push({
                type: 'Codes',
                _id: this.currentRecord._id,
                relationships: [
                    {
                        type: 'CodeDesigner',
                        _id: element._id,
                        meta: {
                            viewId: StandardCodesIds.UPDATE_LAYOUT_VIEW_ID,
                            userId: userId
                        },
                        payload: {
                            CodeColumns: element.cols,
                            CodeRows: element.rows,
                            CodeColumn: element.x,
                            CodeRow: element.y
                        }
                    }
                ],
                userId: userId
            });
        });
        this.collectionsService.multiChange(reqOBJ).subscribe(() => {
            this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_UPDATED);
        });
    }

    // private registerValidateEvent() {
    //     if (this.validateEvent) {
    //         this.validateEvent.unsubscribe();
    //     }
    //     this.validateEvent = this.broadcaster
    //         .on('validate' + this.currentView?._id)
    //         .subscribe((data: object) => {
    //             let requestObj = data;
    //             let currentContext = this.contextService.getContextRecord(
    //                 this.currentPage.contextKey +
    //                     this.contextService.getRootViewMap(this.currentPage.contextKey)
    //             );
    //             let req = {};
    //             if (currentContext) {
    //                 if (currentContext['criteria']) {
    //                     req = this.actionService.getUpdateNewReqObj(req, currentContext);
    //                     requestObj = this.actionService.getUpdateNestedReq(
    //                         req,
    //                         currentContext,
    //                         requestObj,
    //                         this.currentView,
    //                         false
    //                     );
    //                 } else {
    //                     requestObj = this.actionService.getUpdateReqObj(
    //                         req,
    //                         currentContext,
    //                         requestObj,
    //                         this
    //                     );
    //                 }
    //             } else {
    //                 requestObj = this.actionService.getUpdateReqObj(
    //                     req,
    //                     { dataObjectCodeCode: this.currentView.CodeDataObject },
    //                     requestObj,
    //                     this
    //                 );
    //             }
    //             this.collectionsService.validate(requestObj).subscribe(
    //                 () => {
    //                     Helpers.removeErrors(this.currentView, Object.keys(data));
    //                 },
    //                 (errorResponse) => {
    //                     Helpers.addErrors(errorResponse, this.currentView);
    //                 }
    //             );
    //         });
    // }

    setDataFields(ref: DataFormRendererComponent, data) {
        ref.dataFields = data;
        ref.actionService.dataFields = data;
    }

    ngOnDestroy() {
        this.unSubscribeEvents();
    }
    unSubscribeEvents() {
        // if (this.eventSubscriber) {
        //     this.eventSubscriber.unsubscribe();
        // }
        if (this.rightClickAction) {
            this.rightClickAction.unsubscribe();
        }
        if (this.fieldAction) {
            this.fieldAction.unsubscribe();
        }

        if (this.rowChangeEvent) {
            this.rowChangeEvent.unsubscribe();
        }

        if (this.resetFormEvent) {
            this.resetFormEvent.unsubscribe();
        }
    }
}
