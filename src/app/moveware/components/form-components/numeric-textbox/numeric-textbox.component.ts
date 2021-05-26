import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NumericTextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { StandardCodes } from '../../../constants/StandardCodes';
import { Broadcaster } from '../../../services/broadcaster';
import { CacheService } from '../../../services/cache.service';
import { ContextService } from '../../../services/context.service';
import { GridService } from '../../../services/grid-service';
import Utils from '../../../services/utils';
import { FieldConfig } from '../field.interface';
import { currencyCodesMap } from './currencyData';

@Component({
    selector: 'app-numaric-textbox',
    templateUrl: './numeric-textbox.component.html',
    styleUrls: ['./numeric-textbox.component.scss']
})
export class NumericTextboxComponent implements OnInit, AfterViewInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @ViewChild(NumericTextBoxComponent) private numericTextBox: NumericTextBoxComponent;
    isTableHeader: boolean;
    languageCode: any;

    constructor(
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private cacheService: CacheService,
        private formService: DataFormService,
        private gridService: GridService
    ) {}
    ngAfterViewInit(): void {
        if (this.numericTextBox && this.field.isCurrency) {
            this.numericTextBox.format = 'c2';
            this.numericTextBox.locale = this.languageCode;
            this.numericTextBox.currency = currencyCodesMap[this.languageCode];
        } else if (
            this.numericTextBox &&
            (this.field.CodeDataType === StandardCodes.DECIMAL ||
                this.field.CodeDataType === StandardCodes.DOUBLE)
        ) {
            this.numericTextBox.format = this.field.CodeFormat ? this.field.CodeFormat : 'N2';
        }
    }
    /**
     * <p> Numeric TextBox initialization and instance is created with required details for loading</p>.
     *
     */
    ngOnInit(): void {
        //this.setAndRegisterLanguageChangeEvent();
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView.CodeType !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell;
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView._id + this.field._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView._id + this.field._id
            : '';
    }
    /**
     * set the locale language and register for language changeF
     */
    private setAndRegisterLanguageChangeEvent() {
        this.languageCode = this.cacheService.getSessionData('Region');
        this.broadcaster.on('languageChangeAfterCLDRdataLoaded').subscribe((lang: string) => {
            this.languageCode = lang;
            if (this.numericTextBox) {
                this.numericTextBox.locale = lang;
                this.numericTextBox.currency = currencyCodesMap[lang];
            }
        });
    }

    /**
     * <p> To set Field's CodeValue to fieldvalue  </p>
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        this.field = field;
    }
    /**
     * <p> Tt will update the value in field whenever value changes in UI</p>
     *
     * @param $event : Mouse Click Event
     */
    onChange(event) {
        if (event.isInteracted) {
            this.contextService.saveDataChangeState();
            this.field.isDirty = true;
            this.field.CodeValue = event.value;

            this.formService.setRuleValue(this.field, this.currentView, this.numericTextBox);
        }
    }
    private validate() {
        if (
            this.currentView['CodeType'] == StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isRuleValue
        ) {
            let event = { [this.field.CodeCode]: this.field.CodeValue || null };
            this.formService.validateField(event, this.currentPage, this.currentView);
        }
    }
    /**
     * <p>Called on focusOut of cursor on field.</p>
     * @param $event mouse event
     */
    onFocusOut($event) {
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

    onFocus(data) {
        this.formService.currentFocusedElement = this.numericTextBox;
    }
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
            this.contextService.removeDataChangeState();
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
     * <p>Handles Keyboard events.</p>
     * @param event KeyBoard Event
     */
    handleKeyEvent(event) {
        if (this.field.isRuleValue) {
            let event = {};
            event['value'] = this.field.CodeValue;
            event['sourceElement'] = this.field._id;
            this.broadcaster.broadcast(this.currentView._id + 'ruleValue', event);
        }
    }
}
