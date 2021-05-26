import { Component, Input, OnInit } from '@angular/core';
import { ContextService } from 'src/app/moveware/services/context.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import Utils from 'src/app/moveware/services/utils';
import { FieldConfig } from '../field.interface';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss']
})
/**
 * Component is loaded when fieldType of field is Color Picker.
 * */
export class ColorPickerComponent implements OnInit {
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() currentPage: any;
    @Input() field: FieldConfig;
    @Input() translationContext: any;

    isTableHeader: boolean;

    constructor(private contextService: ContextService) {}

    ngOnInit(): void {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
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
     * <p> to set Field's CodeValue to fieldvalue  </p>
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        this.field = field;
    }

    /**
     * <p> when color is selected from color palette. </p>
     *
     * @param event : DOMEvent holding current hex value of selected color.
     */
    onSelect(event) {
        this.field.CodeValue = event?.currentValue?.hex;
        this.contextService.saveDataChangeState();
        this.field['isDirty'] = true;
    }
}
