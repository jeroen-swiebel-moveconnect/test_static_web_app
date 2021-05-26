import { Component, Input, NgZone, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OAuthService } from 'angular-oauth2-oidc';
import { Editor } from 'primeng';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { CollectionsService } from 'src/app/moveware/services';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { environment } from 'src/environments/environment';
import { ChipList, ChipListComponent } from '@syncfusion/ej2-angular-buttons';

declare function removeShortcut(key_combination): any;
@Component({
    selector: 'lookup',
    templateUrl: './lookup.component.html',
    styleUrls: ['./lookup.component.scss'],
    providers: [DialogService, DynamicDialogConfig, OverlayPanel]
})
export class LookupComponent implements OnInit {
    @Input() currentView: any;
    @Input() viewCode: string;
    @Input() viewId: string;
    @Input() translationContext: any;
    private columnFilters: object;
    isKeyStroke: boolean;
    selectionIndex: any;
    public imgUri: string;
    private mentionValue: string;
    suggestions: any;
    @Input() field: any;
    @Input() currentPage: any;
    @Input() currentRecord: any;
    selectedList: Array<any> = [];
    private lookupList: Array<any>;
    searchText: string;
    lookupCharacter: string;
    KeyStrokeActions: any;
    selection: any;
    selectedValue: any;
    isCached: boolean = false;
    panel: OverlayPanel;
    CodeAction: any;
    currentListIndex: any = 0;
    escapePressed: boolean = false;
    private searchTextCtrl: FormControl;
    private callbackEvent: any;
    event: any;
    specificKeyStrokes: any;
    isLookupEnbled: boolean = false;

    @ViewChild(Editor) editor: Editor;

