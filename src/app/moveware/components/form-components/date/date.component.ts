import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import Utils from 'src/app/moveware/services/utils';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { format } from 'date-fns';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/moveware/services/user-service';
import {
    DateRangePickerComponent,
    DateTimePickerComponent
} from '@syncfusion/ej2-angular-calendars';
import { CacheService } from '../../../services/cache.service';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { ContextService } from '../../../services/context.service';

declare let require: any;
const FORMAT_SKELTONS = ['long', 'short', 'medium', 'full'];

/**
 * Syncfusion migration notes:
 *
 * <p>Features that we still could not port over to Syncfusion version:
 * <ul>
 *     <li>Showing multiple months in the calendar dropdown
 *     <li>The calendar icon can't be hidden even when control is disabled / readonly
 *     <li>Unlike in Prime-ng, Syncfusion has separate buttons for selecting date and time
 *     <li>There's no time range picker in Syncfusion
 * </ul>
 */
@Component({
    selector: 'app-date',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() translationContext: any;

    @ViewChild(DateTimePickerComponent)
    public datetimepicker: DateTimePickerComponent;
    @ViewChild(DateRangePickerComponent)
    public dateRangePicker: DateRangePickerComponent;
    public startDate: Date;
    public endDate: Date;

    group: FormGroup;
    date: any;
    datetime: any;
    globalEventsNames: any[];
    isRange = false;
    isDateField = true;
    valueSelected: boolean;
    quickTexts: any;
    filteredTexts: any;
    mentionValue: any;
    isTableHeader: boolean;
    dateFormat: any;
    timeFormat: string;
    dateFormatWithProperCase: string;
    isFieldTypeDate = false;
    isFieldTypeDateTime = false;
    isFieldTypeTime = false;
    minDate = new Date(1890, 1, 1);
    maxDate = new Date(2050, 12, 31);
    languageCode: string;
    fieldLabel: string;

    constructor(
        private contextService: ContextService,
        private userService: UserService,
        private quickTextHandler: QuickTextHandlerService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private cacheService: CacheService,
        private translateService: TranslateService,
        private formService: DataFormService
    ) {}

    ngOnInit() {
        if (this.field.CodeFormat) {
            if (FORMAT_SKELTONS.includes(this.field.CodeFormat)) {
                this.dateFormat = { skeleton: this.field.CodeFormat };
            } else {
                this.dateFormat = this.field.CodeFormat;
            }
        }

        this.languageCode = this.cacheService.getSessionData('Region');
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;

        this.datetime = new Date();
        // this.setAndRegisterLanguageChangeEvent();
        this.userService.dateComponentInstance = this;
        this.isRange =
            this.currentView &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell;
        if (this.currentRecord && this.currentRecord._id) {
            this.setDate();
        } else {
            if (this.field && this.field.CodeValue) {
                this.getProcessedQuickText(this.field.CodeValue);
            }
        }

        this.quickTexts = JSON.parse(this.cacheService.getSessionData(StandardCodes.QUICK_TEXT));
        if (this.field['isFilter']) {
            this.isFieldTypeDate = Utils.equalIgnoreCase(this.field.CodeFilterType, 'Date');
            this.isFieldTypeDateTime = Utils.equalIgnoreCase(
                this.field.CodeFilterType,
                'Date Time'
            );
            this.isFieldTypeTime = Utils.equalIgnoreCase(this.field.CodeFilterType, 'Time');
        } else {
            this.isFieldTypeDate = Utils.equalIgnoreCase(this.field.CodeFieldType, 'Date');
            this.isFieldTypeDateTime = Utils.equalIgnoreCase(this.field.CodeFieldType, 'Date Time');
            this.isFieldTypeTime = Utils.equalIgnoreCase(this.field.CodeFieldType, 'Time');
        }
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

        if (this.field.isEditableCell) {
            setTimeout(() => {
                $('#' + this.field._id + ' input').click();
            }, 0);
        }
        this.applySettings('field_update');
    }

    /**
     * set the locale language and register for language change event
     */
    private setAndRegisterLanguageChangeEvent() {
        this.broadcaster.on('languageChangeAfterCLDRdataLoaded').subscribe((lang: string) => {
            this.languageCode = lang;
            this.setDate();
        });
    }

    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
    }
    set setField(field) {
        this.field = field;
        this.setDate();
    }
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }
    equalIgnoreCase(firstArg, secondArg) {
        return Utils.equalIgnoreCase(firstArg, secondArg);
    }
    onInput(event) {
        if (!this.field.isEditableCell) {
            const value = (<HTMLInputElement>event.target).value;

            if (value.startsWith('@@')) {
                this.isDateField = false;
                this.field.CodeValue = '@@';
            } else {
                this.isDateField = true;
            }
        }
    }

    onChange(event) {
        //  const originalTime = new Date(this.field['originalValue']).getTime();
        //   const selectedTime = new Date(event.value).getTime();

        if (event.isInteracted) {
            if (this.isRange) {
                this.handleChangeInDateRange(event);
            } else {
                this.handleChangeInDate(event);
            }
        }
    }

    onValueSelect(selected) {
        this.field.CodeValue = this.field.CodeValue.replace(
            '@@' + this.mentionValue,
            '@@' + selected.CodeDescription
        );
        this.valueSelected = false;
    }

    onFocusOut(event) {
        const value: any = event.model.value;

        if (value) {
            if (this.getFormattedDate(this.field.CodeValue) !== value) {
                this.field.CodeValue = value;

                if (this.field['isTableCell'] && this.field.isEditableCell) {
                    if (this.field.CodeValue !== this.field['originalValue']) {
                        this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
                    }
                }
                if (this.currentRecord && this.currentRecord[this.field.CodeCode]) {
                    this.currentRecord[this.field.CodeCode] = this.field.CodeValue;
                }
            }
        }
    }

    /**
     * TODO: documentation for this method needs to be completed by someone who knows what it does
     *
     * @param event The keyup event
     */
    getQuickTexts(event) {
        const value = (<HTMLInputElement>event.target).value;

        if (value.includes('@@')) {
            this.mentionValue = value.substring(
                value.indexOf('@@') + 2,
                (<HTMLInputElement>event.target).selectionEnd
            );

            if (this.mentionValue !== '') {
                this.filteredTexts = Utils.filterQuickText(this.quickTexts, this.mentionValue);
                this.valueSelected = true;
            }
        } else {
            this.valueSelected = false;
        }
    }

    /**
     * Formats a given date based on the data type of the field.
     *
     * @param value The date value to format
     * @return The formatted date
     */
    getFormattedDate(value): string {
        let formattedValue: string;
        switch (this.field.CodeDataType) {
            case 'Date Time':
                formattedValue = format(new Date(value), 'DD/MM/YYYY HH:mm');
                break;
            case 'Date':
                formattedValue = format(new Date(value), 'DD/MM/YYYY');
                break;
        }

        return formattedValue;
    }

    /**
     * Resets the content of the field and marks it as dirty.
     *
     * The method is invoked when the clear button on the date input is clicked.
     */
    clearAll() {
        this.date = null;

        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }

        this.field['isDirty'] = true;
        this.field.CodeValue = null;

        if (
            this.currentView &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell &&
            !this.field.isRuleValue
        ) {
            let filterType = this.field.CodeColumnFilterType
                ? this.field.CodeColumnFilterType
                : this.field.CodeFilterType;

            if (!filterType) {
                filterType = this.field.CodeFieldType;
            }

            const data = {
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeDataType: this.field.CodeDataType,
                CodeFilterType: filterType,
                value: '',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        }

        if (this.field.isEditableCell) {
            if (this.field['isTableCell'] && this.field.isEditableCell) {
                if (this.field.CodeValue !== this.field['originalValue']) {
                    this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
                }
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue;
            }
        }
    }

    private setDate() {
        if (this.field && this.field.CodeValue && typeof this.field.CodeValue != 'object') {
            this.date = new Date(this.field.CodeValue);

            if (this.date.toString() === 'Invalid Date' && this.field.CodeValue.includes('@')) {
                this.date = '';
            } else if (this.date.toString() === 'Invalid Date') {
                this.isDateField = false;
            }
        } else if (Array.isArray(this.field.CodeValue)) {
            this.startDate = new Date(this.field.CodeValue[0]);

            if (this.field.CodeValue.length == 2) {
                this.endDate = new Date(this.field.CodeValue[1]);
            }
        } else {
            this.date = '';
        }
        if (this.date) {
            this.date = new Date(
                this.date.toLocaleString('en-US', {
                    timeZone: JSON.parse(this.cacheService.getSessionData('TimeZone'))['CodeValue']
                })
            );
        }
    }

    private getProcessedQuickText(codeValue) {
        if (typeof codeValue === 'string' && codeValue.startsWith('@@')) {
            const quickText = codeValue.match(/\B@@[a-z0-9_-]+/gi);
            this.date = this.quickTextHandler.implementQuickText(quickText[0]);

            if (this.date) {
                this.field.CodeValue = this.date.toISOString();
            }
        }
    }

    private handleChangeInDate(event) {
        this.field.CodeValue = event.value;

        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }

        this.field['isDirty'] = true;

        if (this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue;
            }
        } else {
            let elem = document.getElementById(this.field._id);
            this.formService.setRuleValue(this.field, this.currentView, { element: elem });
        }
    }
    /**
     * <p> To apply settings on Field </p>
     *
     * @param type : EventType
  
     */
    private applySettings(type) {
        let _targetEvents = Utils.getEventTargetData(
            this.field,
            this.globalEventsNames,
            this.quickTextHandler
        );
        if (this.globalEventsNames && _targetEvents && _targetEvents.length) {
            this.broadcaster.broadcast(this.currentView['CodeCode'] + 'apply_settings', {
                eventType: type,
                eventName: this.field.CodeCode,
                eventData: _targetEvents
            });
        }
    }

    private handleChangeInDateRange(event) {
        if (
            this.currentView &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell &&
            !this.field.isRuleValue
        ) {
            let filterType = this.field.CodeColumnFilterType
                ? this.field.CodeColumnFilterType
                : this.field.CodeFilterType;

            if (!filterType) {
                filterType = this.field.CodeFieldType;
            }

            const data = {
                elementRef: this.dateRangePicker,
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDataType: this.field.CodeDataType,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType: filterType,
                value: event.startDate ? [event.startDate, event.endDate] : [],
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
            if (this.field.isRuleValue) {
                let event = {};
                event['value'] = this.field.CodeValue;
                event['sourceElement'] = this.field._id;
                this.broadcaster.broadcast(this.currentView._id + 'ruleValue', event);
            }
        }
    }
}
