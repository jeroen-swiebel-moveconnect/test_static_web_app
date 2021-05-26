import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ITypeChangeDataObject, ITypeChangeObject } from 'src/app/moveware/models';
import Utils from 'src/app/moveware/services/utils';

import { ContextService } from 'src/app/moveware/services/context.service';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../field.interface';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

@Component({
    selector: 'app-editable-combobox',
    templateUrl: './editable-combobox.component.html',
    styleUrls: ['./editable-combobox.component.scss']
})
export class EditableComboboxComponent implements OnInit {
    @Input() currentView: any;
    @Input() translationContext: any;
    @Output() optionChange = new EventEmitter();
    field: FieldConfig;
    group: FormGroup;
    globalEventsNames: any[];
    isTableHeader: boolean;
    fieldCodeValueId: string;
    public value: any = {};
    public fields: Object = { text: 'CodeDescription', value: '_id' };
    fieldLabel: string;

    @ViewChild('comboBox') comboBoxObj: ComboBoxComponent;
    constructor(
        private quickTextHandler: QuickTextHandlerService,
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private formService: DataFormService
    ) {}
    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        if (this.field && this.field.CodeValue) {
            this.value = Utils.getCopy(this.field.CodeValue);
            this.fieldCodeValueId = null;
            this.fieldCodeValueId = this.value._id;
        } else {
            this.value = '';
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
    }

    /**
     * <p> Sets two-way binded label value from fields Value </p>
     */
    private setValue() {
        if (this.field && this.field.CodeValue) {
            this.value = this.field.CodeValue;
            this.fieldCodeValueId = this.field.CodeValue?._id;
        }
    }

    /**
     * <p> to set Field's CodeValue to fieldvalue </p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        if (this.field && this.field.CodeValue) {
            this.value = Utils.getCopy(this.field.CodeValue);
            this.fieldCodeValueId = null;
            // setTimeout(()=>{
            this.fieldCodeValueId = this.value._id;
            // },200)
        } else {
            this.value = '';
        }
    }

    /**
     * <p> changes on field and state change on field are recorded and calls FieldUpdate EventUpdation and broadCasts columnFilters for</p>
     *
     */
    private markDirty() {
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.field['isDirty'] = true;
        this.field.CodeValue = this.value;
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler) &&
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            let _targetEvents = Utils.getEventTargetData(
                this.field,
                this.globalEventsNames,
                this.quickTextHandler
            );
            this.broadcaster.broadcast(this.currentView['CodeCode'] + 'apply_settings', {
                eventType: 'field_update',
                eventName: this.field.CodeCode,
                eventData: _targetEvents
            });
        } else if (
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
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType: filtertype,
                value: this.field.CodeValue ? this.field.CodeValue : '',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        } else {
            this.formService.setRuleValue(this.field, this.currentView, this.comboBoxObj);
        }
    }

    /**
     * <p> to set field's CodeValue to null and mark isDirty to true and calls FieldReset EventUpdation and broadCast columnFilters for Grid</p>
     *
     */
    private unSelect() {
        this.field.CodeValue = null;
        this.field['isDirty'] = true;
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler) &&
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            let _targetEvents = Utils.getEventTargetData(
                this.field,
                this.globalEventsNames,
                this.quickTextHandler
            );
            this.broadcaster.broadcast(this.currentView['CodeCode'] + 'apply_settings', {
                eventType: 'field_update',
                eventName: this.field.CodeCode,
                eventData: _targetEvents
            });
        } else if (
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
                source: 'searchColumn',
                CodeElement: this.field.CodeElement,
                CodeDescription: this.field.CodeDescription,
                CodeFilterType: filtertype,
                value: this.field.CodeValue ? this.field.CodeValue : '',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        }
    }

    /**
     * <p> returns true if object is empty. </p>
     *
     * @param obj : input Object
     */
    public isEmptyObject(obj) {
        return Utils.isObjectEmpty(obj);
    }

    /**
     * <p> changes field's value if option is changed.</p>
     *
     * @param selectedOption : option selected from dropdown.
     */
    public optionChanged(selectedOption) {
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.fieldCodeValueId = selectedOption._id;
        this.value = selectedOption;
        let $event = {} as ITypeChangeObject;
        if (!this.value) {
            this.field.CodeValue = null;
            this.value = '';
            $event.value = undefined;
            $event.data = {} as ITypeChangeDataObject;
            this.unSelect();
        } else {
            $event = {
                data: {} as ITypeChangeDataObject,
                value: this.value._id,
                valueCode: this.value.label
            };
            this.markDirty();
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
                    source: 'searchColumn',
                    CodeElement: this.field.CodeElement,
                    CodeDescription: this.field.CodeDescription,
                    CodeFilterType: filtertype,
                    value: this.field.CodeValue ? this.field.CodeValue : '',
                    values: this.field.options ? this.field.options : '',
                    isHeaderFilter: this.field.isHeader
                };
                this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
            }
        }
    }

    /**
     * <p> handle dropdown click event </p>
     *
     * @param event : DOM Event
     */
    public handleClick(event) {
        let dropDownElem = $(event.target).closest('p-dropdown').offset();
        if (dropDownElem) {
            let left = dropDownElem.left;
            setTimeout(() => {
                $('.dropdown-list')
                    .delay(100)
                    .css('left', left + 'px');
                $('.dropdown-list').show();
            }, 100);
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

    ngOnDestroy() {}
}
