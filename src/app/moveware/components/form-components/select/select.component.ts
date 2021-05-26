import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DropDownListComponent, SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Helpers } from 'src/app/moveware/utils/helpers';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { ITypeChangeDataObject, ITypeChangeObject } from 'src/app/moveware/models';
import { RequestHandler } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { DataFormService } from 'src/app/moveware/services/dataform-service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import { RuleEngineService } from 'src/app/moveware/services/rule-engine.service';
import { UIActionService } from 'src/app/moveware/services/ui-action.service';
import Utils from 'src/app/moveware/services/utils';
import { FieldConfig } from '../field.interface';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
    isTableHeader: boolean;
    private fieldCodeValueId: string;
    editMode = StandardCodes.VIEW_UPDATE_MODE;

    @ViewChild('selectelement') dropdownlistObj: DropDownListComponent;
    constructor(
        private cache: CacheService,
        private mappings: PageMappingService,
        private ruleEngine: RuleEngineService,
        private broadcaster: Broadcaster,
        private contextService: ContextService,
        private quickTextHandler: QuickTextHandlerService,

        private quickTextService: QuickTextHandlerService,
        private gridService: GridService,
        private actionService: UIActionService,
        private requestHandler: RequestHandler,
        private formService: DataFormService
    ) {}

    @Input() currentView: any;
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @Input() viewMode: any;
    @Input() translationContext: any;
    @Input() parentPageCode: string;
    @Output()
    optionChange = new EventEmitter();

    @ViewChild('selectelement')
    public selectList: DropDownListComponent;

    public fields: Object = { text: 'label', value: '_id' };
    public value: any = {};

    private eventsList: Array<any> = [];
    private parentFieldsData = {};
    private loadAction: any;
    private fieldUpdateEvent: any;
    private changeAction: Object;
    label: any;

    fieldLabel: string;
    loadDynamicFilter: Function;
    field: FieldConfig;
    group: FormGroup;
    globalEventsNames: any[];
    popupWidth: string;
    /**
     * <p> Select component initialization and instance is created with required details for loading </p>
     *
     */
    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        // this.fieldOptions = Utils.getCopy(this.field.options);
        // if (!Utils.isArrayEmpty(this.field.options)) {
        //     this.Options = Utils.getCopy(this.field.options);
        // }

        if ((!this.field.options || this.field.options.length <= 0) && this.field.parameterNames) {
            this.loadOptionsUsingNamedParameters();
        } else {
            this.setValue();
        }
        if (this.viewMode == StandardCodes.CREATE_MODE || this.field.CodeValue) {
            setTimeout(() => {
                this.onParentFiledChange();
            }, 100);
        }
        // if (this.currentView['CodeType'] == StandardCodes.CODE_TYPE_DATA_FORM) {
        //     this.regiterFieldUpdate();
        // }
        this.setChangeAction();
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field['isTableCell'];
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass = 'header' + this.currentView['_id'] + this.field._id;
        this.popupWidth = this.isTableHeader ? '200px' : '100%';
    }

    /**
     * <p> Sets two-way binded label value from fields Value </p>
     *
     */
    private setValue() {
        if (this.field && this.field.CodeValue) {
            this.value = this.field.CodeValue;
            this.fieldCodeValueId = this.field.CodeValue?._id;
        }
        if (this.value) {
            this.label = this.value.label;
        }
    }

    /**
     * <p> loading Options based on parameterNames if existed on field </p>
     *
     */
    private loadOptionsUsingNamedParameters() {
        var parentFieldsData = {};
        for (const parameterName of this.field.parameterNames) {
            if (parameterName.includes('@@')) {
                parentFieldsData = this.quickTextService.computeParamterName(
                    parameterName,
                    parentFieldsData
                );
            }
        }
        if (!Utils.isObjectEmpty(parentFieldsData)) {
            const data = this.requestHandler.loadFieldOptions(
                this.field.CodeElement,
                parentFieldsData,
                '',
                this.currentPage ? this.currentPage.CodeElement : '',
                this.loadAction
            );
            data.subscribe(async (_response) => {
                let _responseBody = JSON.parse(_response.body);
                if (!Utils.isArrayEmpty(_responseBody.options)) {
                    let fieldoptions = Utils.parseOptions(
                        _responseBody.options,
                        this.field.CodeValue,
                        ''
                    );
                    this.field.options = fieldoptions.options;
                    // if (!Utils.isArrayEmpty(this.field.options)) {
                    //     this.Options = Utils.getCopy(this.field.options);
                    // }
                    this.field.CodeValue = fieldoptions.value;
                    this.setValue();
                }
            });
        } else if (Utils.isObjectEmpty(parentFieldsData)) {
            this.subscrcibeToParentFileds();
        }
    }
    onFocus(data) {
        this.formService.currentFocusedElement = this.selectList;
    }

    /**
     * <p> To set the change action</p>
     */
    private setChangeAction() {
        this.changeAction = Utils.getElementByProperty(
            this.field.CodeActions,
            'CodeUIAction',
            'Value Changed'
        );
    }
    /**
     * <p> loads ContextMenus when right-click on field </p>
     *
     * @param event : DOM Event
     * @param input : selectElement
     */
    onRightClick(event, input) {
        this.broadcaster.broadcast('right-click-on-field' + this.currentView._id, {
            field: this.field,
            event: event,
            inputElement: input
        });
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
     * <p> to set Field's CodeValue to fieldvalue and applySettings and Subscribes to Parent Fields </p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        let _value = Utils.getCopy(this.value);
        this.field = field;

        if (typeof this.field.CodeValue == 'string' && !Utils.isArrayEmpty(this.field.options)) {
            let value = Utils.getElementByProperty(this.field.options, '_id', this.field.CodeValue);
            this.value = value;
            this.field.CodeValue = value;
        }
        this.value = this.field.CodeValue;
        this.fieldCodeValueId = this.field.CodeValue?._id;

        if (this.value) {
            this.label = this.value.label;
        }
        if (!this.field?.isRuleValue) {
            this.applySettings('field_update', true);
        }
        // this.regiterFieldUpdate();
        this.unSubscribeEventsList(this.eventsList);
        if (!Utils.isObjectsEqual(_value, this.field.CodeValue)) {
            this.subscrcibeToParentFileds();
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
    onOptionsOpen(event) {
        Helpers.changeToEditMode(this.field._id);
    }
    changeToAddField(event) {
        Helpers.changeToAddMode(this.field._id);
    }
    /**
     * <p> changes on field are recorded and state change on field and applies settings on fieldUpdate </p>
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
        if (!this.field?.isRuleValue) {
            this.applySettings('field_update', true);
        }
    }

    /**
     * <p> to set field's CodeValue to null and changes field state and applies settings of fieldReset </p>
     *
     */
    private unSelect() {
        this.field.CodeValue = null;
        this.field['isDirty'] = true;
        if (!this.field?.isRuleValue) {
            this.applySettings('field_update', true);
        }
    }

    /**
     * <p> to check whether object is empty.Returns true if object is Empty.
     *
     * @param obj : input of JSON Structure
     */
    public isEmptyObject(obj) {
        return !(obj && Object.getOwnPropertyNames(obj).length);
    }

    /**
     * <p> to handle keyboard events </p>
     *
     * @param event : Keyboard Event
     */
    public handleKeyboardEvent(event) {
        if (event.which === 13) {
            $(event.target)
                .parent()
                .closest('gridster-item')
                .find('.ui-dropdown-trigger')
                .trigger('click');
            event.preventDefault();
        }
    }

    /**
     * <p> to assign field's CodeValue from selectedOption in dropdown </p>
     *
     * @param selectedOption : optionChange Event in dropdown
     */
    public async optionChanged(args: SelectEventArgs) {
        if (this.field['isFilter']) {
            let event = {};
            event['field'] = this.field;
            event['filterValue'] = {};
            event['filterValue']['value'] = args.itemData;
            this.loadDynamicFilter(event);
        }
        let previousType = this.field.CodeValue;
        if (this.isEmptyObject(this.field['originalValue'])) {
            this.field['originalValue'] = this.field.CodeValue;
        }
        if (
            !this.currentView ||
            this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
        ) {
            this.contextService.saveDataChangeState();
        }
        this.field.CodeValue = args.itemData;
        this.value = args.itemData;
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
        }
        let viewSelectors;
        if (this.currentView['CodeType'] !== StandardCodes.DATA_GRID && this.currentPage) {
            viewSelectors = this.mappings.getViewSelectors(this.currentPage.containerID);
        }
        if (viewSelectors) {
            if (viewSelectors.indexOf(this.field.CodeCode) >= 0) {
                $event.data = {
                    source: 'selectChange',
                    code: this.field.CodeCode,
                    _id: this.field._id
                };
                let type = this.value.label;
                let view = await this.getViewsByType({ [this.field.CodeCode]: type });
                let viewsByType = Utils.processAliases(view);
                let previousViews;
                if (this.currentRecord && this.currentRecord._id) {
                    previousViews = await this.getViewsByType(this.currentRecord);
                }

                if (!Utils.isObjectsEqual(previousViews, viewsByType)) {
                    $event['views'] = viewsByType;
                    $event['mode'] = StandardCodes.CREATE_MODE;
                    $event['data']['parentRecord'] = this.currentRecord['parentRecord'];
                    $event['_id'] = this.currentRecord._id;
                    $event['noDefaultValue'] = [this.field.CodeCode];
                    if (!this.parentPageCode) {
                        this.parentPageCode = this.currentPage.containerID;
                    }
                    this.broadcaster.broadcast(this.parentPageCode + 'typeChanged', $event);
                }
            } else {
                this.subscrcibeToParentFileds();
            }
        }
        if (
            this.field['isDirty'] &&
            !Utils.isObjectEmpty(this.currentView) &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
            !this.field.isTableCell &&
            !this.field.isRuleValue
        ) {
            this.handlFilterChange();
        }

        if (this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        } else {
            this.formService.setRuleValue(this.field, this.currentView, this.dropdownlistObj);
        }
    }

    /**
     * <p> to apply settings on Field </p>
     *
     * @param type : EventType
     * @param isOnLoad : value is true if applies settings while loading
     */
    private applySettings(type, isOnLoad?: boolean) {
        if (
            this.globalEventsNames &&
            Utils.isEventSource(this.field, this.globalEventsNames, this.quickTextHandler)
        ) {
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
            } else if (isOnLoad && !Utils.isArrayEmpty(this.field['CodeSettings'])) {
                let _targetEvents = [];
                _targetEvents.push(this.field.CodeCode);
                this.broadcaster.broadcast(this.currentView['CodeCode'] + 'apply_settings', {
                    eventType: type,
                    eventName: this.field.CodeCode,
                    eventData: _targetEvents
                });
            }
        }
    }

    /**
     * <p> returns views based on CurrentRecord Type </p>
     *
     * @param record : selected Record
     */
    async getViewsByType(record) {
        let viewsByType = [];
        if (!this.field?.isRuleValue) {
            let views = this.contextService.getDesignerViews(this.currentPage.containerID);
            // let pages = JSON.parse(views);
            viewsByType = await this.ruleEngine.processSettings(record, views, 'Form');
        }
        return viewsByType;
    }

    /**
     * <p> to broadcast when parent Field is Changed </p>
     *
     */
    private onParentFiledChange() {
        this.broadcaster.broadcast(
            this.currentPage.containerID + this.field.CodeCode + 'parentFiledChanged',
            this.value
        );
    }

    /**
     * <p> to load Field Options based on Parent Fields </p>
     *
     */
    private subscrcibeToParentFileds() {
        if (!this.isTableHeader && !this.field.isRuleValue) {
            const parentFileds = this.field.parameterNames;
            if (parentFileds) {
                for (let i = 0; i < parentFileds.length; i++) {
                    const event = this.broadcaster
                        .on<string>(
                            this.currentPage.containerID + parentFileds[i] + 'parentFiledChanged'
                        )
                        .subscribe(async (selectedParentValue) => {
                            this.parentFieldsData = {};
                            for (const parameterName of parentFileds) {
                                if (parameterName.includes('@')) {
                                    this.parentFieldsData = this.quickTextHandler.computeParamterName(
                                        parameterName,
                                        this.parentFieldsData
                                    );
                                } else {
                                    if (selectedParentValue) {
                                        this.parentFieldsData[parameterName] =
                                            selectedParentValue['_id'];
                                    }
                                }
                            }
                            this.loadAction = this.actionService.loadAction(this.field.CodeActions);
                            this.loadFieldOptions(
                                this.field.CodeElement,
                                this.parentFieldsData,
                                this.loadAction
                            );
                        });
                    this.eventsList.push(event);
                }
            }
            if (!Utils.isObjectEmpty(this.value)) {
                setTimeout(() => {
                    this.onParentFiledChange();
                }, 100);
            }
        }
    }

    /**
     * to load field options
     *
     * @param fieldCode : fieldCode to load Options
     * @param namedParameters : field containing namedParameters to replace based on value
     * @param action : dynamicAction to fetch targetApi from JSONParameter
     */
    private loadFieldOptions(fieldCode: string, namedParameters: any, action) {
        if (this.currentPage) {
            const data = this.requestHandler.loadFieldOptions(
                fieldCode,
                namedParameters,
                '',
                this.currentPage.CodeElement,
                action
            );
            let options, resBody;
            data.subscribe(async (option) => {
                resBody = JSON.parse(option.body);
                options = resBody.options;
                if (data && options) {
                    setTimeout(() => {
                        let fieldoptions = Utils.parseOptions(options, this.field.CodeValue, '');
                        this.field.options = fieldoptions.options;
                        // if (!Utils.isArrayEmpty(this.field.options)) {
                        //     this.Options = Utils.getCopy(this.field.options);
                        // }
                        this.fieldCodeValueId = fieldoptions.value?._id;
                        this.value = fieldoptions.value;
                    }, 100);
                } else {
                    this.field.options = null;
                    // if (!Utils.isArrayEmpty(this.field.options)) {
                    //     this.Options = Utils.getCopy(this.field.options);
                    // }
                }
            });
            (err) => {};
        }
    }

    /**
     * <p> to register for field Update Event </p>
     *
     */
    private regiterFieldUpdate() {
        this.fieldUpdateEvent = this.broadcaster
            .on<any>(this.field.CodeCode + 'field_updated')
            .subscribe(async (_field) => {
                this.field[_field.key] = _field.value;
            });
    }

    /**
     * <p> Unsubscribe all the subscribed Events </p>
     *
     * @param eventsList : List of Events need to Unsubscribe
     */
    private unSubscribeEventsList(eventsList) {
        if (eventsList && eventsList.length) {
            eventsList.forEach((sub) => {
                sub.unsubscribe();
            });
        }
    }
    /**
     * <p> on any changes of select field this will be called and intended for clearing CodeValue of field when clear button is clicked </p>
     *
     * @param event : DOM Event
     */
    stateChange(event) {
        if (event.isInteracted && !this.fieldCodeValueId) {
            this.fieldCodeValueId = null;
            this.field.CodeValue = null;
            this.value = '';
            if (
                !this.currentView ||
                this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM
            ) {
                this.contextService.saveDataChangeState();
            }
            this.unSelect();
        }
        if (!this.field.isRuleValue) {
            if (
                event.isInteracted &&
                (!this.currentView ||
                    this.currentView['CodeType'] === StandardCodes.CODE_TYPE_DATA_FORM)
            ) {
                this.validate();
            }
            if (
                this.field['isDirty'] &&
                !Utils.isObjectEmpty(this.currentView) &&
                this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM &&
                !this.field.isTableCell
            ) {
                this.handlFilterChange();
            } else if (this.changeAction) {
                this.executeFieldAction();
            }
        }
    }

    private executeFieldAction() {
        this.broadcaster.broadcast('fieldAction' + this.currentView._id, {
            action: this.changeAction,
            field: { CodeCode: this.field.CodeCode, CodeValue: this.value }
        });
    }
    private handlFilterChange() {
        let filtertype = this.field.CodeColumnFilterType
            ? this.field.CodeColumnFilterType
            : this.field.CodeFilterType;
        if (!filtertype) {
            filtertype = this.field.CodeFieldType;
        }
        let subField = this.field.CodeSubField;
        if (!subField && this.field.CodeValue) {
            if (this.field.CodeValue.CodeCode) {
                subField = 'CodeCode';
            } else {
                subField = 'CodeDescription';
            }
        } else {
            subField = 'CodeDescription';
        }
        let data = {
            elementRef: this.formService.currentFocusedElement,
            source: 'searchColumn',
            CodeElement: this.field.CodeElement,
            CodeDescription: this.field.CodeDescription,
            CodeFilterType: filtertype !== 'boolean' ? filtertype : 'Combo Box',
            CodeSubField: subField,
            value: this.field.CodeValue ? this.field.CodeValue : null,
            values: this.field.options ? this.field.options : '',
            isHeaderFilter: this.field.isHeader
        };
        this.broadcaster.broadcast(this.currentView['_id'] + 'column_filter', data);
    }
    private validate() {
        //if (this.currentView['CodeType'] == StandardCodes.CODE_TYPE_DATA_FORM) {
        let event = { [this.field.CodeCode]: this.field.CodeValue?._id || null };
        this.formService.validateField(event, this.currentPage, this.currentView);
        //  }
    }
    /**
     * <p> cleaning up  when component instance is destroyed </p>
     *
     */
    ngOnDestroy() {
        this.unSubscribeEventsList(this.eventsList);
        if (this.fieldUpdateEvent) {
            this.fieldUpdateEvent.unsubscribe();
        }
    }
}
