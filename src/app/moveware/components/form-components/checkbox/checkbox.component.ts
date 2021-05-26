import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import Utils from 'src/app/moveware/services/utils';
import { EventsListenerService } from 'src/app/moveware/services';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

/**
 * Syncfusion migration notes:
 *
 * <p>Features that we still could not port over to Syncfusion version:
 * <ul>
 *     <li> No grouping can be done on multiple checkboxes (although we don't currently use grouping)
 *     <li> Tooltip to be implemented along with SF tooltip
 *     <li> Cannot use required on checkbox (or any boolean fields)
 * </ul>
 */

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() currentRecord: any;
    @Input() translationContext: any;

    loadDynamicFilter: Function;
    group: FormGroup;
    showNotes: boolean;
    globalEventsNames: any[];
    checkedOptions: any[] = [];
    isTableHeader: boolean;
    fieldOptionsLength: number;
    fieldLabel: string;
    @ViewChild('checkbox') checkboxObj: CheckBoxComponent;
    constructor(
        private eventsListener: EventsListenerService,
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private quickTextHandler: QuickTextHandlerService,
        private formService: DataFormService
    ) {}

    ngOnInit() {
        if (this.field['isFilter']) {
            this.fieldOptionsLength = 10;
        } else {
            this.fieldOptionsLength = this.field?.options?.length;
        }
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            !this.field['isTableCell'] &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM;
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView['_id'] + this.field._id
            : '';
    }

    /**
     * <p> To set the field object </p>
     * @param {FieldConfig} field: field to be set
     */
    set setField(field) {
        this.field = field;
        if (field?.options?.length > 0) {
            this.checkedOptions = this.field.CodeValue ? this.field.CodeValue : [];
            this.setSelectedOptions(this.field);
        }
    }

    /**
     * <p> To set the currentRecord object </p>
     * @param {any} currentRecord: currentRecord to be set
     */
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    private showAll(filter) {
        if (!filter.showAll) {
            filter.showAll = true;
        } else {
            filter.showAll = false;
        }
    }

    /**
     * <p> Prepares field to be saved if changed on a data form or editable grid cell.
     *     Broadcasts event if field is changed on a grid column filter </p>
     */
    public markDirty(event, option) {
        if (this.field['isFilter']) {
            let eventData = {};
            eventData['field'] = this.field;
            eventData['filterValue'] = option;
            this.loadDynamicFilter(eventData);
        }
        // Save current state if control is changed on a Data Form
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            if (this.field?.options?.length > 0) {
                if (event) {
                    this.checkedOptions.push(option);
                } else {
                    let index = Utils.getIndexByProperty(this.checkedOptions, '_id', option._id);
                    let indexInFieldOptions = Utils.getIndexByProperty(
                        this.field.options,
                        '_id',
                        option._id
                    );
                    this.field.options[indexInFieldOptions]['isChecked'] = false;
                    this.checkedOptions.splice(index, 1);
                }

                this.field.CodeValue = this.checkedOptions;
            } else {
                this.field.CodeValue = option;
            }
            this.contextService.saveDataChangeState();
        }
        this.field['isDirty'] = true;

        //For Query Builder
        // if (this.field.isRuleValue) {
        //     let event = {};
        //     event['value'] = this.field.CodeValue;
        //     event['sourceElement'] = this.checkboxObj;
        //     this.broadcaster.broadcast(this.currentView._id + 'ruleValue', event);
        // }
        // Listen for quickText events (probably not needed for checkbox)
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler) &&
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.eventsListener.onEventUpdate({
                eventType: 'field_update',
                eventName: this.field.CodeCode
            });
        }

        // Call gridService to handle record change if control is changed on a editable grid cell
        if (this.field['isDirty'] && this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        }

        // Broadcast column filter changes if control is not used on a data form
        if (
            this.field['isDirty'] &&
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field['isTableCell'] &&
            !this.field.isRuleValue
        ) {
            let filterType = this.field.CodeColumnFilterType
                ? this.field.CodeColumnFilterType
                : this.field.CodeFilterType;
            if (!filterType) {
                filterType = this.field.CodeFieldType;
            }
            let data = {
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType: filterType,
                value: option,
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        } else {
            this.formService.setRuleValue(this.field, this.currentView, this.checkboxObj);
        }
    }

    getTrackBy(index: number, fieldoption: any) {
        return fieldoption._id;
    }

    private setSelectedOptions(field) {
        if (field?.options?.length > 0) {
            field.options.forEach((element) => {
                element['isChecked'] = false;
                field.CodeValue?.forEach((value) => {
                    if (element._id === value._id) {
                        element['isChecked'] = true;
                    }
                });
            });
        }
    }
}
