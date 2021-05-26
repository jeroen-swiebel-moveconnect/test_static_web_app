import { Component, OnInit, Input } from '@angular/core';
import { FieldConfig } from '../field.interface';
import { rippleEffect } from '@syncfusion/ej2-base';

import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';

import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import Utils from 'src/app/moveware/services/utils';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

@Component({
    selector: 'app-selectbutton',
    templateUrl: './selectbutton.component.html',
    styleUrls: ['./selectbutton.component.scss']
})
export class SelectButtonComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() translationContext: any;
    @Input() currentRecord: any;
    @Input() currentView: any;
    isTableHeader: boolean;
    constructor(
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private formSerivce: DataFormService
    ) {}

    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
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
        this.setSelectedOptions(this.field);
    }

    /**
     * <p> to set Field's CodeValue to fieldvalue and applySettings and Subscribes to Parent Fields </p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        this.field = field;
        this.setSelectedOptions(this.field);
    }

    /**
     * <p> to set CurrentRecord Value. </p>
     *
     * @param currentRecord : holds the details of selected Record and assigns value to currentRecord
     */
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    /**
     * <p> changes on field and state change on field are recorder if view is dataForm or column filters are applied if view id dataGrid </p>
     *
     *  @param selectedOption : selected option from field options
     */
    public markDirty(selectedOption) {
        this.field.CodeValue = selectedOption;
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.setSelectedOptions(this.field);
            this.contextService.saveDataChangeState();
        }
        this.field['isDirty'] = true;
        if (this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        }
        if (
            this.field['isDirty'] &&
            this.currentView &&
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
                value: this.field.CodeValue ? this.field.CodeValue : [],
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        } else {
            // let event = {};
            // event['value'] = this.field.CodeValue;
            // event['sourceElement'] = this.field._id;
            // this.broadcaster.broadcast(this.currentView._id + 'ruleValue', event);
            let elem = document.getElementById(this.field._id);
            this.formSerivce.setRuleValue(this.field, this.currentView, { element: elem });
        }
    }

    /**
     * <p> to set checked property in fieldOptions based on field's CodeValue. </p>
     *
     * @param field : holds the field's details.
     */
    private setSelectedOptions(field) {
        if (field?.options?.length > 0) {
            field.options.forEach((element) => {
                element['isChecked'] = false;
                if (element._id === field.CodeValue?._id) {
                    element['isChecked'] = true;
                }
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
}
