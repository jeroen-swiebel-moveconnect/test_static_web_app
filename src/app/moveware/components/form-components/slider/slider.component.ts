import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FieldConfig } from '../field.interface';
import { ContextService } from 'src/app/moveware/services/context.service';
import Utils from 'src/app/moveware/services/utils';
import { GridService } from 'src/app/moveware/services/grid-service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { DataFormService } from 'src/app/moveware/services/dataform-service';

@Component({
    selector: 'slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
    @Input() field: FieldConfig;
    fieldValue: string;
    fieldValueInt: number;
    fieldMin: number = 0;
    fieldMax: number = 100;
    fieldStep: number = 1;
    @Input() currentRecord: any;
    @Input() currentView: any;
    isTableHeader: boolean;

    constructor(
        private contextService: ContextService,
        private gridService: GridService,
        private formService: DataFormService
    ) {}
    ngOnInit() {
        this.setFieldValue();
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
        this.setFieldValue();
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    private setFieldValue() {
        if (this.field.CodeValue) {
            this.fieldValue = this.field.CodeValue;
            if (this.field.CodeDataType === 'Time') {
                this.fieldValueInt = Utils.timeStringToMin(this.fieldValue);
                this.fieldMax = 1440;
                this.fieldStep = 15;
            } else this.fieldValueInt = parseInt(this.fieldValue);
        } else {
            if (this.field.CodeDataType === 'Time') {
                this.fieldValue = '00:00';
                this.fieldValueInt = 0;
                this.fieldMax = 1440;
                this.fieldStep = 15;
            } else {
                this.fieldValue = '0';
                this.fieldValueInt = parseInt(this.fieldValue);
            }
        }
    }
    changeValue($event) {
        this.markDirty();
        this.fieldValue = $event.value;
        if (this.fieldValue === 'NaN') {
            this.fieldValue = '0';
            this.fieldValueInt = parseInt(this.fieldValue);
        }
        this.fieldValueInt = parseInt(this.fieldValue);
        if (this.field.CodeDataType === 'Time') {
            this.fieldValue = Utils.minToTimeString(this.fieldValueInt);
        }
    }

    public markDirty() {
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
        this.field.CodeValue = this.fieldValue;
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
}
