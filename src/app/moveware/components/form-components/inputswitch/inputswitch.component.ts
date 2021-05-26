import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FieldConfig } from '../field.interface';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import Utils from 'src/app/moveware/services/utils';
import { SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

/**
 * Syncfusion migration notes:
 *
 * <ul>
 *     <li>The switch component doesn't have a 'required' attribute
 *     <li>Tooltip is not working
 * </ul>
 */
@Component({
    selector: 'app-inputswitch',
    templateUrl: './inputswitch.component.html',
    styleUrls: ['./inputswitch.component.scss']
})
export class InputSwitchComponent implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() translationContext: any;
    @Output() valueChanged = new EventEmitter<any>();
    value: boolean;
    isTableHeader: boolean;
    @ViewChild('switch') switchInstance: SwitchComponent;
    constructor(
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private formService: DataFormService
    ) {}
    created(event) {
        this.switchInstance.element.tabIndex = this.field.tabIndex;
    }
    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
        this.value = this.field.CodeValue === true;
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

    set setField(field) {
        this.field = field;
        this.value = this.field.CodeValue === true;
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    public onChange(event) {
        // if (event.isInteracted) {
        this.field.CodeValue = this.value;

        // If this is within a Data Form, make sure to notify ContextService of the dirty state (of the field)
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
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        } else if (
            this.field['isDirty'] &&
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
                CodeFilterType: filterType,
                value: this.field.CodeValue !== null ? this.field.CodeValue : '',
                CodeSubField: this.field.CodeSubField || 'CodeDescription',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };

            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        } else {
            this.formService.setRuleValue(this.field, this.currentView, this.switchInstance);
        }
        // }
    }
}
