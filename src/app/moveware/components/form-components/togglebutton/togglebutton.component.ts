import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FieldConfig } from '../field.interface';
import { EventsListenerService } from 'src/app/moveware/services';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import Utils from 'src/app/moveware/services/utils';
import { ButtonComponent } from '@syncfusion/ej2-angular-buttons';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

@Component({
    selector: 'app-togglebutton',
    templateUrl: './togglebutton.component.html',
    styleUrls: ['./togglebutton.component.scss']
})
/** <p>component is loaded when fieldType is Toggle Button.</p> */
export class ToggleButtonComponent implements OnInit {
    @Input() field: FieldConfig;
    public offLabel: string = 'No';
    public onLabel: string = 'Yes';
    public value: string = 'Yes';
    @Input() currentRecord: any;
    @Input() currentView: any;
    isTableHeader: boolean;
    @Input() translationContext: string;
    @ViewChild('toggleBtn')
    public toggleBtn: ButtonComponent;
    constructor(
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private formService: DataFormService
    ) {}
    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView.CodeType !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell;
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView?._id + this.field?._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView?._id + this.field?._id
            : '';
    }

    /**
     * <p> to set Field's CodeValue value and assign content for togglebuttons</p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        this.field = field;
        this.value = field.CodeValue ? this.onLabel : this.offLabel;
        this.toggleBtn.content = this.value;
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
     * <p> state change on field are recorded if view is dataForm or column filters are applied if view id dataGrid </p>
     *
     */
    public markDirty() {
        if (this.toggleBtn.element?.classList.contains('e-active')) {
            this.toggleBtn.content = this.value === this.onLabel ? this.offLabel : this.onLabel;
            this.toggleBtn.iconCss =
                this.toggleBtn.content === this.onLabel
                    ? 'e-btn-sb-icons fa fa-check'
                    : 'e-btn-sb-icons fa fa-times';
        } else {
            this.toggleBtn.content = this.value === this.offLabel ? this.onLabel : this.offLabel;
            this.toggleBtn.iconCss =
                this.toggleBtn.content === this.onLabel
                    ? 'e-btn-sb-icons fa fa-check'
                    : 'e-btn-sb-icons fa fa-times';
        }
        this.value = this.toggleBtn.content;
        if (!this.currentView || this.currentView?.CodeType === StandardCodes.CODE_TYPE_DATA_FORM) {
            this.field.CodeValue = this.value === 'Yes' ? true : false;
            this.contextService.saveDataChangeState();
        }
        this.field.isDirty = true;
        if (this.field.isTableCell) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue;
            }
        }
        if (
            this.field.isDirty &&
            this.currentView &&
            this.currentView?.CodeType !== StandardCodes.CODE_TYPE_DATA_FORM &&
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
            this.broadcaster.broadcast(this.currentView._id + 'column_filter', data);
        } else {
            let elem = document.getElementById(this.field._id);
            this.formService.setRuleValue(this.field, this.currentView, { element: elem });
        }
    }
}
