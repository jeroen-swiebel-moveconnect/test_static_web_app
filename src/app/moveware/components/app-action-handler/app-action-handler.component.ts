import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Internationalization } from '@syncfusion/ej2-base';
import { OAuthService } from 'angular-oauth2-oidc';
import { MenuItem } from 'primeng';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { StandardCodesIds } from 'src/app/moveware/constants/StandardCodesIds';
import { CollectionsService, LoginService, RequestHandler } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { MenuService } from 'src/app/moveware/services/menu.service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { environment } from 'src/environments/environment';
import { MWDialogContentComponent } from '../mw-dialog/mw-dialog.component';

export const TOASTY_SUCCESS: string = 'success';
export const TOASTY_WARNING: string = 'warning';
export const TOASTY_ERROR: string = 'error';
export const TOASTY_INFO: string = 'info';
export const OPERATION_EDIT: string = 'edit';
export const CREATE_MODE: string = 'CREATE_MODE';
export const PROFILE_VIEW_ID = StandardCodesIds.PROFILE_VIEW_ID;
var CryptoJS = require('crypto-js');

@Component({
    selector: 'app-action-handler',
    templateUrl: './app-action-handler.component.html',
    styleUrls: ['./app-action-handler.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})
export class AppActionHandler implements OnInit, OnDestroy {
    @Input() currentView: any;
    @Input() viewMode: string;
    @Input() currentPage: any;
    @Input() selectedRecord: any;
    @Input() currentContainerID: string;
    @Input() gridActions: any;
    @Input() viewTranslationContext: string;
    @Input() viewList: any[];
    @Input() taskBar: any;
    @Output() viewModeChange = new EventEmitter<string>();
    @Output() updateLayout = new EventEmitter<string>();
    @Output() addEvent = new EventEmitter<string>();

    public IsInlineView: boolean = false;
    public primaryActions: Array<any> = [];
    public secondaryActions: MenuItem[] = [];
    public menu: any;
    public currentRecord: any = {};
    public metaData: any = {};
    public parentContainerId: string;
    public loadProfile: any;
    public loadProfileSettings: any;
    public isProfileView: boolean;
    public isUpdateAllowed = true;
    public isInsertBelowView: boolean;
    public taskbarClass: string;
    translationContext: any;
    globalActionEvent: any;
    constructor(
        private collectionsService: CollectionsService,
        private requestHandler: RequestHandler,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private dialogConfigService: DialogConfigurationService,
        private toastService: ToastService,
        private mappings: PageMappingService,
        private titleService: Title,
        private router: Router,
        private broadcaster: Broadcaster,
        private contextService: ContextService,
        private cacheService: CacheService,
        private actionService: UIActionService,
        private oauthService: OAuthService,
        private loginService: LoginService,
        private menuService: MenuService,
        private ruleEngine: RuleEngineService,
        private quickTextHandler: QuickTextHandlerService
    ) {}
    ngOnDestroy(): void {
        //  this.unSubscribeEvents();
    }
    ngAfterViewInit() {
        this.applyHiddenFieldSettings();
    }
    ngOnInit() {
        //this.registerEvents();
        this.contextService.removeDataChangeState();
        if (this.currentPage && this.currentPage.CodeElement === PROFILE_VIEW_ID) {
            this.isProfileView = true;
        } else {
            this.isProfileView = false;
        }
        if (this.currentView && this.currentView.CSSStyles) {
            Utils.appendStyles(this.currentView.CSSStyles, this.currentView._id);
        }
        this.setTranslationContext();
        this.loadViewActions(this.taskBar, this.viewMode);
    }
    /**
     * sets the translationContext
     */
    setTranslationContext() {
        if (this.currentView && this.currentView._id && this.taskBar) {
            this.taskbarClass = 'buttonBar' + this.currentView._id + this.taskBar._id;
            this.translationContext =
                this.taskBar.CodeCode === 'Blank'
                    ? 'Data Form.' + this.currentPage.CodeCode
                    : 'Taskbar.' + this.taskBar.CodeCode;
        }
    }
    // registerEvents() {
    //     // this.unSubscribeEvents();
    //     // if (!this.globalActionEvent) {
    //     //     this.globalActionEvent = this.broadcaster.on('global-action').subscribe((data: any) => {
    //     //         data.CodeActions[0].CodeUIAction = StandardCodes.UI_ACTION_CLICK;
    //     //         this.handleAction(data);
    //     //     });
    //     // }
    // }
    // unSubscribeEvents() {
    //     if (this.globalActionEvent) {
    //         this.globalActionEvent.unsubscribe();
    //     }
    // }

    ngOnChanges(changes: SimpleChanges) {
        if (
            (changes['viewMode'] &&
                !changes['viewMode'].firstChange &&
                changes['viewMode'].previousValue !== changes['viewMode'].currentValue) ||
            (changes['currentView'] && !changes['currentView'].firstChange) ||
            (changes['taskBar'] && !changes['taskBar'].firstChange)
        ) {
            this.loadViewActions(this.taskBar, this.viewMode);
        }
        this.setTranslationContext();
    }
    async applyHiddenFieldSettings() {
        // apply settings only in created mode
        if (this.viewMode !== StandardCodes.CREATE_MODE) {
            return;
        }
        let fields = [];
        if (this.currentView.UIElementsMetaData) {
            Object(this.currentView.UIElementsMetaData)?.forEach((ele) => {
                let element = this.currentView.UIElements[ele._id];
                if (!element.CodeVisible) {
                    let codeValueRules = Utils.getElementsByProperty(
                        element.CodeSettings,
                        'SettingField',
                        'CodeValue'
                    );
                    if (codeValueRules && codeValueRules.length) {
                        fields.push(this.currentView.UIElements[ele._id]);
                    }
                }
            });
        }

        let porcessedFields = await this.ruleEngine.processSettings(
            this.currentRecord,
            fields,
            'Field',
            this.currentView
        );
        porcessedFields?.forEach((porcessedField) => {
            let _field = Utils.getUIElementByCode(
                this.currentView.UIElements,
                porcessedField.CodeCode
            );

            this.currentView.UIElements[_field['_id']].CodeValue = porcessedField;
            this.currentView.UIElements[_field['_id']].isDirty = true;
        });
    }
    /**
     * triggers when view mode changes
     */
    private onViewModeChange() {
        this.loadViewActions(this.taskBar, this.viewMode);
    }
    /**
     * loads the actions in the toolbar
     * @param taskBar : taskbar to load
     * @param viewMode : view mode
     */
    private loadViewActions(taskBar, viewMode) {
        if (taskBar) {
            if (Array.isArray(taskBar)) {
                this.parseUIActions(taskBar, viewMode);
            } else {
                this.parseUIActions([taskBar], viewMode);
            }
        }
    }

    private parseUIActions(actions: any, viewMode: string) {
        this.primaryActions = [];
        this.secondaryActions = [];
        if (actions) {
            actions.forEach(async (taskBar) => {
                let processSettings = await this.ruleEngine.processSettings(
                    this.selectedRecord,
                    taskBar.CodeDesigner,
                    'Button'
                );
                processSettings?.filter((action) => {
                    if (!action.CodeActions || Utils.isArrayEmpty(action.CodeActions)) {
                        if (action.CodeVisible) {
                            let jsonParam = action['JSONParameter'];
                            if (
                                jsonParam &&
                                action.CodeCollapsed !== 'Yes' &&
                                jsonParam.displayModes &&
                                jsonParam.displayModes.indexOf(viewMode) >= 0
                            ) {
                                if (this.primaryActions.indexOf(action) === -1) {
                                    this.primaryActions.push(action);
                                }
                            } else if (
                                jsonParam &&
                                action.CodeCollapsed === 'Yes' &&
                                jsonParam.displayModes &&
                                jsonParam.displayModes.indexOf(viewMode) >= 0
                            ) {
                                if (this.secondaryActions.indexOf(action) === -1) {
                                    this.secondaryActions.push(action);
                                }
                            }
                            if (!jsonParam) {
                                if (action.CodeCollapsed !== 'Yes') {
                                    if (this.primaryActions.indexOf(action) === -1) {
                                        this.primaryActions.push(action);
                                    }
                                } else if (action.CodeCollapsed === 'Yes') {
                                    if (this.secondaryActions.indexOf(action) === -1) {
                                        this.secondaryActions.push(action);
                                    }
                                }
                            }
                        }
                    } else {
                        if (action.CodeVisible) {
                            action.CodeActions.filter((codeAction) => {
                                let jsonParam = codeAction.Task['JSONParameter'];
                                if (
                                    jsonParam &&
                                    action.CodeCollapsed !== 'Yes' &&
                                    jsonParam.displayModes &&
                                    jsonParam.displayModes.indexOf(viewMode) >= 0
                                ) {
                                    if (this.primaryActions.indexOf(action) === -1) {
                                        this.primaryActions.push(action);
                                    }
                                } else if (
                                    jsonParam &&
                                    action.CodeCollapsed === 'Yes' &&
                                    jsonParam.displayModes &&
                                    jsonParam.displayModes.indexOf(viewMode) >= 0
                                ) {
                                    if (this.secondaryActions.indexOf(action) === -1) {
                                        this.secondaryActions.push(action);
                                    }
                                }
                                if (!jsonParam) {
                                    if (action.CodeCollapsed !== 'Yes') {
                                        if (this.primaryActions.indexOf(action) === -1) {
                                            this.primaryActions.push(action);
                                        }
                                    } else if (action.CodeCollapsed === 'Yes') {
                                        if (this.secondaryActions.indexOf(action) === -1) {
                                            this.secondaryActions.push(action);
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            });
        }
    }

    private actionEvent(button) {
        this.isInsertBelowView = false;
        this.IsInlineView = false;
        this.handleAction(button);
    }
    private handleAction(dynamicButton) {
        let _actionType;
        let _action;
        let CodeActions = dynamicButton.CodeActions;
        let clickAction = Utils.getElementByProperty(
            CodeActions,
            'CodeUIAction',
            StandardCodes.UI_ACTION_CLICK
        );
        // CodeActions.forEach(codeAction => {
        if (clickAction) {
            _actionType = clickAction.Task.CodeCode;
            _action = clickAction.Task;
        }
        if (!_action && !_actionType) {
            _actionType = dynamicButton.CodeCode;
            _action = {
                CodeCode: dynamicButton.CodeCode,
                JSONParameter: dynamicButton.JSONParameter
            };
        }
        switch (_actionType) {
            case 'Save': {
                this.onSaveClicked(false, _action);
                break;
            }
            case StandardCodes.DELETE_TEMPLATE:
                let requestObj = { payload: { _id: this.currentRecord._id } };
                this.updateDetails(requestObj, _action, undefined, undefined, OPERATION_EDIT);
                break;

            case StandardCodes.UPDATE_TEMPLATE:
                this.onUpdateClicked(_action);

                break;
            case 'Complete Task': {
                this.onSaveClicked(false, _action);
                break;
            }
            case 'Send Email': {
                this.onSaveClicked(false, _action);
                break;
            }
            case 'save_and_new': {
                this.onSaveAndNewClicked(_action);
                break;
            }
            case StandardCodes.TASK_LOAD_UI_CONTAINER: {
                setTimeout(() => {
                    this.loadFormInline(clickAction);
                });
                break;
            }
            case 'Logout': {
                this.onLogout();
                break;
            }
            case 'Personalize': {
                this.loadPersonalizeView(clickAction);
            }
            case 'create_new_type': {
                console.log('Create New Type Clicked');
                break;
            }
            case 'Update': {
                this.onUpdateClicked(_action);
                break;
            }
            case 'Delete': {
                this.onDeleteClicked(_action);
                break;
            }
            case 'Reset': {
                this.broadcaster.broadcast(this.currentPage.CodeElement + '-resetForm');
                this.contextService.removeDataChangeState();
                console.log('Reset Clicked');
                break;
            }
            case 'Cancel': {
                //TODO:
                this.onCancelClicked(_action, this.viewMode);
                break;
            }
            case 'Copy': {
                this.cloneRecord();
                break;
            }
            case StandardCodes.TASK_ADD_CODE: {
                this.addEvent.emit(clickAction);
                break;
            }
            case 'Print': {
                if (this.selectedRecord.isCurrentView) {
                    let GridMetaData = JSON.parse(
                        this.cacheService.getSessionData('currentGridMetaData')
                    );
                    Utils.printData('#grid' + GridMetaData._id);
                } else {
                    let size, layout, margin;
                    size = this.selectedRecord.CodePaperSize
                        ? this.selectedRecord.CodePaperSize
                        : 'A4';
                    layout = this.selectedRecord.CodeDocumentLayout
                        ? this.selectedRecord.CodeDocumentLayout.toLowerCase()
                        : 'portrait';
                    margin = this.selectedRecord.CodeMargins
                        ? this.selectedRecord.CodeMargins.toLowerCase()
                        : '10px';
                    let css = '@page { size: ' + size + ' ' + layout + ';margin: ' + margin + '; }',
                        head = document.head || document.getElementsByTagName('head')[0],
                        style = document.createElement('style');
                    style.type = 'text/css';
                    style.media = 'print';
                    if (style['styleSheet']) {
                        style['styleSheet'].cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    head.appendChild(style);
                    let curretTitle;
                    if (this.selectedRecord.FileName) {
                        curretTitle = this.getWindowTitle();
                        this.setWindowTitle(this.selectedRecord.FileName);
                    }
                    window.print();
                    if (curretTitle) {
                        this.setWindowTitle(curretTitle);
                    }
                }
                break;
            }
            case 'help': {
                // TODO:
                console.log('Help Clicked');
                break;
            }
            case 'Save Custom View': {
                this.saveCustomView(_action);
                break;
            }
            case 'Edit Custom View': {
                this.editCustomView(_action);
                break;
            }
            case 'Change Password': {
                this.loginService.changePassword(
                    this.encryptPassword(
                        this.currentView.UIElements[this.currentView.UIElementsMetaData[0]._id]
                            .CodeValue
                    )
                );
                break;
            }
            case 'Update Layout': {
                this.updateLayout.emit();
            }
            case 'Revert to this version': {
                this.collectionsService
                    .revertToThisVersion(
                        this.currentRecord.parentRecord._id,
                        this.currentRecord._id,
                        true
                    )
                    .subscribe(
                        async (responseData) => {
                            let body = JSON.parse(responseData.body);
                            let selectedRecordCopy = Utils.getCopy(this.selectedRecord);
                            selectedRecordCopy._id = selectedRecordCopy['parentRecord']._id;
                            delete selectedRecordCopy['parentRecord'];
                            this.broadcaster.broadcast(
                                this.currentPage.parentContainerId + 'version_update',
                                selectedRecordCopy
                            );
                        },
                        (errorResponse) => {
                            this.toastService.showCustomToast('error', errorResponse);
                        }
                    );
            }
            default: {
                console.log("Didn't match any action.... Contact the system administrator!!!");
                break;
            }
        }
        this.handleCallBack(_action);
        //  });
    }
    private getWindowTitle() {
        return this.titleService.getTitle();
    }
    private setWindowTitle(name) {
        this.titleService.setTitle(name);
    }
    private loadPersonalizeView(codeAction) {
        let selectedData = this.actionService.getActionMetaData({}, codeAction, {});
        if (selectedData.IsParentContext) {
            selectedData.parentContainerId = this.currentPage['contextKey'];
        } else {
            selectedData.parentContainerId = selectedData.UIContainer;
            this.contextService.setContextRecord(
                selectedData.parentContainerId + this.currentView._id,
                null
            );
        }

        this.menu = selectedData;
        this.currentRecord.criteria = this.menu.criteria;
        if (codeAction.CodeUILocation === 'Inline') {
            this.IsInlineView = true;
            this.loadProfileSettings = true;
            this.loadProfile = false;
        }
    }
    private onLogout() {
        this.handleDialogOpen(
            'alert',
            'Logout',
            StandardCodes.MESSAGES.LOGOUT_WARNING,
            false,
            '200px',
            '260px',
            'Cancel',
            'Logout'
        ).onClose.subscribe((data) => {
            if (data) {
                this.cacheService.clear();
                this.cacheService.preventDefault = true;
                this.oauthService.logOut();
            }
        });
    }
    handleDialogOpen(
        type,
        title,
        message,
        closeOpenedDialog,
        height,
        width,
        noButtonDescription?,
        yesButtonDescription?
    ) {
        this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(this.dialogConfig);
        this.dialogConfig.height = height;
        this.dialogConfig.width = width;
        this.dialogConfig.styleClass = 'logout-dialog';
        this.dialogConfig.data = {
            type: type,
            message: message,
            title: title
        };
        if (noButtonDescription) {
            this.dialogConfig.data['noButtonDescription'] = noButtonDescription;
        }
        if (yesButtonDescription) {
            this.dialogConfig.data['yesButtonDescription'] = yesButtonDescription;
        }
        this.dialogConfig['closeOpenedDialog'] = closeOpenedDialog;
        return this.dialog.open(MWDialogContentComponent, this.dialogConfig);
    }
    public loadFormInline(codeAction: any) {
        let userId = this.cacheService.getUserId();
        this.quickTextHandler.currentView = this.currentView;

        let selectedData = this.actionService.getActionMetaData(
            { EntityUserId: userId },
            codeAction,
            { EntityUserId: userId, ...this.currentRecord }
        );

        if (selectedData.settingJSON) {
            selectedData.settingJSON = this.buildRequestPayload(this.currentView, {
                CodeCode: StandardCodes.SAVE_TEMPLATE
            });
        }
        if (selectedData.IsParentViewId) {
            selectedData.parentViewId = this.currentView?._id;
        }
        if (selectedData.IsParentContext) {
            selectedData.parentContainerId = this.currentPage['contextKey'];
            this.menu.currentRecord = this.currentRecord;
        } else {
            selectedData.parentContainerId = selectedData.UIContainer;
            this.contextService.setContextRecord(
                selectedData.parentContainerId + this.currentView._id,
                null
            );
        }

        this.menu = selectedData;

        this.metaData.onlyLookup = this.menu.isOnlyLookup;
        this.metaData.multiSelection = this.menu.multiSelection;
        this.metaData.rowSelect = this.menu.rowSelect;
        this.metaData.criteria = this.menu.criteria;

        this.metaData.selectedRecords = this.menu.isOnlyLookup ? this.menu.selectedRecords : null;
        this.parentContainerId = this.menu.parentContainerId;
        this.metaData.defaultLayout = this.menu.defaultLayout;
        this.metaData.isLoadedFromOverlay = true;
        if (this.currentRecord) {
            if (selectedData.IsParentContext) {
                this.currentRecord = Utils.getCopy(this.selectedRecord);
            }
            this.currentRecord.criteria = this.menu.criteria;
            this.currentRecord.baseViewCode = this.currentView._id;
        }
        if (codeAction.CodeUILocation === 'Inline') {
            this.IsInlineView = true;
            this.loadProfile = true;
            this.loadProfileSettings = false;
        } else if (codeAction.CodeUILocation === 'Insert Below') {
            this.isInsertBelowView = true;
        } else {
            this.menuService.loadContainer(
                selectedData ? selectedData : codeAction,
                null,
                event,
                null,
                this.dialog,
                this.dialogConfig
            );
        }
    }
    public backButtonClicked() {
        this.IsInlineView = !this.IsInlineView;
        this.currentRecord = {};
    }
    public saveCustomView(_action) {
        let view = {
            action: _action,
            fileds: this.currentView.UIElements
        };
        this.broadcaster.broadcast('save_custom_view', view);
    }
    public editCustomView(_action) {
        let view = {
            action: _action,
            fileds: this.currentView.UIElements
        };
        this.broadcaster.broadcast('edit_custom_view', view);
    }

    private encryptPassword(value): string {
        let salt = environment.CRYPTO_SALT;
        var encrypted = CryptoJS.AES.encrypt(value, salt).toString();
        return encrypted;
    }

    private handleCallBack(dynamicButton: any) {
        if (!dynamicButton.callback) {
            return;
        }
        switch (dynamicButton.callback) {
            case 'hideSlider': {
                // this.isLeftVisible = true;
            }
            default: {
                console.log('no mapping found to callback');
            }
        }
    }

    private isValidCodeAndType() {
        if (!(this.currentView.viewType && this.currentView.CodeCode)) {
            this.toastService.showCustomToast(TOASTY_ERROR, [
                { details: 'Error occured: Invalid Code/Type provided' }
            ]);
            return false;
        }
        return true;
    }

    private validateCodeSave(requestObj: any, _isSaveAndNew: boolean, dynamicAction: any) {
        const ref = this;
        //  setTimeout(function () {
        const codeValue = requestObj['payload']['CodeCode'];
        const codeType = requestObj['payload']['CodeType'];

        if (codeType == 'Number') {
            const org_prefix =
                requestObj['payload']['organizationPrefix'] !== undefined
                    ? requestObj['payload']['organizationPrefix']
                    : '';
            const company_prefix =
                requestObj['payload']['companyPrefix'] !== undefined
                    ? requestObj['payload']['companyPrefix']
                    : '';
            const branch_prefix =
                requestObj['payload']['branchPrefix'] !== undefined
                    ? requestObj['payload']['branchPrefix']
                    : '';
            const type_prefix =
                requestObj['payload']['typePrefix'] !== undefined
                    ? requestObj['payload']['typePrefix']
                    : '';
            const digit =
                requestObj['payload']['digits'] !== undefined ? requestObj['payload']['digits'] : 0;
            const format =
                requestObj['payload']['format'] !== undefined
                    ? requestObj['payload']['format']
                    : '';
            const delimiter =
                requestObj['payload']['delimiter'] !== undefined
                    ? requestObj['payload']['delimiter']
                    : '';
            ref.collectionsService
                .verifyNumberFormat(
                    '',
                    org_prefix,
                    company_prefix,
                    branch_prefix,
                    type_prefix,
                    digit,
                    format,
                    delimiter
                )
                .subscribe(
                    async (response) => {
                        if (response === true) {
                            ref.saveDetails(requestObj, _isSaveAndNew, dynamicAction);
                        }
                    },
                    (errorResponse) => {
                        ref.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                    }
                );
        } else {
            ref.saveDetails(requestObj, _isSaveAndNew, dynamicAction);
        }
        //  }, 10);
    }

    private convertValueToType(inputType: string, value: string, dataType: string, codeFormat?) {
        if ((dataType === 'Decimal' || dataType === 'Double') && value) {
            let format = codeFormat;
            if (!format) {
                format = '0.00';
            }
            let intl: Internationalization = new Internationalization();
            value = intl.formatNumber(Number(value), {
                format: format
            });
            return Number(value);
        } else if (inputType === 'Number') {
            if (value === null) {
                return null;
            } else {
                return Number(Math.floor(Number(value)));
            }
        } else if (inputType === 'Date' && value) {
            return new Date(value);
        } else if (dataType === 'JSON') {
            if (value) {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    this.toastService.addErrorMessage(StandardCodes.EVENTS.DATA_ENTRY_ERROR);
                    return null;
                }
            } else {
                return null;
            }
        } else if (
            dataType === StandardCodes.DATATYPE_STRING &&
            inputType === StandardCodes.DISPLAY_TEXT &&
            value === ''
        ) {
            return null;
        } else {
            return value;
        }
    }
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
        this.selectedRecord = currentRecord;
    }

    private swapArrayElements(array, fromIndex, toIndex) {
        let a = array[fromIndex];
        array[fromIndex] = array[toIndex];
        array[toIndex] = a;
        return array;
    }
    private isDataObjectChanged = false;
    buildRequestPayload(_currentView: any, action: any) {
        const ref = this;
        let reqObj = {};
        //This is the special case where on deleting of template means updating the current record with SettingJSON as null
        if (action.CodeCode == StandardCodes.DELETE_TEMPLATE) {
            reqObj['SettingJSON'] = null;
            return reqObj;
        }

        if (ref.viewMode !== CREATE_MODE) {
            if (this.selectedRecord?.criteria?.EntityUserId) {
                reqObj['_id'] = this.cacheService.getCurrentUserId();
            } else {
                reqObj['_id'] = this.selectedRecord._id;
            }
        }
        for (const _key in _currentView.UIElements) {
            let field = _currentView.UIElements[_key];
            if (field.CodeCode == 'FileSubType' && action.CodeCode == StandardCodes.SAVE_TEMPLATE) {
                if (field.CodeValue) {
                    reqObj['_id'] = field.CodeValue._id ? field.CodeValue._id : field.CodeValue;
                } else {
                    this.toastService.addErrorMessage(StandardCodes.EVENTS.NO_SUBTYPE_SELECTED);
                    return;
                }
            }
            if (!field.CodeIsCalculatedField || field.CodeIsCalculatedField.CodeCode === 'No') {
                if (field.CodeFieldType == 'Dynamic Type' && field.DynamicField) {
                    field.CodeValue = field.DynamicField.CodeValue;
                    field.isDirty = field.DynamicField.isDirty;
                }
                if (this.viewMode !== 'VIEW_UPDATE_MODE') {
                    reqObj[field.CodeCode] = ref.convertValueToType(
                        field.CodeFieldType,
                        field.CodeValue,
                        field.CodeDataType,
                        field.CodeFormat
                    );
                    if (
                        field.CodeValue === null ||
                        field.CodeValue === undefined ||
                        field.CodeValue.length == 0
                    ) {
                        if (field.CodeVisible && !field.isDirty) {
                            reqObj[field.CodeCode] = null;
                        } else {
                            delete reqObj[field.CodeCode];
                        }
                    }

                    field.isDirty = false;
                    if (field.CodeLookupEnabled && !field.isOnlyLookup) {
                        if (field.CodeVisible) {
                            reqObj[field.CodeCode] = [];
                        } else {
                            delete reqObj[field.CodeCode];
                        }
                    }
                } else {
                    if (
                        ((action.CodeCode == StandardCodes.SAVE_TEMPLATE ||
                            action.CodeCode == StandardCodes.UPDATE_TEMPLATE) &&
                            field.CodeType == 'Field') ||
                        (field.isDirty &&
                            typeof field.CodeValue === 'object' &&
                            JSON.stringify(field.originalValue) !==
                                JSON.stringify(field.CodeValue)) ||
                        field['isDataChange'] ||
                        (typeof field.CodeValue !== 'object' &&
                            (field.CodeValue != field.originalValue || field['isDataChange']))
                    ) {
                        if (
                            field._id === StandardCodesIds.FIELD_CODE_DATAOBJECT_ID &&
                            JSON.stringify(field.originalValue) != JSON.stringify(field.CodeValue)
                        ) {
                            this.isDataObjectChanged = true;
                        }
                        field['isDataChange'] = true;
                        reqObj[field.CodeCode] = ref.convertValueToType(
                            field.CodeFieldType,
                            field.CodeValue,
                            field.CodeDataType,
                            field.CodeFormat
                        );
                    }
                    //make service call for numbers in create mode
                }
                if (field.CodeFieldType === StandardCodes.FIELD_TYPE_QUERYBUILDER) {
                    if (field.CodeValue && !Utils.isArrayEmpty(field.CodeValue.rules)) {
                        Utils.setOperator(field.CodeValue);
                    }
                }
                field.isDirty = false;
                field.originalValue = field.CodeValue;
            }
        }
        if (
            this.currentPage.metaData &&
            this.currentPage.metaData.settingJSON &&
            this.viewMode === StandardCodes.CREATE_MODE
        ) {
            reqObj = this.getTemplateReq(reqObj, this.currentPage.metaData.settingJSON);
        }
        return reqObj;
    }

    private getTemplateReq(reqObj, settingJSON) {
        let _reqObj = reqObj;
        let _settingJSON = Utils.getCopy(settingJSON);
        delete settingJSON._id;

        _reqObj['SettingJSON'] = {
            DataForm: this.currentPage['parentViewId']
                ? this.currentPage.parentViewId
                : this.currentView._id,
            Template: settingJSON
        };

        _reqObj['_id'] = _settingJSON._id;
        return _reqObj;
    }
    // ACTION BUTTON HANDLERS
    public onCancelClicked(dynamicAction: any, _viewMode: string) {
        this.changeMode('VIEW_UPDATE_MODE');
    }

    public onSaveClicked(_isSaveAndNew: boolean, dynamicAction: any) {
        const ref = this;
        // if (!ref.isValidCodeAndType()) {
        //     return;
        // }

        let requestPayload = this.buildRequestPayload(this.currentView, dynamicAction);
        if (requestPayload) {
            let requestObj = {};
            requestObj['payload'] = requestPayload;
            this.validateCodeSave(requestObj, _isSaveAndNew, dynamicAction);
        }
    }

    private getUserId() {
        if (this.cacheService.getLocalData('user')) {
            return JSON.parse(this.cacheService.getLocalData('user')).preferred_username;
        }
    }
    // private getUpdateNestedReq(reqObj, context, requestPayload) {
    //     if (context['criteria']) {
    //         let relationship = {};
    //         relationship['type'] = context['criteria'].dataObjectCodeCode;
    //         relationship['_id'] = context['criteria'].id;
    //         let obj = this.getUpdateNestedReq(relationship, context['criteria'], requestPayload);
    //         let relationships = [];
    //         relationships.push(obj);
    //         reqObj['relationships'] = relationships;
    //     } else {
    //         let recordId = requestPayload._id;
    //         delete requestPayload._id;
    //         if (requestPayload && Object.getOwnPropertyNames(requestPayload).length) {
    //             this.isUpdateAllowed = true;
    //         } else {
    //             this.isUpdateAllowed = false;
    //         }
    //         reqObj = {
    //             type: this.currentView.CodeDataObject,
    //             _id: recordId,
    //             meta: {
    //                 viewId: this.currentView._id,
    //                 userId: this.getUserId()
    //             },
    //             payload: requestPayload
    //         };
    //     }
    //     return reqObj;
    // }
    // private getUpdateReqObj(reqObj, context, requestPayload) {
    //     let recordId = requestPayload._id;
    //     delete requestPayload._id;
    //     if (requestPayload && Object.getOwnPropertyNames(requestPayload).length) {
    //         this.isUpdateAllowed = true;
    //     } else {
    //         this.isUpdateAllowed = false;
    //     }
    //     reqObj = {
    //         _id: recordId,
    //         meta: {
    //             viewId: this.currentView._id,
    //             userId: this.getUserId()
    //         },
    //         payload: requestPayload
    //     };
    //     if (context) {
    //         reqObj['type'] = context.dataObjectCodeCode;
    //     }
    //     return reqObj;
    // }

    private getParentContextId(context) {
        let parenDetails;
        if (context) {
            if (context['child']) {
                parenDetails = this.getParentContextId(context['child']);
            } else {
                parenDetails = {
                    parentId: context.parentId,
                    parentDataObjectId: context.parentDataObjectId
                };
            }
        }
        return parenDetails;
    }
    private onSaveAndNewClicked(dynamicAction: any) {
        this.onSaveClicked(true, dynamicAction);
    }

    private saveDetails(requestObj: any, _isSaveAndNew: boolean, dynamicAction: any) {
        const ref = this;
        //   setTimeout(() => {
        let currentContext = ref.contextService.getContextRecord(
            ref.currentPage.contextKey +
                ref.contextService.getRootViewMap(ref.currentPage.contextKey)
        );
        let reqObj = ref.actionService.getParsedReqObject(requestObj.payload);

        requestObj.payload = reqObj.payload;
        requestObj = ref.actionService.getRequestObj(
            requestObj.payload,
            currentContext,
            ref.currentView
        );
        let settingJSONObj = this.containsSettingJSON(requestObj);
        if (requestObj && settingJSONObj) {
            let _req = ref.actionService.getParsedReqObject(settingJSONObj.Template);
            let payloadId = reqObj.payload._id;
            if (requestObj?.payload) {
                requestObj.payload.SettingJSON.Template = _req.payload;
            } else if (requestObj?.relationships) {
                requestObj.relationships[0].payload.SettingJSON.Template = _req.payload;
            }

            requestObj = ref.actionService.getSettingJSONReq(requestObj, payloadId);
        }
        let queryParams;
        if (ref.cacheService.getSessionData('queryParams')) {
            queryParams = JSON.parse(ref.cacheService.getSessionData('queryParams'));
        }
        // if (dynamicAction['JSONParameter'] && dynamicAction['JSONParameter']['showLoader']) {
        //     ref.broadcaster.broadcast(ref.currentPage.CodeElement + 'Show Loader', true);
        // }
        ref.requestHandler
            .handleRequest(requestObj, dynamicAction, undefined, queryParams, true)
            .subscribe(
                async (responseData) => {
                    Helpers.removeErrors(ref.currentView, null);
                    let parsedObject = Utils.getCopy(requestObj);
                    parsedObject.payload = reqObj.parsedReq;
                    parsedObject['Parents'] = [];
                    if (requestObj.payload && requestObj.payload.Parents) {
                        parsedObject['Parents'] = requestObj.payload.Parents;
                    }
                    let recId;
                    if (responseData.body) {
                        let resBody = responseData.body;
                        if (typeof resBody === 'string') {
                            recId = JSON.parse(resBody).id;
                        } else {
                            recId = resBody.id;
                        }
                    } else {
                        recId = responseData.id;
                    }
                    parsedObject['id'] = recId;
                    parsedObject.payload._id = recId;
                    if (!ref.selectedRecord) {
                        ref.selectedRecord = {};
                    }
                    ref.selectedRecord._id = recId;
                    let calAndAutogenFields = ref.getCalculatedAndAutoGenFields(
                        ref.currentView,
                        ref.viewMode
                    );
                    let context = ref.createContext(
                        Utils.getCopy(currentContext),
                        ref.currentView,
                        parsedObject
                    );
                    let criteriaObj = Utils.getContainerViewReq(
                        context,
                        ref.currentView._id,
                        parsedObject.payload
                    );
                    criteriaObj['criteria']['includes'] = calAndAutogenFields;
                    criteriaObj['sequenceId'] = 1;
                    if (calAndAutogenFields.length > 0 && !queryParams) {
                        ref.collectionsService
                            .refreshRecord(criteriaObj)
                            .subscribe(async (respData) => {
                                if (respData && respData.body) {
                                    let response = JSON.parse(respData.body);
                                    Object.keys(response).forEach((field) => {
                                        parsedObject['payload'][field] = response[field];
                                        let fields = ref.currentView.UIElements;
                                        Object.keys(fields).forEach((key) => {
                                            if (fields[key].CodeCode === field) {
                                                fields[key].CodeValue = response[field];
                                            }
                                        });
                                    });
                                }
                                ref.addRecordTogrid(dynamicAction, requestObj, parsedObject);
                            });
                    } else {
                        if (!queryParams) {
                            ref.addRecordTogrid(dynamicAction, requestObj, parsedObject);
                        }
                    }
                    if (queryParams) {
                        ref.broadcaster.broadcast('Task Completed', ref.currentView._id);
                        // ref.broadcaster.broadcast(
                        //     ref.currentPage.CodeElement + 'Show Loader',
                        //     false
                        // );
                    }
                },
                (errorResponse) => {
                    // ref.broadcaster.broadcast(ref.currentPage.CodeElement + 'Show Loader', false);
                    ref.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                    Helpers.addErrors(errorResponse, ref.currentView);
                }
            );
        //  }, 10);
    }

    /**
     * <p> returns settingsJson value if its preesent in requestObject.</p>
     *
     * @param event : DOM Event
     * @param item : selected options from dropdown Options.
     */
    private containsSettingJSON(requestObj) {
        if (requestObj?.payload?.SettingJSON) {
            return requestObj?.payload?.SettingJSON;
        } else if (requestObj?.relationships) {
            return this.containsSettingJSON(requestObj?.relationships[0]);
        } else {
            return false;
        }
    }
    private getSelectorObject() {
        let selectors = this.mappings.getViewSelectors(this.currentPage.containerID);
        let record = '';
        if (!Utils.isArrayEmpty(selectors)) {
            selectors.forEach((selector) => {
                record += this.selectedRecord[selectors];
            });
        }
        return record;
    }
    public addRecordTogrid(dynamicAction, requestObj, parsedObject) {
        let ref = this;
        ref.broadcaster.broadcast(
            ref.currentPage.CodeUIContainerDesignerParent + 'child_created',
            parsedObject
        );
        let recordType = 'Record';
        ref.viewMode = 'VIEW_UPDATE_MODE';
        ref.loadViewActions(ref.taskBar, ref.viewMode);
        ref.viewModeChange.emit(ref.viewMode);
        let record = ref.getSelectorObject();
        if (record) {
            recordType = record;
        }
        ref.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_CREATED);

        if (dynamicAction.showNewTabPrompt) {
            this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(
                this.dialogConfig
            );
            this.dialogConfig.data = {
                type: 'confirm',
                message: 'Do yout want to open this item in New Tab? ',
                title: 'Open in New Tab'
            };
            const newTabDialog = this.dialog.open(MWDialogContentComponent, this.dialogConfig);
            newTabDialog.onClose.subscribe(
                (response) => {
                    if (response) {
                        // TODO: OPEN CREATED ITEM IN NEW TAB;
                        ref.router.navigate(['mw/menu', requestObj.collectionCode.toLowerCase()], {
                            queryParams: {
                                isSearchItem: true,
                                collectionCode: requestObj.collectionCode,
                                codeType: requestObj['payload'].CodeType,
                                moduleCode: requestObj['payload'].module,
                                code_value: requestObj['payload'].CodeCode
                            }
                        });
                    }
                },
                (errorResponse) => {
                    ref.toastService.addErrorMessage(StandardCodes.EVENTS.SYSTEM_ERROR_OCCURRED);
                }
            );
        }
        //  ref.eventsListener.onEventUpdate({ data: requestObj, operation: 'goBack' });
        if (ref.currentContainerID === StandardCodesIds.QUICK_ADD_CONTAINER_ID) {
            ref.broadcaster.broadcast(
                ref.currentPage.CodeUIContainerDesignerParent + 'child_cancel',
                { currentPage: ref.currentPage }
            );
        }
        ref.contextService.removeDataChangeState();
    }

    public getCalculatedAndAutoGenFields(refCurrentView: any, viewMode): string[] {
        let calAndAutogenFields: string[] = [];
        let fields = refCurrentView.UIElements;
        Object.keys(fields).forEach((key) => {
            if (
                (fields[key].CodeIsCalculatedField &&
                    !Utils.isObjectEmpty(fields[key].CodeIsCalculatedField)) ||
                (fields[key].CodeAutoAssign && !Utils.isObjectEmpty(fields[key].CodeAutoAssign))
            ) {
                if (
                    (fields[key].CodeAutoAssign instanceof Object &&
                        fields[key].CodeAutoAssign.CodeCode === 'Yes') ||
                    (fields[key].CodeIsCalculatedField instanceof Object &&
                        fields[key].CodeIsCalculatedField.CodeCode === 'Yes')
                ) {
                    calAndAutogenFields.push(fields[key].CodeCode);
                }
            }
        });
        if (viewMode !== CREATE_MODE) {
            if (calAndAutogenFields.includes('CodeNumber')) {
                calAndAutogenFields.filter(
                    (arrayItem) => !calAndAutogenFields.includes('CodeNumber')
                );
            }
        }
        return calAndAutogenFields;
    }

    public createContext(context, currentView, parsedObject) {
        if (!context) {
            return (context = {
                id: parsedObject.id,
                dataObjectCodeCode: currentView.CodeDataObject
            });
        } else if (context['criteria']) {
            this.createContext(context['criteria'], currentView, parsedObject);
            return context;
        } else {
            context['criteria'] = {
                id: parsedObject.id,
                dataObjectCodeCode: currentView.CodeDataObject
            };
            return context;
        }
    }

    public onUpdateClicked(dynamicAction: any) {
        if (this.cacheService.getSessionData('dataChange')) {
            const ref = this;
            // if (!ref.isValidCodeAndType()) {
            //     return;
            // }
            let currentContext = this.contextService.getContextRecord(
                this.currentPage.contextKey +
                    ref.contextService.getRootViewMap(ref.currentPage.contextKey)
            );
            let parenDetails = this.getParentContextId(currentContext);
            let requestPayload = this.buildRequestPayload(this.currentView, dynamicAction);
            if (this.isDataObjectChanged) {
                this.isDataObjectChanged = false;
                this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(
                    this.dialogConfig
                );
                this.dialogConfig.data = {
                    type: 'confirm',
                    message:
                        'Updating DataObject field will reset the Designer for this document. Do you want to continue? ',
                    title: 'Update'
                };
                const dialogRef = this.dialog.open(MWDialogContentComponent, this.dialogConfig);
                return dialogRef.onClose.subscribe((result) => {
                    if (result === true) {
                        requestPayload['CodeDesigner'] = null;
                        this.updateData(requestPayload, parenDetails, dynamicAction);
                    }
                });
            } else {
                this.updateData(requestPayload, parenDetails, dynamicAction);
            }
        } else {
            this.toastService.addWarningMessage(StandardCodes.EVENTS.NO_CHANGES_MADE);
        }
    }
    private updateData(requestPayload, parenDetails, dynamicAction) {
        const requestObj = {
            payload: requestPayload
        };
        // if (parenDetails) {
        //     if (parenDetails.parentId && parenDetails.parentDataObjectId && parenDetails.parentDataObjectId !== this.currentView.dataObjectId) {
        //         requestObj.meta['parentId'] = parenDetails.parentId;
        //         requestObj.meta['parentDataObjectId'] = parenDetails.parentDataObjectId;
        //     }

        // }
        const codeType = requestObj['payload']['CodeType'];
        if (codeType == 'Number') {
            const org_prefix =
                requestObj['payload']['organizationPrefix'] !== undefined
                    ? requestObj['payload']['organizationPrefix']
                    : '';
            const company_prefix =
                requestObj['payload']['companyPrefix'] !== undefined
                    ? requestObj['payload']['companyPrefix']
                    : '';
            const branch_prefix =
                requestObj['payload']['branchPrefix'] !== undefined
                    ? requestObj['payload']['branchPrefix']
                    : '';
            const type_prefix =
                requestObj['payload']['typePrefix'] !== undefined
                    ? requestObj['payload']['typePrefix']
                    : '';
            const digit =
                requestObj['payload']['digits'] !== undefined ? requestObj['payload']['digits'] : 0;
            const format =
                requestObj['payload']['format'] !== undefined
                    ? requestObj['payload']['format']
                    : '';
            const delimiter =
                requestObj['payload']['delimiter'] !== undefined
                    ? requestObj['payload']['delimiter']
                    : '';
            this.collectionsService
                .verifyNumberFormat(
                    requestObj.payload['_id'],
                    org_prefix,
                    company_prefix,
                    branch_prefix,
                    type_prefix,
                    digit,
                    format,
                    delimiter
                )
                .subscribe(
                    async (response) => {
                        if (response === true) {
                            this.updateDetails(
                                requestObj,
                                dynamicAction,
                                undefined,
                                undefined,
                                OPERATION_EDIT
                            );
                        }
                    },
                    (errorResponse) => {
                        this.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                    }
                );
        } else {
            this.updateDetails(requestObj, dynamicAction, undefined, undefined, OPERATION_EDIT);
        }
    }
    private updateDetails(
        requestObj: any,
        dynamicAction: any,
        pathParams: undefined,
        queryParams: undefined,
        emitOperation,
        subDocumentKey?: string
    ) {
        const ref = this;
        //  setTimeout(function () {
        let reqObj;
        if (!subDocumentKey) {
            reqObj = ref.actionService.getParsedReqObject(requestObj.payload);
            requestObj.payload = reqObj.payload;
        }
        let currentContext = ref.contextService.getContextRecord(
            ref.currentPage.contextKey +
                ref.contextService.getRootViewMap(ref.currentPage.contextKey)
        );
        let req = {};
        //This is a special case where template settings are saved as Setting json in the settings directly instead of seperate object

        let isSpecialCase =
            dynamicAction.CodeCode === StandardCodes.UPDATE_TEMPLATE ||
            dynamicAction.CodeCode === StandardCodes.DELETE_TEMPLATE;

        if (isSpecialCase) {
            let id = requestObj.payload._id;
            delete requestObj.payload._id;
            if (dynamicAction.CodeCode === StandardCodes.UPDATE_TEMPLATE) {
                requestObj.payload = {
                    SettingJSON: {
                        DataForm: ref.currentView._id,
                        Template: requestObj.payload
                    },
                    _id: id
                };
            } else if (dynamicAction.CodeCode === StandardCodes.DELETE_TEMPLATE) {
                requestObj.payload = {
                    SettingJSON: null,
                    _id: id
                };
            }
        }
        let requestPayload = requestObj.payload;
        if (currentContext) {
            if (currentContext['criteria']) {
                req = ref.actionService.getUpdateNewReqObj(req, currentContext);
                requestObj = ref.actionService.getUpdateNestedReq(
                    req,
                    currentContext,
                    requestObj.payload,
                    ref.currentView,
                    isSpecialCase
                );
            } else {
                requestObj = ref.actionService.getUpdateReqObj(
                    req,
                    currentContext,
                    requestObj.payload,
                    ref
                );
            }
        } else {
            requestObj = ref.actionService.getUpdateReqObj(
                req,
                { dataObjectCodeCode: ref.currentView.CodeDataObject },
                requestObj.payload,
                ref
            );
        }

        if (ref.isUpdateAllowed) {
            ref.requestHandler
                .handleRequest(requestObj, dynamicAction, undefined, queryParams, true)
                .subscribe(
                    async (responseData) => {
                        Helpers.removeErrors(ref.currentView, null);
                        this.removeDataChanges(ref.currentView);
                        let parsedObject = Utils.getCopy(requestObj);
                        let updatedFields = [];
                        if (requestObj.payload) {
                            updatedFields = Object.keys(requestObj.payload);
                        }

                        if (dynamicAction.CodeCode === StandardCodes.DELETE_TEMPLATE) {
                            ref.deleteTemplate();
                        } else {
                            if (!subDocumentKey) {
                                parsedObject.payload = reqObj.parsedReq;
                                ref.actionService.appendSequenceId(parsedObject, responseData);
                                ref.viewMode = 'VIEW_UPDATE_MODE';
                                parsedObject['updatedFields'] = updatedFields;
                                ref.loadViewActions(ref.taskBar, ref.viewMode);
                                ref.broadcaster.broadcast(
                                    ref.currentPage.CodeUIContainerDesignerParent + 'child_updated',
                                    parsedObject
                                );
                            } else {
                                parsedObject.sequenceId = responseData.sequenceId;
                                requestObj['updatedFields'] = updatedFields;
                                ref.broadcaster.broadcast(
                                    ref.currentPage.CodeUIContainerDesignerParent + 'child_updated',
                                    requestObj
                                );
                            }
                            ref.contextService.removeDataChangeState();
                            let record = ref.getSelectorObject();
                            let recordType = 'Record';
                            if (record) {
                                recordType = record;
                            }
                            ref.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_UPDATED);
                        }
                    },
                    (errorResponse) => {
                        this.appendPreviousChange(ref.currentView);
                        ref.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                        Helpers.addErrors(errorResponse, ref.currentView);
                    }
                );
        } else {
            ref.toastService.addWarningMessage(StandardCodes.EVENTS.NO_CHANGES_MADE);
        }
        // }, 10);
    }

    /**
     * If throws error after saving , then append isDataChange value to Elements.
     *  @param _currentView : contains the data of fields loaded.
     */
    appendPreviousChange(_currentView) {
        for (const _key in _currentView.UIElements) {
            let field = _currentView.UIElements[_key];
            if (field['isDataChange']) {
                field.isDirty = true;
            }
        }
    }

    /**
     * If saved succesfully then remove isDataChange value from Elements.
     *  @param _currentView : contains the data of fields loaded
     */
    removeDataChanges(_currentView) {
        for (const _key in _currentView.UIElements) {
            let field = _currentView.UIElements[_key];
            if (field['isDataChange']) {
                delete field['isDataChange'];
            }
        }
    }

    public onDeleteClicked(dynamicAction: any) {
        this.dialogConfig = this.dialogConfigService.getConfirmationDialogConfig(this.dialogConfig);
        this.dialogConfig.data = {
            type: 'confirm',
            message: StandardCodes.MESSAGES.RECORD_DELETION_WARNING,
            title: 'Delete'
        };
        const dialogRef = this.dialog.open(MWDialogContentComponent, this.dialogConfig);
        const ref = this;
        dialogRef.onClose.subscribe((result) => {
            if (result === true) {
                let currentContext = this.contextService.getContextRecord(
                    ref.currentPage.contextKey +
                        ref.contextService.getRootViewMap(ref.currentPage.contextKey)
                );
                let requestObj = this.actionService.getDeleteRequest(
                    currentContext,
                    ref.currentView
                );

                //     setTimeout(function () {
                ref.requestHandler
                    .handleRequest(requestObj, dynamicAction, undefined, undefined, true)
                    .subscribe(
                        async (responseData) => {
                            if (ref.currentView) {
                                ref.broadcaster.broadcast(
                                    ref.currentPage.CodeUIContainerDesignerParent +
                                        ref.currentPage.containerID +
                                        'child_deleted',
                                    {
                                        selectedRow: ref.selectedRecord,
                                        currentPage: ref.currentPage
                                    }
                                );
                            }
                            ref.loadViewActions(ref.taskBar, ref.viewMode);
                            ref.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_DELETED);
                        },
                        (errorResponse) => {
                            ref.toastService.showCustomToast(TOASTY_ERROR, errorResponse);
                        }
                    );
                //  }, 10);
            }
        });
    }

    private cloneRecord() {
        this.changeMode(CREATE_MODE);
        this.updateAutoAssignFields();
    }
    private updateAutoAssignFields() {
        let fields = this.currentView.UIElements;
        for (let key in fields) {
            let field = fields[key];
            if (field['CodeAutoAssign']) {
                if (!field.CodeValue || field.CodeValue.length) {
                    field.CodeValue = field.CodeValue.replace(/[0-9]/g, '0');
                }
            }
        }
    }
    private changeMode(mode) {
        this.viewMode = mode;
        let data = {
            mode: this.viewMode,
            record: JSON.parse(this.cacheService.getSessionData('previousSelectedRecord'))
        };
        this.viewModeChange.emit(this.viewMode);
        this.loadViewActions(this.taskBar, this.viewMode);
        this.broadcaster.broadcast(
            this.currentPage.CodeUIContainerDesignerParent + 'mode_changed',
            data
        );
    }
    private deleteTemplate() {
        this.broadcaster.broadcast(this.currentPage.containerID + 'load_starting_page');
        this.toastService.addSuccessMessage(StandardCodes.EVENTS.RECORD_DELETED);
    }
}
