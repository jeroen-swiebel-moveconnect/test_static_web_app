import {
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    ViewContainerRef
} from '@angular/core';

import { FormGroup } from '@angular/forms';

import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';

import { UserService } from 'src/app/moveware/services/user-service';
import Utils from 'src/app/moveware/services/utils';

import { CacheService } from 'src/app/moveware/services/cache.service';

import { PageMappingService } from 'src/app/moveware/services/page-mapping.service';

import { FieldConfig } from '../components/form-components/field.interface';

@Directive({
    selector: '[dynamicField]'
})
export class DynamicFieldDirective implements OnInit {
    @Input() field: FieldConfig;
    @Input() group: FormGroup;
    @Input() parentViewFields: any;
    @Input() globalEventsNames: any;
    @Input() parentPageCode: string;
    //@Input() viewSelector: string;
    @Input() currentView: any;
    @Input() currentPage: any;
    @Input() currentRecord: any;
    //@Input() currentType: any;
    @Input() codeValue: any;
    @Input() viewMode: string;
    @Output() loadDynamicFilter = new EventEmitter();
    originalField: any;
    componentRef: any;
    @Input() translationContext: any;
    @Input() dataFields: any;

    constructor(
        private resolver: ComponentFactoryResolver,
        private container: ViewContainerRef,
        private mappings: PageMappingService,
        private userService: UserService,
        private cacheService: CacheService
    ) {}

    ngOnInit() {
        this.setField();
        if (this.field.CodeType && this.field.CodeType['CodeCode'] === 'Setting') {
            this.translationContext = 'Setting';
        } else if (this.currentPage) {
            this.translationContext = 'Data Form.' + this.currentView.CodeCode;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataFields'] && changes['dataFields'].currentValue) {
            this.dataFields = changes['dataFields'].currentValue;
            this.setValues();
        }

        if (changes['currentRecord']) {
            this.currentRecord = changes['currentRecord'].currentValue;
            this.setCurrentRecord();
        }

        if (changes['field']) {
            this.field = changes['field'].currentValue;
            this.setField();
        }
    }

    setCurrentRecord() {
        if (this.componentRef) {
            this.componentRef.instance.setCurrentRecord = this.currentRecord;
        }
    }

