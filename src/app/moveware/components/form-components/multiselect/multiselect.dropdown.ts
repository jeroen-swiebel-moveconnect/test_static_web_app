import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import { EventsListenerService, RequestHandler } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { GridService } from 'src/app/moveware/services/grid-service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import Utils from 'src/app/moveware/services/utils';
import { FieldConfig } from '../field.interface';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
    MultiSelectComponent as SFMultiSelectComponent,
    CheckBoxSelection,
    DropDownTreeComponent
} from '@syncfusion/ej2-angular-dropdowns';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { StandardCodes } from '../../../constants/StandardCodes';
import * as _ from 'lodash';
import { ContextService } from '../../../services/context.service';
SFMultiSelectComponent.Inject(CheckBoxSelection);

/*
 * Syncfusion migration notes:
 *
 * - Two way binding on ngModel doesn't work. Changes made to model gets reflected in template but not the other way around
 * - Right-click context menu conflicts with multiselect dropdown.
 *   A possible solution is to enable showDropDownIcon and disable openOnClick.
 *   However, in that case the dropdown keeps on flickering if you attempt typing into the input
 * - Attributes not supported: escape, resetFilterOnHide
 * - No 'cleared' event available on multiselect
 * - The 'removed' event includes the item been removed, however, it doesn't include the old and / or current set of selected values
 */
@Component({
    selector: 'app-multiselect',
    templateUrl: './multiselect.dropdown.html',
    styleUrls: ['./multiselect.dropdown.scss']
})
export class MultiSelectComponent implements OnInit, OnDestroy {
    @Input() field: FieldConfig;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() fromGrid: boolean;
    @Input() currentPage: any;
    @Input() translationContext: any;

    @ViewChild('multiselect') multiselectObj: SFMultiSelectComponent;
    @ViewChild('dropdowntreelist') multiselectTreeObj: DropDownTreeComponent;

    @Output() valueChanged = new EventEmitter<any>();

    value = [];
    isTableHeader: boolean;
    loadDynamicFilter: Function;

    // Let Syncfusion know how to extract display text and id from each available option
    optionFieldsMapping = { text: 'label', value: '_id' };

    private loadAction: any;
    private onRemoveSubject: Subject<void> = new Subject();
    private fieldUpdateEvent$: Subscription;
    private onRemove$: Subscription;
    public mode: string;
    fieldLabel: string;
    listfields;
    popupWidth: string;
    preventClosing: boolean;
    constructor(
        private eventsListener: EventsListenerService,
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private requestHandler: RequestHandler,
        private quickTextService: QuickTextHandlerService,
        private actionService: UIActionService,
        private formService: DataFormService
    ) {}

    set setField(field) {
        this.field = field;
        if ((!this.field.options || this.field.options.length <= 0) && this.field.parameterNames) {
            // Options not loaded yet?
            this.loadOptionsUsingNamedParameters(); // load them now
        } else {
            this.loadSelectedOptions(); // Otherwise, load the selected options
        }
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }
    onClose(data) {
        if (this.preventClosing) {
            data.cancel = true;
            this.preventClosing = false;
        }
    }
    ngOnInit() {
        // set the type of mode for checkbox to visualized the checkbox added in li element.
        this.mode = 'CheckBox';
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        if ((!this.field.options || this.field.options.length <= 0) && this.field.parameterNames) {
            // Options not loaded yet?
            this.loadOptionsUsingNamedParameters(); // load them now
        } else {
            this.loadSelectedOptions(); // Otherwise, load the selected options
        }
        // if (this.currentView['CodeType'] == StandardCodes.CODE_TYPE_DATA_FORM) {
        //     this.registerFieldUpdate();
        // }
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell;
        this.field.dataClass =
            !this.isTableHeader && !this.field['isTableCell']
                ? 'data' + this.currentView['_id'] + this.field._id
                : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView['_id'] + this.field._id
            : '';
        this.popupWidth = this.isTableHeader ? '200px' : '100%';
        if (this.field.CodeFieldType === StandardCodes.DROPDOWN_TREE) {
            this.listfields = {
                dataSource: this.field.options,
                value: '_id',
                parentValue: 'Parents',
                text: 'label',
                hasChildren: 'hasChilds'
            };
        }

        // Syncfusion doesn't trigger any 'cleared' event when all selections are cleared at once. To cater for
        // this deficiency we listen to the 'removed' event instead. However, when multiple items are cleared at once
        // the 'removed' event is triggered multiple times too, and we don't want the application to react in such a
        // rapid succession. Hence we debounce it and react once only after a short interval
        //
        // TODO: This temporary workaround should ideally be replaced with an onCleared event binding
        if (this.multiselectObj) {
            this.onRemove$ = this.onRemoveSubject.pipe(debounceTime(250)).subscribe(() => {
                this.onChange({ value: this.multiselectObj.value });
            });
        } else if (this.multiselectTreeObj) {
            this.onRemove$ = this.onRemoveSubject.pipe(debounceTime(250)).subscribe(() => {
                this.onChange({ value: this.multiselectTreeObj.value });
            });
        }
    }

