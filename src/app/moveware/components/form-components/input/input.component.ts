import { Component, OnInit, Input, HostListener, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CollectionsService } from 'src/app/moveware/services';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { DialogComponent, OpenEventArgs } from '@syncfusion/ej2-angular-popups';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ContextService } from '../../../services/context.service';
import { DataFormService } from '../../../services/dataform-service';
import Utils from '../../../services/utils';
declare function removeShortcut(key_combination): any;
@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.scss']
})

/**
 * <p> If fieldtype is Text then this component is loaded. </p>
 */
export class InputComponent implements OnInit {
    @Input() field: FieldConfig;
    group: FormGroup;
    showNotes: boolean;
    viewMode: string;
    @Input() translationContext: any;
    fieldUpdateEvent: any;
    CodeLookupEnabled: boolean;
    isKeyStroke: boolean;
    isQuickText: boolean;
    isIdExist: boolean = false;
    valueSelected: boolean = true;
    selectedList: any = [];
    filteredTexts: any;
    quickTexts: any;
    lookupCharacter: string;
    selection: any;
    KeyStrokeActions: any;
    globalEventsNames: any[];
    mentionValue: string;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() currentPage: any;
    loadDynamicFilter: Function;
    isTableHeader: boolean;
    marginStyle: any;
    selectedValue: any;
    isCached: boolean = false;
    CodeAction: any;
    currentListIndex: any = 0;
    escapePressed: boolean = false;
    event: any;
    specificKeyStrokes: any;
    fieldLabel: String;
    componentType: String = 'input';
    @ViewChild('ejDialog') dialogRef: DialogComponent;
    @ViewChild('inputText') inputObj: TextBoxComponent;
    // Set Dialog position
    position: object = { X: 'left', Y: 'top' };

    constructor(
        private contextService: ContextService,
        private collectionsService: CollectionsService,
        private broadcaster: Broadcaster,
        private cacheService: CacheService,
        private gridService: GridService,
        private quickTextHandler: QuickTextHandlerService,
        private uiActionService: UIActionService,
        private formService: DataFormService
    ) {}
    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        this.field.isOnlyLookup = Utils.getLookupType(
            this.field.CodeActions,
            StandardCodes.UI_LOOKUP_CLICK
        );
        this.getKeyStrokeActions();
        this.quickTexts = JSON.parse(this.cacheService.getSessionData(StandardCodes.QUICK_TEXT));
        // this.regiterFieldUpdate(),
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field['isTableCell'];
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass =
            !this.isTableHeader && !this.field.isTableCell
                ? 'header' + this.currentView['_id'] + this.field._id
                : '';
        Utils.replaceQuickTextsIfAvailable(this);
        this.field.CodeLookupEnabled = this.isLookupEnabled();
        this.setMode();
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
        if (!Utils.isArrayEmpty(this.field.allActions)) {
            this.field.allActions = this.field.allActions.filter((action) => {
                if (action !== 'click' || action !== 'mouseleave') {
                    return action;
                }
            });
        }
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    /**
     * <p>Called on focusOut of cursor on field.</p>
     * @param $event mouse event
     */
    onFocusOut($event) {
        this.showNotes = !this.showNotes;
        if (this.field['isDirty']) {
            if (this.field['isTableCell']) {
                if (this.field.CodeValue !== this.field['originalValue']) {
                    this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
                }
                if (this.currentRecord) {
                    this.currentRecord[this.field.CodeCode] = this.field.CodeValue;
                }
            } else if (
                !Utils.isObjectEmpty(this.currentView) &&
                this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM
            ) {
                this.searchColumnFilter($event);
            } else {
                this.validate();
            }
        }
    }