    text: string;
    @Input() value: any;
    cursorIndex1: any;
    content: any;
    cursorIndex: any;
    isTableHeader: boolean;
    acceptedFormats: string = '';
    acceptedFormatsSet = new Set();
    errorClass: string;
    constructor(
        private collectionsService: CollectionsService,
        private toastService: ToastService,
        private contextService: ContextService,
        private actionService: UIActionService,
        private broadcaster: Broadcaster,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private authService: OAuthService,
        private ngZone: NgZone,
        private cacheService: CacheService,
        private quickTextHandler: QuickTextHandlerService,
        private uiActionService: UIActionService
    ) {}
    ngOnChanges(changes: SimpleChanges) {
        if (changes.value && changes.value.currentValue !== changes.value.previousValue) {
            this.setImageURI();
            this.intializeSelectedList(this.field.CodeValue);
        }
    }

    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
        this.lookupList = [];
        this.searchTextCtrl = new FormControl();
        if (this.field && !this.field.CodeDisplay) {
            this.field.CodeDisplay = [];
            this.field.CodeDisplay.push('CodeDescription');
        } else if (this.field && this.field.CodeDisplay) {
            this.field.CodeDisplay = Utils.getCodeDisplay(this.field.CodeDisplay);
        }
        if (
            this.field &&
            this.field.CodeActions &&
            !Utils.isArrayEmpty(this.field.CodeActions) &&
            this.field.CodeActions[0].JSONParameter &&
            this.field.CodeActions[0].JSONParameter.IsParentContext &&
            Utils.isObjectEmpty(this.currentRecord)
        ) {
            this.isLookupEnbled = true;
        }
        if (this.field) {
            if (!this.field.allActions) {
                this.field.allActions = Utils.getArrayOfProperties(
                    this.field.CodeActions,
                    'CodeUIAction'
                );
            }
            this.intializeSelectedList(this.field.CodeValue);
            this.getKeyStrokeActions();
            this.isKeyStroke = this.isKeyStrokeEnabled();
            this.isTableHeader =
                !Utils.isObjectEmpty(this.currentView) &&
                this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
                !this.field['isTableCell'];
            this.field.dataClass = !this.isTableHeader
                ? 'data' + this.currentView['_id'] + this.field._id
                : '';
            this.field.headerClass = !this.isTableHeader
                ? 'header' + this.currentView['_id'] + this.field._id
                : '';
            this.replaceQuickTextsIfAvailable();
        }
    }

    public getValueWithCodeDisplay(codeValue) {
        return Utils.applyCodeDisplaytoField(
            Utils.getCodeDisplay(this.field.CodeDisplay),
            codeValue,
            false
        );
    }

    private replaceQuickTextsIfAvailable() {
        this.lookupCharacter = this.uiActionService.getLookupCharacterIfReplaceQuickTextAction(
            this.currentRecord,
            this.field,
            this.lookupCharacter
        );
    }

    private getKeyStrokeActions() {
        let keystrokes = [];
        if (!Utils.isArrayEmpty(this.field.CodeActions)) {
            this.KeyStrokeActions = this.field.CodeActions.filter((action) => {
                if (action[StandardCodes.CODE_UI_ACTION] === StandardCodes.SPECIFIC_KEYSTROKE) {
                    if (
                        action[StandardCodes.LOOKUP_CHARACTER] &&
                        action[StandardCodes.LOOKUP_CHARACTER].length > 1
                    ) {
                        keystrokes.push(action[StandardCodes.LOOKUP_CHARACTER].replace(/\s/g, ''));
                    }
                    return action;
                }
            });
            this.specificKeyStrokes = keystrokes;
        }
        this.field.allActions = this.field.allActions?.filter((action) => {
            if (action !== 'click' || action !== 'mouseleave') {
                return action;
            }
        });
    }

    set setField(field) {
        this.field = field;
        this.intializeSelectedList(this.field.CodeValue);
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    private intializeSelectedList(values) {
        if (!(this.field.CodeFieldType == 'Rich Text' || this.field.CodeFieldType == 'Notes')) {
            if (values && Array.isArray(values) && values.length > 0) {
                this.selectedList = [];
                if (typeof values[0] === 'object') {
                    this.selectedList = [];
                    this.selectedList = Utils.getCopy(values);
                }
                if (!Utils.isArrayEmpty(this.selectedList)) {
                    this.selectedList.forEach((item) => {
                        item['label'] = this.getValueWithCodeDisplay(item);
                    });
                }
            } else {
                this.selectedList = [];
            }
        } else {
            this.selectedText = values ? values : '';
        }
    }
    private selectOption(option) {
        this.markDirty();
    }
    private markDirty() {
        if (this.field.isOnlyLookup) {
            this.field.isDirty = true;
        }
        if (this.field.isRuleValue) {
            let event = {};
            event['value'] = this.field.CodeValue;
            event['sourceElement'] = this.field._id;
            this.broadcaster.broadcast(this.currentView._id + 'ruleValue', event);
        }
    }

    public clear() {
        if (this.imgUri) {
            this.imgUri = '';
        }
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
        this.selectedList = [];
        this.field.CodeValue = null;
        this.selectedText = '';
    }

    /**
     * removes the option from the list of available values
     * @param event :event containing the option to be removed
     */
    public removeOption(chipItem) {
        let optionId = chipItem._id;
        let selectedData = this.getOnlyIds(this.selectedList);
        const optionIndex = selectedData.findIndex((option) => {
            return (
                option === optionId ||
                (option._id && option._id === optionId) ||
                (option.CodeCode && option.CodeCode === optionId)
            );
        });
        if (optionIndex >= 0) {
            selectedData.splice(optionIndex, 1);
        }
        this.contextService.saveDataChangeState();
        if (!Utils.isArrayEmpty(selectedData)) {
            this.field.CodeValue = this.getOnlyIds(this.selectedList);
        } else {
            this.field.CodeValue = null;
        }
        this.markDirty();
    }
    public getOnlyIds(arrayOfObjects) {
        let arrayOfObjects2 = null;
        if (Array.isArray(arrayOfObjects)) {
            arrayOfObjects2 = [];
            for (let element in arrayOfObjects) {
                if (arrayOfObjects[element] && typeof arrayOfObjects[element] == 'object') {
                    arrayOfObjects2[element] = arrayOfObjects[element]['_id'];
                }
            }
        }
        return arrayOfObjects2;
    }
    public selectedText: any;
    private lookupEvent: any;
    private registerLookupEvents(data) {
        this.lookupEvent = this.broadcaster
            .on<string>(data[StandardCodes.UI_CONTAINER_CODE] + 'closeLookup')
            .subscribe(async (lookupValues: any) => {
                this.destroyEvents(this.lookupEvent);
                if (lookupValues && lookupValues.selectedRecords) {
                    let result = lookupValues.selectedRecords;
                    this.markDirty();
                    if (
                        !(
                            this.field.CodeFieldType == 'Rich Text' ||
                            this.field.CodeFieldType == 'Notes' ||
                            this.field.CodeFieldType == StandardCodes.CODE_FILE_UPLOAD
                        )
                    ) {
                        if (!(result && Array.isArray(result))) {
                            this.selectedList.push(result);
                            this.field.CodeValue = result['_id'];
                        } else {
                            this.selectedList = result;
                            this.field.CodeValue = this.getOnlyIds(this.selectedList);
                        }
                    } else if (this.field.CodeFieldType == StandardCodes.CODE_FILE_UPLOAD) {
                        this.markDirty();
                        if (!(result && Array.isArray(result))) {
                            //need to implement for multi-files upload
                        } else {
                            this.selectedList = result;
                            this.field.CodeValue = result[0];
                            if (
                                this.acceptedFormatsSet.size > 0 &&
                                !this.acceptedFormatsSet.has(
                                    this.field.CodeValue?.FileSearchName.substring(
                                        this.field.CodeValue?.FileSearchName.lastIndexOf('.') + 1,
                                        this.field.CodeValue?.FileSearchName.length
                                    )
                                )
                            ) {
                                this.toastService.addErrorMessage(
                                    'ERROR-CODE : 105',
                                    StandardCodes.EVENTS.FILE_FORMAT_INVALID
                                );
                                console.error(
                                    this.field.CodeValue?.toUpperCase() +
                                        ' is not a valid file format. Please select valid file formats like: ' +
                                        this.acceptedFormats.toUpperCase()
                                );
                                this.errorClass = 'error';
                            }
                        }
                        this.imgUri = Utils.getFileFullpath(this.field.CodeValue?._id);
                    } else {
                        if (lookupValues && !Utils.isArrayEmpty(lookupValues['selectedRecords'])) {
                            const lookupSelectedValue =
                                lookupValues['selectedRecords'][0][this.field.CodeDisplay];
                        }
                    }
                    this.contextService.saveDataChangeState();
                }
            });
        this.callbackEvent = this.broadcaster
            .on<string>(data[StandardCodes.UI_CONTAINER_CODE] + 'callback')
            .subscribe(async (callbackData: any) => {
                let callbackMethods = callbackData.callBack.split('();');
                for (let method of callbackMethods) {
                    this.destroyEvents(this.callbackEvent);
                    this.invokeCallbacks(method);
                }
            });
    }
    invokeCallbacks(method) {
        if (method) {
            return this[method].call(this);
        }
    }

    private fetchCodeAction(value: any) {
        if (!Utils.isArrayEmpty(this.KeyStrokeActions)) {
            const codeActionWithLookup = this.KeyStrokeActions.find((action) => {
                if (
                    value.startsWith(action[StandardCodes.LOOKUP_CHARACTER]) &&
                    !(
                        action['JSONParameter'] &&
                        action['JSONParameter']['output'] &&
                        action['JSONParameter']['output'] === 'replace'
                    )
                ) {
                    return action;
                }
            });
            if (codeActionWithLookup) {
                this.lookupCharacter = codeActionWithLookup[StandardCodes.LOOKUP_CHARACTER];
                if (value.startsWith(this.lookupCharacter)) {
                    this.mentionValue = value.substring(
                        value.lastIndexOf(this.lookupCharacter) + 1,
                        (<HTMLInputElement>event.target).selectionEnd
                    );
                    this.CodeAction = codeActionWithLookup;
                } else {
                    this.CodeAction = null;
                }
            } else {
                this.fetchCodeActionWithoutLookup(value);
            }
        }
    }

    private fetchCodeActionWithoutLookup(value: any) {
        const codeActionWithoutLookup = this.KeyStrokeActions.find((action) => {
            if (!action[StandardCodes.LOOKUP_CHARACTER]) {
                return action;
            }
        });
        if (codeActionWithoutLookup && value.length > 0) {
            this.lookupCharacter = '';
            this.mentionValue = value;
            this.CodeAction = codeActionWithoutLookup;
        } else {
            this.CodeAction = null;
        }
    }

    private isKeyStrokeEnabled() {
        let actions = this.field.allActions.toString();
        return actions.indexOf(StandardCodes.SPECIFIC_KEYSTROKE) >= 0;
    }

    public loadLookup() {
        let actionType = StandardCodes.UI_LOOKUP_CLICK;
        if (this.field.allActions.includes(actionType)) {
            let selectedData = this.actionService.getActionDetails(
                this.field,
                null,
                actionType,
                ''
            );
            if (!Utils.isArrayEmpty(this.selectedList)) {
                selectedData.selectedRecords = {};
                selectedData.selectedRecords['idsList'] = this.getOnlyIds(this.selectedList);
                if (!Utils.isArrayEmpty(selectedData.selectedRecords['idsList'])) {
                    selectedData.selectedRecords['objectsList'] = this.selectedList;
                }
            }
            if (selectedData.IsParentContext) {
                selectedData.parentContainerId = this.currentPage.contextKey;
            } else {
                selectedData.parentContainerId = selectedData.UIContainer;
            }
            this.actionService.actionHandler(
                selectedData,
                null,
                actionType,
                null,
                null,
                this.dialog,
                this.dialogConfig
            );
            this.registerLookupEvents(selectedData);
        }
        this.contextService.removeDataChangeState();
    }

    private refreshField() {
        let includes = [];
        includes.push(this.field.CodeCode);
        let context = this.contextService.getContextRecord(
            this.currentPage.contextKey +
                this.contextService.getRootViewMap(this.currentPage.contextKey)
        );
        let rerObj = Utils.getContainerViewReq(
            context,
            this.currentPage.CodeElement,
            this.currentRecord._id,
            includes
        );
        rerObj['sequenceId'] = this.currentRecord.sequenceId;
        this.collectionsService.refreshRecord(rerObj).subscribe(
            async (responseData) => {
                let values = Utils.getResponseBody(responseData);
                if (values) {
                    this.intializeSelectedList(values[this.field.CodeCode]);
                }
            },
            (errorResponse) => {
                this.toastService.showCustomToast('error', errorResponse);
            }
        );
    }
    setImageURI() {
        if (this.field.CodeValue && this.field.CodeFieldType === StandardCodes.CODE_FILE_UPLOAD) {
            length = this.field[StandardCodes.SUPPORTED_FORMATS]?.length;
            if (this.field[StandardCodes.SUPPORTED_FORMATS] && length >= 0) {
                this.field[StandardCodes.SUPPORTED_FORMATS].forEach((element) => {
                    let fileFormat = element?.CodeCode?.toLocaleLowerCase();
                    this.acceptedFormats = this.acceptedFormats + '.' + fileFormat + ' , ';
                    this.acceptedFormatsSet.add(fileFormat);
                });
            }
            if (length >= 0) {
                this.acceptedFormats = this.acceptedFormats.substring(
                    0,
                    this.acceptedFormats.length - 2
                );
            }
            this.imgUri = Utils.getFileFullpath(this.field.CodeValue?._id);
        } else {
            this.imgUri = null;
        }
    }
    /**
     * <p> To track the for loop(angular internally uses trackby methods to keep track of modified records and updates only them)</p>
     * @param item :
     */
    getTrackBy(item) {
        return item._id;
    }

    destroyEvents(event) {
        if (event) {
            event.unsubscribe();
        }
    }
    ngOnDestroy() {
        this.destroyEvents(this.callbackEvent);
        this.destroyEvents(this.lookupEvent);
        if (!Utils.isArrayEmpty(this.specificKeyStrokes)) {
            this.specificKeyStrokes.forEach((keystroke) => {
                removeShortcut(keystroke);
            });
        }
    }
}
