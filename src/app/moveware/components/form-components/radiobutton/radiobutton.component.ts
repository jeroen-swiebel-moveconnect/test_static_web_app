import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig, Validator } from '../field.interface';
import { EventsListenerService } from 'src/app/moveware/services';
import Utils from 'src/app/moveware/services/utils';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { RadioButtonComponent } from '@syncfusion/ej2-angular-buttons';
@Component({
    selector: 'app-radiobutton',
    templateUrl: './radiobutton.component.html',
    styleUrls: ['./radiobutton.component.scss']
})
export class RadiobuttonComponent implements OnInit {
    @Input() field: FieldConfig;
    group: FormGroup;
    showNotes: boolean;
    globalEventsNames: any[];
    fieldValue: any;
    fieldValueLabel: any;
    loadDynamicFilter: Function;
    @Input() currentRecord: any;
    @Input() currentView: any;
    @Input() translationContext: any;
    isTableHeader: boolean;
    @ViewChild(RadioButtonComponent) private radioBtn: RadioButtonComponent;
    constructor(
        private eventsListener: EventsListenerService,
        private contextService: ContextService,
        private gridService: GridService,
        private broadcaster: Broadcaster,
        private quickTextHandler: QuickTextHandlerService,
        private formService: DataFormService
    ) {}

    /**
     * <p> RadioButton initialization and instance is created with required details for loading  </p>.
     *
     */
    ngOnInit() {
        this.translationContext = this.translationContext ? this.translationContext + '.' : '';
        if (this.field.CodeValue) {
            this.fieldValue = this.field.CodeValue;
            this.fieldValueLabel = this.field.CodeValue?.label;
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
     * <p> to set Field's CodeValue to fieldvalue </p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        if (this.field.CodeValue) {
            this.fieldValue = this.field.CodeValue;
        }
    }

    /**
     * <p> to set currentRecord Value. </p>
     *
     * @param currentRecord : holds the details of selected Record and assigns value to currentRecord
     */
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    /**
     * <p> Changes value of isDirty key of field if value of field is changed.Field Update Event if currentView is Data Form and broadCasts columnfilter if CurrentView is not Data Form</p>
     *
     * @param $event : Mouse Click Event
     */
    public markDirty($event) {
        if (this.field['isFilter']) {
            let eventData = {};
            eventData['field'] = this.field;
            eventData['filterValue'] = $event;
            this.loadDynamicFilter(eventData);
        }
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.field['isDirty'] = true;
        this.field.CodeValue = $event;

        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler) &&
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isRuleValue
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
                value: $event ? $event : '',
                CodeSubFiled: this.field.CodeSubField || 'CodeDescripton',
                values: this.field.options ? this.field.options : '',
                isHeaderFilter: this.field.isHeader
            };
            this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
        } else if (this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        } else {
            this.formService.setRuleValue(this.field, this.currentView, this.radioBtn);
        }
    }
}