    private validate() {
        if (
            this.currentView['CodeType'] == StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isRuleValue
        ) {
            let event = { [this.field.CodeCode]: this.field.CodeValue || null };

            this.formService.validateField(
                event,
                { contextKey: this.currentPage.contextKey },
                this.currentView
            );
        }
    }
    onFocus(data) {
        this.formService.currentFocusedElement = this.inputObj;
    }
    /**
     * <p>Searching in ColumnFilters of Grid.</p>
     * @param $event DOMEvent
     */
    searchColumnFilter($event) {
        if ($event && $event.stopPropagation) {
            $event.stopPropagation();
        }
        if (
            this.field['isDirty'] &&
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell &&
            !this.field.isRuleValue
        ) {
            let filtertype = this.field.CodeColumnFilterType
                ? this.field.CodeColumnFilterType
                : this.field.CodeFilterType;
            if (!filtertype) {
                filtertype = this.field.CodeFieldType;
            }
            let data = {
                elementRef: this.formService.currentFocusedElement,
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType:
                    this.field.CodeElement === StandardCodes.FIELD_GROUP
                        ? StandardCodes.FIELD_GROUP
                        : filtertype,
                CodeSubField: this.field.CodeSubField || 'CodeCode',
                value: this.field.CodeValue ? this.field.CodeValue : '',
                values: this.field.options ? this.field.options : '',
                children: this.field.Children,
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
            this.field['isDirty'] = false;
        }
    }

    /**
     * <p>Returns true if lookup is enabled.</p>
     */
    private isLookupEnabled() {
        this.field.allActions = Utils.getArrayOfProperties(this.field.CodeActions, 'CodeUIAction');
        if (!this.field.allActions) {
            this.field.allActions = [];
        }
        let actions = '';
        actions = this.field.allActions.toString();
        return actions.indexOf('Lookup') >= 0 ? true : false;
    }

    /**
     * <p>To replace quickText with Tag.</p>
     * @param text inputText value for replacing.
     */
    replaceQuickTextWithTag(text) {
        this.selectedValue = { label: text };
        this.markDirty(this.selectedValue, true);
    }

    /**
     * <p>To replace quickText with Value.</p>
     * @param text inputText value for replacing
     */
    replaceQuickTextWithValue(text) {
        this.selectedValue = { label: text };
        this.markDirty(this.selectedValue, true);
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
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.dialogRef.hide();
        this.field['isDirty'] = true;
        let element = <HTMLInputElement>(
            document.getElementById(this.field._id + this.field.CodeCode)
        );
        if (element) {
            element.focus();
            element.setSelectionRange(this.selection, this.selection);
        }
    }

    /**
     * <p>Handles Keyboard events.</p>
     * @param event KeyBoard Event
     */
    handleKeyboardEvent(event) {
        if (this.dialogRef && this.dialogRef.visible) {
            if (event.which === 27) {
                this.escapePressed = true;
                this.dialogRef.hide();
            } else if (event.which === 40) {
                if (this.filteredTexts && this.currentListIndex < this.filteredTexts.length) {
                    this.currentListIndex = this.currentListIndex + 1;
                } else {
                    this.currentListIndex = 0;
                }
            } else if (event.which === 38) {
                if (this.currentListIndex > 0) {
                    this.currentListIndex = this.currentListIndex - 1;
                }
            } else if (event.which === 13) {
                this.onValueSelect(this.filteredTexts[this.currentListIndex]);
                event.preventDefault();
            }
        }
        if (event.which === 27 || event.which === 40 || event.which === 38 || event.which === 13) {
            if (this.dialogRef && this.dialogRef.visible) {
                event.preventDefault();
                return false;
            } else {
                return true;
            }
        }
    }

    /**
     * <p>On Adding chips.</p>
     * @param event DOMEvent
     */
    onChipAdded(event) {
        if (!this.isIdExist) {
            this.field.CodeValue.push(event.value);
        }
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.field['isDirty'] = true;
    }

    /**
     * <p>On Removing chips.</p>
     * @param event DOMEvent
     */
    onChipRemoved(event) {
        const index = this.field.CodeValue.indexOf(event.value, 0);
        if (index > -1) {
            this.field.CodeValue.splice(index, 1);
        }
        this.field['isDirty'] = true;
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
    }

    /**
     * <p>Triggered when some changes are detected.</p>
     * @param event DOMEvent
     * @param DOMInteraction true if called from DOM ,had DOMInteraction.
     */
    public markDirty(event, DOMInteraction) {
        this.field['isDirty'] = true;
        if (event && event.value) {
            this.field.CodeValue = event.value;
        } else if ((event && event.value === '') || !event.value || !this.field.CodeValue) {
            this.field.CodeValue = null;
            if (
                !Utils.isObjectEmpty(this.currentView) &&
                this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
                !this.field.isTableCell
            ) {
                this.searchColumnFilter(event);
            }
        }
        if (DOMInteraction) {
            if (!this.field.CodeValue) {
                this.field.CodeValue = [];
            }
            if (this.selectedList.indexOf(event.label) < 0) {
                this.selectedList.push(event.label);
            }

            if (this.isIdExist) {
                if (this.field.CodeValue.indexOf(event._id) < 0) {
                    this.field.CodeValue.push(event._id);
                }
            } else {
                if (event.label && this.field.CodeValue.indexOf(event.label) < 0) {
                    this.field.CodeValue?.push(event.label);
                }
            }
            $('.options-text .ui-chips-input-token input').val('');
        }
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.formService.setRuleValue(this.field, this.currentView, this.inputObj);
    }

    /**
     * <p>Called on Key Press.</p>
     * @param event KeyBoard Event
     */
    onKeyPress(event: any) {
        Utils.keyPress(this, event);
    }

    /**
     * <p>Quick Text dialog does not take focus.</p>
     * @param args - OpenEventArgs
     */
    onDialogOpen(args: OpenEventArgs) {
        args.preventFocus = true;
    }

    /**
     * <p>Triggered when mouse events are encountered.</p>
     * @param event mouse Event
     */
    onmouseUp(event) {
        this.selection = (<HTMLInputElement>event.target).selectionEnd;
        if (this.dialogRef && this.dialogRef.visible) {
            this.dialogRef.hide();
            (<HTMLInputElement>event.target).setSelectionRange(this.selection, this.selection);
        }
    }

    /**
     * <p>Called on right click of field .</p>
     * @param event mouseEvent
     * @param input TextBox Component Instance
     */
    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
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
     * <p>used to apply settings based on the input type.</p>
     * @param type : input type like field_update, field_reset.
     */
    private applySettings(type) {
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

    set setField(field) {
        this.field = field;
        let value = this.field.CodeValue;
        if (value instanceof Array) {
            value.forEach((element) => {
                this.selectedList.push(element);
            });
        }
        this.applySettings('field_update');
        this.quickTexts = JSON.parse(this.cacheService.getSessionData(StandardCodes.QUICK_TEXT));
        this.regiterFieldUpdate();
        Utils.replaceQuickTextsIfAvailable(this);
        this.setMode();
        // if(this.field && this.field.CodeValue && this.field.CodeValue !== "") {
        //     this.field.CodeValue = this.translate.instant(this.field.CodeValue) ? this.translate.instant(this.field.CodeValue) : this.field.CodeValue;
        // }
    }

    /**
     * <p>Used to set mode like create, update.</p>
     */
    private setMode() {
        if (this.currentRecord && this.currentRecord._id) {
            this.viewMode = StandardCodes.VIEW_UPDATE_MODE;
        } else {
            this.viewMode = StandardCodes.CREATE_MODE;
        }
    }

    /**
     * <p>For loading filters from filterpane in grid.</p>
     * @param value : input text entered in field
     
     */
    public loadFilter(value) {
        if (this.field['isFilter']) {
            let event = {};
            this.field['value'] = value;
            event['field'] = this.field;
            event['filterValue'] = value;
            this.loadDynamicFilter(event);
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
        if (this.dialogRef) {
            this.dialogRef.destroy();
        }
    }
}