    setField() {
        if (this.field.CodeType && this.field.CodeType['CodeCode'] === 'Setting') {
            this.translationContext = 'Setting';
        } else if (this.currentPage) {
            this.translationContext = 'Data Form.' + this.currentView.CodeCode;
        }

        const ref = this;

        if (ref.dataFields && ref.dataFields[this.field.CodeCode] !== undefined) {
            if (
                ref.dataFields[this.field.CodeCode] &&
                ref.dataFields[this.field.CodeCode].CodeValue
            ) {
                this.field.CodeValue = ref.dataFields[this.field.CodeCode].CodeValue;
            } else {
                this.field.CodeValue = ref.dataFields[this.field.CodeCode];
            }
        }

        let options = [];

        if (
            ref.dataFields &&
            ref.dataFields[this.field.CodeCode] &&
            ref.dataFields[this.field.CodeCode].options
        ) {
            options = ref.dataFields[this.field.CodeCode].options;
        } else if (this.field.options) {
            options = this.field.options;
        }

        if (this.field && options && options.length) {
            let fieldData = Utils.parseOptions(
                options,
                this.field.CodeValue,
                this.field.CodeDisplay
            );

            if (fieldData.value) {
                this.field.CodeValue = fieldData.value;
            }

            this.field.options = Utils.getCopy(fieldData.options);
        }

        if (this.currentRecord) {
            this.setViewSelector(this.field, this.currentRecord);
        }

        if (this.currentRecord && this.currentRecord.mode == 'CREATE_MODE') {
            this.setParent(this.field);
        }

        if (this.field['isEditableCell']) {
            if (this.field.options && this.field.options.length) {
                if (this.codeValue && this.codeValue._id) {
                    this.field['CodeValue'] = Utils.findOption(
                        this.field.options,
                        this.codeValue._id
                    );
                } else if (this.codeValue instanceof Array) {
                    if (Utils.isArrayEmpty(this.field['CodeValue'])) {
                        this.field['CodeValue'] = [];
                    }

                    this.codeValue.forEach((value) => {
                        this.field['CodeValue'].push(Utils.findOption(this.field.options, value));
                    });
                } else {
                    this.field['CodeValue'] = Utils.findOption(this.field.options, this.codeValue);
                }
            } else {
                this.field['CodeValue'] = this.codeValue;
            }
        }

        this.setCodeEnabled();
        this.originalField = JSON.parse(JSON.stringify(this.field));
        let fieldType;

        if (!Utils.isObjectEmpty(this.field.CodeColumnFilterType)) {
            fieldType = this.field.CodeColumnFilterType;
        } else if (!Utils.isObjectEmpty(this.field.CodeFilterType)) {
            fieldType = this.field.CodeFilterType;
        } else if (!Utils.isObjectEmpty(this.field.CodeFieldType)) {
            if (typeof this.field.CodeFieldType === 'string') {
                fieldType = this.field.CodeFieldType;
            } else {
                fieldType = this.field.CodeFieldType['CodeCode'];
            }
        }

        if (!fieldType && this.field.options && this.field.options.length == 0) {
            fieldType = 'Text';
        } else if (fieldType && fieldType === 'Currency') {
            this.field.isCurrency = true;
            fieldType = 'Numeric Text';
        } else if (fieldType && fieldType === 'Double') {
            this.field.isDouble = true;
            fieldType = 'Numeric Text';
        } else if (
            (fieldType === 'Check Box' || fieldType?.toLowerCase() === 'boolean') &&
            this.field.options &&
            this.field.options.length > 0
        ) {
            fieldType = 'Check Box';
        } else if (
            fieldType &&
            (fieldType === 'Data' ||
                fieldType === 'Color' ||
                fieldType === 'Heading' ||
                fieldType?.toLowerCase() === 'boolean')
        ) {
            fieldType = 'Text';
        } else if (fieldType && fieldType === 'Number') {
            fieldType = 'Numeric Text';
        } else if (fieldType === 'Password') {
            fieldType = 'Password';
        } else if (fieldType === 'Color Picker') {
            fieldType = 'Color Picker';
        }

        if (this.field.CodeType === 'Taskbar') {
            fieldType = 'Taskbar';
        }

        if (!fieldType) {
            fieldType = 'Text';
        }

        const factory = this.resolver.resolveComponentFactory(
            StandardCodes.componentMapper[fieldType]
        );

        if (this.field.isHeader) {
            this.field['CodeEnabled'] = 'Yes';
        }

        if (
            !this.componentRef ||
            (this.componentRef &&
                this.componentRef.instance &&
                !this.field.isHeader &&
                this.componentRef.instance.field.CodeFieldType != fieldType)
        ) {
            if (this.componentRef) {
                this.componentRef.destroy();
            }

            this.componentRef = this.container.createComponent(factory);
        }

        this.field['isDirty'] = false;
        this.field['originalValue'] = Utils.getCopy(this.field.CodeValue)
            ? JSON.parse(JSON.stringify(this.field.CodeValue))
            : null;
        if (fieldType === 'Taskbar') {
            this.componentRef.instance.taskBar = this.field;
        }
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.translationContext = this.translationContext;
        this.componentRef.instance.group = this.group;
        this.componentRef.instance.parentPageCode = this.parentPageCode;
        this.componentRef.instance.currentRecord = this.currentRecord;
        this.componentRef.instance.currentView = this.currentView;
        this.componentRef.instance.currentPage = this.currentPage;
        this.componentRef.instance.selectedRecord = this.currentRecord;
        this.componentRef.instance.viewMode = this.viewMode;
        this.componentRef.instance.globalEventsNames = this.globalEventsNames;
        this.componentRef.instance['loadDynamicFilter'] = this.emitloadDynamicFilterEvent.bind(
            this
        );
        let currentUser = this.userService.getCurrentUserDetails();
        let languageInContext = JSON.parse(this.cacheService.getSessionData('language'));
        if (
            currentUser &&
            currentUser.preferred_username === 'translator' &&
            (this.field['CodeIsTranslatable'] === 'No' || !this.field['CodeIsTranslatable']) &&
            languageInContext.CodeCode !== 'def'
        ) {
            this.componentRef.instance.field.CodeEnabled = 'No';
        }
    }