    ngOnDestroy() {
        //  console.log('==>' + this.broadcaster._eventBus.observers.length);
        if (this.fieldUpdateEvent$) {
            this.fieldUpdateEvent$.unsubscribe();
        }

        if (this.onRemove$) {
            this.onRemove$.unsubscribe();
        }
        // console.log('after ==>' + this.broadcaster._eventBus.observers.length);
    }

    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
    }

    onKeydown(event) {
        if (event.which === 13) {
            $(event.target)
                .parent()
                .closest('gridster-item')
                .find('.ui-multiselect-trigger')
                .trigger('click');
            event.preventDefault();
        }
    }

    onChange(event) {
        if (this.field['isFilter'] && !this.field.isTableCell) {
            event['field'] = this.field;
            event['filterValue'] = {};
            event['filterValue']['value'] = this.getSelectedOptionsByIds(event?.value);
            this.loadDynamicFilter(event);
        }
        if (event.isInteracted) {
            const isDataForm = this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM;
            // Only proceed if there has been a real change in value. If the value has changed just because
            // we have switched to a different record, we'd ignore the event and return immediately
            if (
                isDataForm &&
                this.areIdsEqual(this.getIdsFromValues('originalValue'), event.value)
            ) {
                return;
            }

            if (!this.currentView || isDataForm) {
                this.contextService.saveDataChangeState();
            }

            this.field.isDirty = true;
            this.field.CodeValue =
                event.value && event.value.length ? Utils.getCopy(event.value) : null; // Copy over new value

            if (isDataForm) {
                this.eventsListener.onEventUpdate({
                    eventType: 'field_update',
                    eventName: this.field.CodeCode
                });
            } else if (
                this.field.isDirty &&
                !Utils.isObjectEmpty(this.currentView) &&
                !this.field.isTableCell
            ) {
                this.handleChangeWhenUsedAsAFilter();
            }

            if (this.field.isTableCell) {
                // Used within a Grid cell?
                this.handleChangeWhenUsedInGrid();
            } else {
                if (this.multiselectObj) {
                    this.formService.setRuleValue(
                        this.field,
                        this.currentView,
                        this.multiselectObj
                    );
                } else if (this.multiselectTreeObj) {
                    this.formService.setRuleValue(
                        this.field,
                        this.currentView,
                        this.multiselectTreeObj
                    );
                }
            }
        }
    }

    onRemove() {
        this.onRemoveSubject.next();
    }

    private registerFieldUpdate() {
        this.fieldUpdateEvent$ = this.broadcaster
            .on<any>(this.field.CodeCode + 'field_updated')
            .subscribe(async (_field) => {
                this.field[_field.key] = _field.value;
            });
    }

    /** Compares two ID arrays for equality */
    private areIdsEqual(a: string[], b: string[]) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }

    /**
     * Returns an array of id's corresponding to values stored within this.field.subField
     *
     * @param subField The field within this.field that needs to be examined
     * @return An array of id's corresponding to values stored within this.field.subField.
     * Returns and empty array if this.field or this.field.subField is undefined
     */
    private getIdsFromValues(subField: string) {
        if (this.field && this.field[subField]) {
            return Array.isArray(this.field[subField])
                ? this.field[subField].map((value) => value._id)
                : this.field[subField]._id
                ? [this.field[subField]._id]
                : [];
        } else {
            return [];
        }
    }

    /** Initialises value based on options selected as found in field.CodeValue */
    private loadSelectedOptions() {
        var filteredValue: string[] = [];
        this.value = this.getIdsFromValues('CodeValue');
        if (this.field.isHeader) {
            filteredValue = _.union(this.value);
        }
        if (!Utils.isArrayEmpty(filteredValue)) {
            this.value = filteredValue;
        }
        this.field.CodeValue = Utils.getCopy(this.value); // Safeguard from accidental mutations
    }

    private loadOptionsUsingNamedParameters() {
        let parentFieldsData = {};
        for (const parameterName of this.field.parameterNames) {
            if (parameterName.includes('@@')) {
                parentFieldsData = this.quickTextService.computeParamterName(
                    parameterName,
                    parentFieldsData
                );
            }
        }

        if (!Utils.isObjectEmpty(parentFieldsData)) {
            this.loadAction = this.actionService.loadAction(this.field.CodeActions);

            const data = this.requestHandler.loadFieldOptions(
                this.field.CodeElement,
                parentFieldsData,
                '',
                this.currentPage ? this.currentPage.CodeElement : '',
                this.loadAction
            );
            data.subscribe(async (_response) => {
                const _responseBody = JSON.parse(_response.body);
                if (!Utils.isArrayEmpty(_responseBody.options)) {
                    const fieldOptions = Utils.parseOptions(
                        _responseBody.options,
                        this.field.CodeValue,
                        ''
                    );
                    this.field.options = fieldOptions.options;
                    this.field.CodeValue = fieldOptions.value;
                    this.loadSelectedOptions();
                }
            });
        }
    }

    private handleChangeWhenUsedInGrid() {
        if (this.field.CodeValue !== this.field['originalValue']) {
            this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
        }
        if (this.currentRecord) {
            if (this.currentRecord && !this.currentRecord[this.field.CodeCode]) {
                this.currentRecord[this.field.CodeCode] = [];
            }

            if (this.field.CodeValue instanceof Array) {
                this.field.CodeValue.forEach((value) => {
                    if (this.currentRecord[this.field.CodeCode].indexOf(value.label) < 0) {
                        this.currentRecord[this.field.CodeCode].push(value.label);
                    }
                });
            } else {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        }
    }

    onFocus(data) {
        this.formService.currentFocusedElement = this.multiselectObj || this.multiselectTreeObj;
    }
    private handleChangeWhenUsedAsAFilter() {
        let filterType = this.field.CodeColumnFilterType
            ? this.field.CodeColumnFilterType
            : this.field.CodeFilterType;
        if (!filterType) {
            filterType = this.field.CodeFieldType;
        }
        this.preventClosing = document.getElementById('multiselect' + this.field._id + '_popup')
            ? true
            : false;
        const data = {
            element: this.formService.currentFocusedElement,
            source: 'searchColumn',
            CodeElement: this.field.CodeElement,
            CodeDescription: this.field.CodeDescription,
            CodeFilterType: filterType,
            CodeSubField: this.field.CodeSubField || 'CodeDescription',
            value: this.field.CodeValue ? this.getSelectedOptionsByIds(this.field.CodeValue) : '',
            values: this.field.options ? this.field.options : '',
            isHeaderFilter: this.field.isHeader
        };
        this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
    }

    /** Given an array of Id's this method looks up in field.options and returns an array of matching options */
    private getSelectedOptionsByIds(ids: string[]): Object[] {
        return ids.map((id) => this.field.options.find((option) => option['_id'] === id));
    }
}
