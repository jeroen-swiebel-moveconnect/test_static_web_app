import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { CollectionsService } from 'src/app/moveware/services';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DialogConfigurationService } from 'src/app/moveware/services/dialog-configuration.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { ToastService } from 'src/app/moveware/services/toast.service';
import Utils from 'src/app/moveware/services/utils';
import { UIActionZoominContentComponent } from '../../modals/ui-action-zoomin/ui-action-zoomin.component';
import { FieldConfig } from '../field.interface';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { DialogComponent, OpenEventArgs, CloseEventArgs } from '@syncfusion/ej2-angular-popups';

declare function removeShortcut(key_combination): any;
@Component({
    selector: 'app-textarea',
    templateUrl: './input.textarea.component.html',
    styleUrls: ['./input.textarea.component.scss'],
    providers: [DialogService, DynamicDialogConfig]
})

/**
 * <p> The component is loaded when field type is textarea </p>
 */
export class TextAreaComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentRecord: any;
    @Input() translationContext: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @ViewChild('ejDialog') dialogRef: DialogComponent;
    group: FormGroup;
    private fieldUpdateEvent: any;
    showNotes: boolean;
    globalEventsNames: any[];
    CodeLookupEnabled: boolean;
    isDoubleClick: boolean;
    isCodeDisplay: boolean;
    quickTexts: any;
    filteredTexts: any;
    mentionValue: string;
    selection: any;
    lookupCharacter: string;
    isTableHeader: boolean;
    KeyStrokeActions: any;
    selectedValue: any;
    isCached: boolean = false;
    CodeAction: any;
    isKeyStroke: boolean;
    isQuickText: boolean;
    currentListIndex: any = 0;
    escapePressed: boolean = false;
    event: any;
    specificKeyStrokes: any;
    fieldLabel: string;
    componentType: string = 'textarea';
    // Set Dialog position
    public position: object = { X: 'left', Y: 'top' };

    constructor(
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private toastService: ToastService,
        private cacheService: CacheService,
        private dialog: DialogService,
        private dialogConfig: DynamicDialogConfig,
        private dialogConfigService: DialogConfigurationService,
        private collectionsService: CollectionsService,
        private quickTextHandler: QuickTextHandlerService,
        private uiActionService: UIActionService
    ) {}

    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        this.field.CodeLookupEnabled = this.isLookupEnabled();
        this.isDoubleClick = this.isDoubleClickEnabled();
        this.isCodeDisplay = this.isCodeDisplayField();

        this.getKeyStrokeActions();
        if (this.field.CodeValue && this.field['CodeDataType'] === 'JSON') {
            setTimeout(() => {
                this.broadcastJsonValue();
            }, 100);
        }
        this.field.isOnlyLookup = Utils.getLookupType(
            this.field.CodeActions,
            StandardCodes.UI_LOOKUP_CLICK
        );
        // this.regiterFieldUpdate();
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
        this.applySetting('field_update');
        Utils.replaceQuickTextsIfAvailable(this);
    }

    /**
     * <p>used to apply settings based on the input type.</p>
     * @param type : input type like field_update, field_reset.
     */
    applySetting(type) {
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler)
        ) {
            let _targetEvents = Utils.getEventTargetData(
                this.field,
                this.globalEventsNames,
                this.quickTextHandler
            );
            this.broadcaster.broadcast(this.currentView['CodeCode'] + 'apply_settings', {
                eventType: type,
                eventName: this.field.CodeCode,
                eventData: _targetEvents
            });
        }
    }

    /**
     * <p>Called on right click of field .</p>
     * @param event mouseEvent
     * @param input TextArea Component Instance
     */
    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
    }

    /**
     * <p>Called on focusOut of cursor on field.</p>
     * @param $event mouse event
     */
    onFocusOut() {
        this.showNotes = !this.showNotes;
        if (this.field.CodeValue && this.field['CodeDataType'] === 'JSON') {
            this.broadcastJsonValue();
        }
    }

    onFocus() {
        this.showNotes = true;
    }

    set setField(field) {
        this.field = field;
        if (this.field.CodeValue && this.field['CodeDataType'] === 'JSON') {
            setTimeout(() => {
                this.broadcastJsonValue();
            }, 100);
        }
        Utils.replaceQuickTextsIfAvailable(this);
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    /**
     * <p>Called on Key Press.</p>
     * @param event KeyBoard Event
     */
    onKeyPress(event) {
        Utils.keyPress(this, event);
    }

    /**
     * <p> To handle the open of the list of quick text in the dialog  </p>
     * @param args : OpenEventArgs
     */
    onDialogOpen(args: OpenEventArgs) {
        args.preventFocus = true;
    }

    /**
     * <p>Triggered when mouse events are encountered.</p>
     * @param event mouse Event
     */
    onMouseUp(event) {
        if (this.dialogRef && this.dialogRef.visible) {
            this.dialogRef.hide();
        }
    }

    /**
     * <p>To get specific KeyStroke Actions.</p>
     */
    private getKeyStrokeActions() {
        let keystrokes = [];
        if (!Utils.isArrayEmpty(this.field.CodeActions)) {
            this.KeyStrokeActions = this.field.CodeActions.filter((action) => {
                if (action[StandardCodes.CODE_UI_ACTION] === StandardCodes.SPECIFIC_KEYSTROKE) {
                    if (action[StandardCodes.LOOKUP_CHARACTER]) {
                        if (action[StandardCodes.LOOKUP_CHARACTER].length > 1) {
                            keystrokes.push(
                                action[StandardCodes.LOOKUP_CHARACTER].replace(/\s/g, '')
                            );
                        }
                        if (action.Task && action.Task.CodeCode === 'Quick Text') {
                            this.isQuickText = true;
                        }
                    }
                    return action;
                }
            });
            this.specificKeyStrokes = keystrokes;
            this.isKeyStroke = this.KeyStrokeActions.length > 0;
        }

        this.field.allActions = this.field.allActions.filter((action) => {
            if (action !== 'click' || action !== 'mouseleave') {
                return action;
            }
        });
    }

    /**
     * <p>On value selected from suggestions.</p>
     * @param selected selected value from suggestions.
     */
    onValueSelect(selected: any) {
        let task = Utils.fetchTask(this.CodeAction);
        if (
            this.CodeAction &&
            this.CodeAction['JSONParameter'] &&
            this.CodeAction['JSONParameter']['output']
        ) {
            Utils.executeTasks(
                this,
                task,
                'set',
                selected,
                this.CodeAction['JSONParameter']['output']
            );
        } else if (this.CodeAction) {
            Utils.executeTasks(this, task, 'set', selected);
        }
        //this.dialogRef.hide();
        this.dialogRef.hide();
        let element = <HTMLInputElement>(
            document.getElementById(this.field._id + '_' + this.field.CodeCode)
        );
        if (element) {
            element.focus();
            element.setSelectionRange(this.selection, this.selection);
            element.selectionEnd = this.selection;
        }
    }

    /**
     * <p>Returns true if fields CodeCode is CodeDisplay.</p>
     */
    isCodeDisplayField() {
        return this.field.CodeCode === 'CodeDisplay';
    }

    /**
     * <p>Handles Keyboard events.</p>
     * @param event KeyBoard Event
     */
    handleKeyboardEvent(event) {
        Utils.handleKeyboardEvent(this, event);
    }

    /**
     * <p> Returns parsed JSON of fields CodeValue if current record is available or returns fields CodeValue if it is object or returns null.</p>
     */
    getJsonValue() {
        if (!this.currentRecord._id) {
            try {
                return JSON.parse(this.field.CodeValue);
            } catch (e) {
                this.toastService.addErrorMessage(StandardCodes.EVENTS.DATA_ENTRY_ERROR);
                return null;
            }
        } else {
            if (typeof this.field.CodeValue === 'object') {
                return this.field.CodeValue;
            } else {
                try {
                    return JSON.parse(this.field.CodeValue);
                } catch (e) {
                    this.toastService.addErrorMessage(StandardCodes.EVENTS.DATA_ENTRY_ERROR);
                    return null;
                }
            }
        }
    }

    /**
     * <p>loads details on doubleclick.</p>
     * @param event MouseEvent
     */
    loadDetails(event: any) {
        if (this.isTaskZoomIn()) {
            let inputField = Utils.getCopy(this.field);
            let codeActions = Utils.getAction(
                inputField['CodeActions'],
                StandardCodes.UI_ACTION_DOUBLE_CLICK
            );
            inputField.position = codeActions.CodeUILocation;
            const dialogRef = this.dialog.open(
                UIActionZoominContentComponent,
                this.dialogConfigService.getDialogConfiguration(inputField, this.dialogConfig)
            );
            dialogRef.onClose.subscribe((result) => {
                if (result) {
                    this.onDialogClose(result);
                }
            });
        }
    }

    /**
     * <p>Called on close of dialog.</p>
     * @param result text
     */
    onDialogClose(result: any) {
        this.field.CodeValue = result.value;
        this.field['isDirty'] = true;
        if (this.field.CodeValue && this.field['CodeDataType'] === 'JSON') {
            this.broadcastJsonValue();
        }
    }

    /**
     * <p>Returns true if ZoomIn Action is configured.</p>
     */
    private isTaskZoomIn() {
        let methods = Utils.getArrayOfProperties(this.field.CodeActions, StandardCodes.TASK_CODE);
        let index = methods.findIndex((method) => {
            return method['CodeCode'] === StandardCodes.TASK_ZOOM_IN;
        });
        return index >= 0;
    }

    /**
     * <p>Returns index if Double-Click Action is configured.</p>
     */
    private isDoubleClickEnabled() {
        let actions = this.field.allActions.toString();
        return actions.indexOf(StandardCodes.UI_ACTION_DOUBLE_CLICK) >= 0;
    }

    /**
     * <p>Returns true id Lookup is Enabled.</p>
     */
    private isLookupEnabled() {
        this.field.allActions = Utils.getArrayOfProperties(this.field.CodeActions, 'CodeUIAction');
        let actions = this.field.allActions.toString();
        return actions.indexOf('Lookup') >= 0 ? true : false;
    }

    /**
     * <p>Detects the changes made.</p>
     * @param event DOMEvent
     */
    public markDirty(event?: any) {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
        // if (this.globalEventsNames && Utils.isEventSource(this.field, this.globalEventsNames)) {
        //     this.eventsListener.onEventUpdate({ eventType: 'field_update', eventName: this.field.CodeCode });
        // }
        if (!Utils.isObjectEmpty(event)) {
            this.field.CodeValue = event;
        } else {
            this.field.CodeValue = null;
        }
    }

    /**
     * <p> Registers field updations.</p>
     */
    private regiterFieldUpdate() {
        this.fieldUpdateEvent = this.broadcaster
            .on<any>(this.field.CodeCode + 'field_updated')
            .subscribe(async (_field) => {
                this.field[_field.key] = _field.value;
            });
    }

    /**
     * <p> Used for broadcasting JSON Value.</p>
     */
    private broadcastJsonValue() {
        const jsonValue = this.getJsonValue();
        if (jsonValue) {
            this.broadcaster.broadcast(this.field.CodeCode + 'parentFiledChanged', {
                [this.field.CodeCode]: jsonValue
            });
        }
    }

    /**
     * <p> to remove tooltip if CodeHelp is empty </p>
     *
     * @param event : Mouse Hover Event
     * @param fieldCodeHelp : field's CodeHelp Value
     */
    beforeOpenToolTip(event, fieldCodeHelp: string) {
        if (!fieldCodeHelp || fieldCodeHelp.length <= 0) {
            event.cancel = true;
        }
    }

    ngOnDestroy() {
        if (this.fieldUpdateEvent) {
            this.fieldUpdateEvent.unsubscribe();
        }
        if (!Utils.isArrayEmpty(this.specificKeyStrokes)) {
            this.specificKeyStrokes.forEach((keystroke) => {
                removeShortcut(keystroke);
            });
        }
    }
}