    public emitloadDynamicFilterEvent(data) {
        this.loadDynamicFilter.emit(data);
    }

    private setCodeEnabled() {
        if (this.field && (this.field.CodeEnabled == undefined || this.field.CodeEnabled == null)) {
            this.field.CodeEnabled = StandardCodes.CODE_YES;
        }
    }

    private setValues() {
        if (this.componentRef) {
            let value = Utils.getValue(this.dataFields, this.field);

            if (this.dataFields && value !== undefined) {
                if (value && value.CodeValue) {
                    this.field.CodeValue = value.CodeValue;
                } else {
                    this.field.CodeValue = value;
                }
            } else {
                this.field.CodeValue = null;
            }

            let options = [];

            if (this.dataFields && value && value.options) {
                options = value.options;
            } else if (this.field.options) {
                options = this.field.options;
            }

            if (
                this.field &&
                options &&
                options.length &&
                this.field.CodeFieldType !== 'Text' &&
                this.field.CodeFieldType !== 'Notes'
            ) {
                let fieldData = Utils.parseOptions(
                    options,
                    this.field.CodeValue,
                    this.field.CodeDisplay
                );

                if (
                    (this.field.CodeFieldType == 'Check Box' ||
                        this.field.CodeFieldType == 'Multi Select Combo Box' ||
                        this.field.CodeFieldType == 'Combo Box' ||
                        this.field.CodeFieldType == 'Editable Combo Box') &&
                    fieldData.value
                ) {
                    this.field.CodeValue = fieldData.value;
                }

                this.field.options = Utils.getCopy(fieldData.options);
            }

            this.field['originalValue'] = Utils.getCopy(this.field.CodeValue);
            this.componentRef.instance.setField = this.field;
        }
    }

    private setViewSelector(field, record) {
        let viewSelectors = this.mappings.getViewSelectors(this.currentPage.containerID);

        if (viewSelectors && viewSelectors.indexOf(field.CodeCode) >= 0) {
            if (field.CodeCode && record[field.CodeCode]) {
                if (field.options && field.options.length) {
                    field.CodeValue = field.options.find((option) => {
                        return (
                            (record[field.CodeCode] && option._id === record[field.CodeCode]._id) ||
                            option._id === record[field.CodeCode] ||
                            option.label === record[field.CodeCode]
                        );
                    });
                } else {
                    field.CodeValue = record[field.CodeCode];
                }
            } else if (field.CodeValue) {
                if (field.options && field.options.length) {
                    field.CodeValue = field.options.find((option) => {
                        if (typeof field.CodeValue === 'string') {
                            return (
                                option.label === field.CodeValue || option._id === field.CodeValue
                            );
                        } else if (typeof field.CodeValue === 'object') {
                            return (
                                option.label === field.CodeValue.CodeCode ||
                                option._id === field.CodeValue._id
                            );
                        }
                    });
                }
            }

            if (this.componentRef && this.componentRef.instance) {
                this.componentRef.instance['value'] = field.CodeValue;
            }
        }
    }

    private setParent(field) {
        if (field.CodeCode === 'Parents' && this.currentRecord['createChild']) {
            let previousSelectedRecord = sessionStorage.getItem('previousSelectedRecord');

            field.CodeValue = field.options.find((option) => {
                return (
                    option.label === JSON.parse(previousSelectedRecord)._id ||
                    option._id === JSON.parse(previousSelectedRecord)._id
                );
            });
        }
    }
}
