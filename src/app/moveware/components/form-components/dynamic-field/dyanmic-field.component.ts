import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import { CollectionsService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { CacheService } from 'src/app/moveware/services/cache.service';
import { ContextService } from 'src/app/moveware/services/context.service';
import { GridService } from 'src/app/moveware/services/grid-service';
import { QuickTextHandlerService } from 'src/app/moveware/services/quick-text-handler.service';
import Utils from 'src/app/moveware/services/utils';
import { FieldConfig } from '../field.interface';

@Component({
    selector: 'dynamic-field',
    templateUrl: './dyanmic-field.component.html',
    styleUrls: ['./dyanmic-field.component.scss']
})
export class DynamicFieldTypeComponent implements OnInit {
    field: FieldConfig;
    group: FormGroup;
    // dynamicFieldMetaData: any;
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @Input() currentView: any;
    @Input() translationContext: any;
    value: any;
    isTableHeader: boolean;
    constructor(
        private collectionsService: CollectionsService,
        private contextService: ContextService,
        private broadcaster: Broadcaster,
        private quickTextService: QuickTextHandlerService,
        private gridService: GridService,
        private cacheService: CacheService
    ) {}
    ngOnInit() {
        this.subscrcibeToParentFileds();
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
    private isLookupEnabled(field) {
        field.allActions = Utils.getArrayOfProperties(field.CodeActions, 'CodeUIAction');
        let actions = '';
        actions = field.allActions.toString();
        return actions.indexOf('Lookup') >= 0 ? true : false;
    }

    markDirty() {
        this.contextService.saveDataChangeState();
        this.field.isDirty = true;
        if (this.field['isTableCell']) {
            if (this.field.CodeValue !== this.field['originalValue']) {
                this.gridService.setGridEditData(this.field.CodeCode, this.field.CodeValue);
            }
            if (this.currentRecord) {
                this.currentRecord[this.field.CodeCode] = this.field.CodeValue['label'];
            }
        }
    }
    loading: boolean;
    private eventsList: Array<any> = [];
    private parentFieldsData: any;
    private subscrcibeToParentFileds() {
        let parentFileds = this.field.parameterNames;
        if (parentFileds) {
            for (let i = 0; i < parentFileds.length; i++) {
                let event = this.broadcaster
                    .on<string>(
                        this.currentPage.containerID + parentFileds[i] + 'parentFiledChanged'
                    )
                    .subscribe((data) => {
                        this.loading = true;
                        if (data['_id']) {
                            this.parentFieldsData = {};
                            for (const parameterName of parentFileds) {
                                if (
                                    parameterName !== 'CodeFieldType' &&
                                    parameterName !== 'JSONParameter'
                                ) {
                                    if (parameterName.includes('@@')) {
                                        this.parentFieldsData = this.quickTextService.computeParamterName(
                                            parameterName,
                                            this.parentFieldsData
                                        );
                                    } else {
                                        this.parentFieldsData[parameterName] = data['_id'];
                                    }
                                } else if (parameterName === 'CodeFieldType') {
                                    this.field.DynamicField = null;
                                    let newField = {};
                                    newField['CodeDescription'] = this.field.CodeDescription;
                                    newField['CodeVisible'] = true;
                                    newField['CodeCode'] = this.field.CodeCode;
                                    newField['CodeFieldType'] = data['label'];
                                    newField['CodeValue'] = this.field.CodeValue;
                                    newField['CodeDisplay'] = this.field.CodeDisplay;
                                    newField['CodeEnabled'] = 'Yes';
                                    setTimeout(() => {
                                        this.field.DynamicField = newField;
                                    });
                                }
                            }
                            if (!Utils.isObjectEmpty(this.parentFieldsData)) {
                                this.loadDynamicField(
                                    this.field.CodeElement,
                                    this.parentFieldsData,
                                    data['_id']
                                );
                            }
                        } else if (data['JSONParameter']) {
                            this.parentFieldsData = {};
                            for (const parameterName of parentFileds) {
                                if (parameterName !== 'CodeFieldType') {
                                    if (
                                        parameterName === 'JSONParameter' &&
                                        data['JSONParameter']
                                    ) {
                                        this.parentFieldsData[parameterName] =
                                            data['JSONParameter'];
                                    }
                                }
                            }
                            if (
                                !Utils.isObjectEmpty(this.parentFieldsData) &&
                                this.parentFieldsData['JSONParameter']
                            ) {
                                this.loadOptionsByJson(this.parentFieldsData);
                                this.parentFieldsData = {};
                            }
                        } else {
                            this.field.DynamicField = null;
                        }
                        this.loading = false;
                    });
                this.eventsList.push(event);
            }
        }
    }

    private loadOptionsByJson(jsonValue) {
        this.collectionsService.getOptionsByJson(jsonValue).subscribe(async (_response) => {
            let response = JSON.parse(_response.body);
            let newField = {};
            newField['CodeCode'] = this.field.CodeCode;
            newField['CodeDescription'] = this.field.CodeDescription;
            newField['CodeVisible'] = true;
            newField['CodeValue'] = this.field.CodeValue;
            newField['CodeDisplay'] = this.field.CodeDisplay;
            newField['CodeFieldType'] = this.field.DynamicField?.CodeFieldType;
            this.field.DynamicField = null;
            if (!Utils.isArrayEmpty(response.options)) {
                let fieldoptions = Utils.parseOptions(response.options, '', '');
                newField['options'] = fieldoptions.options;
            }
            setTimeout(() => {
                this.field.DynamicField = newField;
            });
        });
    }

    private loadDynamicField(CodeElement: string, namedParameters: any, codeId: any) {
        this.field.DynamicField = null;
        const data = this.collectionsService.getOptions(CodeElement, namedParameters, codeId);
        data.subscribe(async (_response) => {
            this.field.DynamicField = null;
            let newField = JSON.parse(_response.body);
            if (!Utils.isArrayEmpty(newField.options)) {
                let fieldoptions = Utils.parseOptions(newField.options, '', '');
                newField.options = fieldoptions.options;
            }
            newField.CodeDescription = this.field.CodeDescription;
            newField.CodeVisible = true;
            newField.CodeValue = this.field.CodeValue;
            newField.CodeCode = this.field.CodeCode;
            newField['CodeEnabled'] = 'Yes';

            if (
                newField.CodeType === 'UI Component' &&
                (newField.CodeCode === 'Background Image' || newField.CodeCode === 'Image')
            ) {
                newField.CodeFieldType = 'File Upload';
            }
            setTimeout(() => {
                this.field.DynamicField = newField;
            });
            if (!Utils.isArrayEmpty(newField.CodeActions)) {
                this.field.CodeLookupEnabled = this.isLookupEnabled(newField);
                this.field.isOnlyLookup = Utils.getLookupType(
                    newField.CodeActions,
                    StandardCodes.UI_LOOKUP_CLICK
                );
                newField.CodeLookupEnabled = this.field.CodeLookupEnabled;
            }
            this.loading = false;
        });
    }

    set setField(field) {
        this.field = field;
        if (this.field.CodeParentField) {
            let parentFieldCode = this.field.CodeParentField[0].CodeCode;
            let value;

            let view = JSON.parse(
                this.cacheService.getSessionData('formMetaData' + this.currentPage.CodeElement)
            );
            Object.keys(view.UIElements).forEach((element) => {
                element = view.UIElements[element];
                if (element['CodeCode'] === parentFieldCode) {
                    value = element['CodeValue'];
                }
            });
            if (value && value['CodeCode'] === 'CodeValue') {
                this.parentFieldsData = { SettingField: this.currentRecord['Codes']._id };
                this.loadDynamicField(
                    this.field.CodeElement,
                    this.parentFieldsData,
                    this.currentRecord['Codes']._id
                );
            } else {
                if (value) {
                    this.parentFieldsData = { SettingField: value._id };
                    this.loadDynamicField(this.field.CodeElement, this.parentFieldsData, value._id);
                }
            }
        }
    }

    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    private unSubscribeEventsList(eventsList) {
        if (eventsList && eventsList.length) {
            eventsList.forEach((sub) => {
                sub.unsubscribe();
            });
        }
    }

    ngOnDestroy() {
        this.unSubscribeEventsList(this.eventsList);
    }
}
