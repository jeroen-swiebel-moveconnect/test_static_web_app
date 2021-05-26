import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FieldConfig } from '../field.interface';
import Utils from 'src/app/moveware/services/utils';

import { ContextService } from 'src/app/moveware/services/context.service';
import { StandardCodes } from 'src/app/moveware/constants/StandardCodes';
import {
    RuleChangeEventArgs,
    QueryBuilderComponent,
    ChangeEventArgs
} from '@syncfusion/ej2-angular-querybuilder';
import { RuleModel } from '@syncfusion/ej2-querybuilder';
import { CollectionsService } from 'src/app/moveware/services';
import { Broadcaster } from 'src/app/moveware/services/broadcaster';
import { extend } from '@syncfusion/ej2-base/src';

/**
 *
 *
 *
 */

@Component({
    selector: 'query-builder',
    templateUrl: './query-builder.component.html',
    styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilder implements OnInit {
    @Input() field: FieldConfig;
    @Input() currentView: any;
    @Input() currentRecord: any;
    @Input() currentPage: any;
    @Input() translationContext: any;

    isTableHeader: boolean;
    fieldLabel: string;
    Options: any;
    rulesData: RuleModel;
    dynamicFields: Object = {};
    valueChangeEvent: any;
    sqlRule: string;
    rawRules: any;
    @ViewChild('querybuilder') qryBldrObj: QueryBuilderComponent;
    private sqlRuleObject: any;
    public OperatorFields: Object = { text: 'Name', value: 'Value' };
    public fields: Object = { text: 'label', value: '_id' };
    public operators: { [key: string]: Object }[];
    //Dialog properties

    public animationSettings: Object = { effect: 'Zoom', duration: 400 };
    public displayDialog: Boolean = false;
    public promptHeader: string = 'Rule';
    isFieldChange: boolean = false;
    constructor(
        private contextService: ContextService,
        private collectionService: CollectionsService,
        private broadcaster: Broadcaster
    ) {}

    ngOnInit() {
        this.fieldLabel = this.translationContext
            ? this.translationContext + '.' + this.field.CodeCode
            : this.field.CodeCode;
        this.isTableHeader =
            !Utils.isObjectEmpty(this.currentView) &&
            !this.field['isTableCell'] &&
            this.currentView['CodeType'] !== StandardCodes.CODE_TYPE_DATA_FORM;
        this.field.dataClass = !this.isTableHeader
            ? 'data' + this.currentView['_id'] + this.field._id
            : '';
        this.field.headerClass = !this.isTableHeader
            ? 'header' + this.currentView['_id'] + this.field._id
            : '';

        this.Options = this.field.options;
        if (!Utils.isArrayEmpty(this.Options)) {
            this.loadOperators();
        }

        this.onValueChange();
    }

    /**
     * <p> To load the Operators in query builder component</p>
     */
    private loadOperators(): void {
        this.collectionService.loadCodes('Operator').subscribe((_operators) => {
            this.operators = this.getParsedOperators(_operators);
            if (this.field.CodeValue) {
                this.setRule();
            }
        });
    }

    /**
     * <p> to append ruleId while rule condion changes and handling rule changes of inseer,delete. </p>
     * @param event : Rule change event
     */
    change(args: ChangeEventArgs): void {
        let ID: string;
        if (args.type == 'insertRule' && args.ruleID) {
            let rule: RuleModel = this.qryBldrObj.getRule(args.ruleID);
            (rule as any).custom = { ruleId: args.ruleID };
        }
        if (args.type === 'deleteRule') {
            this.qryBldrObj.setRules(this.qryBldrObj.getValidRules(this.qryBldrObj.rule));
        }
    }
    /**
     * <p> To set Rules. </p>
     * @param isChanged : specifies whether any changes are made to rules.
     */
    private setRule(isChanged?): void {
        let jsonRule = {
            condition: this.qryBldrObj.rule.condition,
            rules: this.qryBldrObj.rule.rules
        };
        if (isChanged) {
            this.rulesData = jsonRule;
        }
        this.field.CodeValue = jsonRule;
        let rules = extend({}, this.qryBldrObj.getValidRules());
        this.replaceRuleValue(rules);
        this.sqlRule = this.qryBldrObj.getSqlFromRules(rules);
    }

    /**
     * <p> To replace rule Value from Id to label. </p>
     * @param rulesData : list of rules that are configured.
     */
    private replaceRuleValue(rulesData) {
        if (rulesData?.rules) {
            rulesData.rules.forEach((rule) => {
                this.replaceRuleValue(rule);
            });
        } else if (rulesData?.field) {
            let field = this.dynamicFields[rulesData?.custom?.ruleId];
            if (field?.options) {
                const fieldData = Utils.parseOptions(field?.options, rulesData.value, null);
                if (fieldData?.value?.length) {
                    let tempOption = [];
                    fieldData?.value?.forEach((value) => {
                        if (value) {
                            tempOption.push(value.label);
                        }
                    });
                    rulesData.value = tempOption;
                } else if (fieldData?.value) {
                    rulesData.value = fieldData?.value?.label;
                } else {
                    rulesData.value = rulesData.value;
                }
            } else {
                rulesData.value = rulesData.value;
            }

            if (field?.CodeDataType) {
                let ruleType = 'string';
                if (field.CodeDataType === 'Integer' || field.CodeDataType === 'Double') {
                    ruleType = 'number';
                }
                rulesData.type = ruleType;
            }
        }
    }

    /**
     *
     * @param operators
     */
    private getParsedOperators(operators): Array<any> {
        let _operators = [];
        operators.forEach((operator) => {
            let _value = Utils.getOperatorText(operator.CodeCode);
            _operators.push({
                Name: operator.CodeDescription,
                Value: _value,
                sqlOperator: _value
            });
        });
        return _operators;
    }

    /**
     * <p> To set the currentRecord object </p>
     * @param {any} currentRecord: currentRecord to be set
     */
    set setCurrentRecord(currentRecord) {
        this.currentRecord = currentRecord;
    }

    actionBegin(event) {
        if (
            event &&
            (event.action === 'insert-rule' || event.action === 'field') &&
            event.rule &&
            (typeof event.rule.value === 'undefined' ||
                (!event.rule.field && !event.rule.operator)) &&
            !this.isFieldChange
        ) {
            event.rule = {};
        }
        if (this.isFieldChange) {
            this.isFieldChange = false;
            event.rule.operator = '';
        }
    }
    /**
     * <p> To mark the field dirty and change state of the form </p>
     */
    markDirty(): void {
        this.contextService.saveDataChangeState();
        this.field.isDirty = true;
        this.setRule(true);
    }

    /**
     * <p> To be called when there is a change in field of a rule</p>
     *
     * @param e : Field change event
     */
    fieldChange(e: any, data): void {
        if (e.isInteracted) {
            let index = Utils.getIndexByProperty(this.field.options, 'CodeCode', e.value);
            let option = this.field.options[index];
            this.isFieldChange = true;
            this.notifyChange(e?.value, e?.element, 'field');
            this.setDynamicField(option, data);
        }
    }
    /**
     * <p> To be called when there is a change in operator of a rule</p>
     *
     * @param e : Operator change event
     */
    operatorChange(e: any, rule): void {
        if (e.isInteracted) {
            this.notifyChange(e?.value, e?.element, 'operator');
            if (
                this.dynamicFields &&
                rule?.custom?.ruleId &&
                this.dynamicFields[rule.custom.ruleId]
            ) {
                let filterType = this.dynamicFields[rule.custom.ruleId]['CodeFieldType'];
                if (rule.operator === 'in' || rule.operator === 'notin') {
                    if (filterType === 'Combo Box') {
                        if (
                            this.dynamicFields[rule.custom.ruleId]['OriginalCodeFieldType'] &&
                            this.dynamicFields[rule.custom.ruleId]['OriginalCodeFieldType'] !=
                                'Combo Box'
                        ) {
                            filterType = this.dynamicFields[rule.custom.ruleId][
                                'OriginalCodeFieldType'
                            ];
                        } else {
                            filterType = 'Multi Select Combo Box';
                        }
                    }
                } else if (rule.operator === 'startswith') {
                    filterType = 'Text';
                }

                if (filterType != this.dynamicFields[rule.custom.ruleId]['CodeFilterType']) {
                    this.dynamicFields[rule.custom.ruleId].CodeValue = null;
                    this.dynamicFields[rule.custom.ruleId].CodeFilterType = filterType;
                }
            }
        }
    }

    /**
     * <p> To create dynamic fields as a rule value</p>
     *
     * @param e : Field change event
     */
    setDynamicField(ruleField, rule): void {
        let fieldValue = rule?.value;
        const data = this.collectionService.getOptions(this.field._id, null, ruleField['_id']);
        data.subscribe(async (_response) => {
            let newField = JSON.parse(_response.body);
            let fieldData;
            if (newField.options) {
                fieldData = Utils.parseOptions(newField.options, fieldValue, null);
                if (!fieldData?.value && fieldValue) {
                    fieldData.value = fieldValue;
                }
            } else {
                fieldData = newField;
                fieldData.value = fieldValue;
            }
            newField.CodeValue = fieldData.value;
            newField.CodeEnabled = 'Yes';
            newField.CodeVisible = true;
            newField.CodeActions = null;
            newField.options = fieldData.options;
            newField.CodeHideLabel = true;
            newField.CodeValue = fieldData.value;
            newField.isRuleValue = true;
            newField.CodeColumnFilterType = null;
            newField.CodeFilterType = newField.CodeFieldType;
            newField['OriginalCodeFieldType'] = newField.CodeFieldType;

            switch (newField.CodeFilterType) {
                case 'Multi Select Combo Box':
                case 'Multi Select Tree Combo Box':
                case 'Dropdown Tree':
                    if (newField.CodeValue && !newField.CodeValue.length) {
                        newField.CodeFilterType = 'Combo Box';
                    }
                    break;
                case 'Combo Box':
                    if (newField.CodeValue) {
                        if (typeof newField.CodeValue === 'object' && newField.CodeValue.length) {
                            newField.CodeFilterType = 'Multi Select Combo Box';
                        } else if (typeof newField.CodeValue === 'string') {
                            newField.CodeFilterType = 'Text';
                        }
                    }
                    break;
                case 'Switch':
                case 'Check Box':
                case 'Time':
                case 'Currency':
                case 'Number':
                    break;
                default:
                    newField.CodeFieldType = 'Text';
                    newField.CodeFilterType = 'Text';
                    break;
            }
            if (rule?.custom?.ruleId) {
                this.dynamicFields[rule.custom.ruleId] = newField;
            } else if (rule?.ruleID) {
                this.dynamicFields[rule.ruleID.toString().substr(13)] = newField;
            }
        });
    }

    private notifyChange(value, elem, type, sqlValue?: any) {
        this.qryBldrObj.notifyChange(value, elem, type);
    }
    /**
     * <p> To be called for rule value change</p>
     *
     * @param e : Rule value change event
     */

    onValueChange() {
        this.valueChangeEvent = this.broadcaster
            .on(this.currentView._id + 'ruleValue')
            .subscribe((event) => {
                let value;
                let valueCode;
                let ruleValue = event['value'];
                if (Array.isArray(ruleValue)) {
                    if (ruleValue.length > 0) {
                        if (typeof ruleValue[0] == 'object') {
                            value = Utils.getArrayOfProperties(ruleValue, '_id');
                            valueCode = Utils.getArrayOfProperties(ruleValue, 'label');
                        } else {
                            value = ruleValue;
                            valueCode = ruleValue;
                        }
                    } else {
                        value = ruleValue;
                        valueCode = ruleValue;
                    }
                } else if (typeof ruleValue == 'object') {
                    value = ruleValue['_id'];
                    valueCode = ruleValue['label'];
                } else {
                    value = ruleValue;
                    valueCode = ruleValue;
                }
                this.notifyChange(value, event['sourceElement'].element, 'value', valueCode);
            });
    }

    /**
     * <p> To load dynamic fields of Rule value</p>
     * @param rulesData : querybuilder rule
     */
    private loadDynamicFields(rulesData): void {
        if (rulesData) {
            if (rulesData.rules) {
                this.loadDynamicFields(rulesData.rules);
            } else {
                for (const rule of rulesData) {
                    let index = Utils.getIndexByProperty(
                        this.field.options,
                        'CodeCode',
                        rule['field']
                    );
                    if (index >= 0) {
                        let ruleField = this.field.options[index];
                        this.setDynamicField(ruleField, rule);
                    } else if (index < 0 && rule.condition) {
                        this.loadDynamicFields(rule.rules);
                    }
                }
            }
        }
    }

    /**
     * <p> to set Field's CodeValue to fieldvalue and applySettings and Subscribes to Parent Fields </p>.
     *
     * @param field : holds the details of field and assigns CodeValue of field to fieldValue.
     */
    set setField(field) {
        this.field = field;
        if (this.field.CodeValue && !Utils.isArrayEmpty(this.field.CodeValue.rules)) {
            this.parseRuleOperators(this.field.CodeValue.rules);
        }
        if (this.field.CodeValue) {
            this.rulesData = this.field.CodeValue;
        } else {
            this.rulesData = null;
            this.sqlRule = null;
        }

        this.qryBldrObj.rule = this.rulesData;
        this.loadDynamicFields(this.rulesData);
        //  this.qryBldrObj.refresh();
        if (!this.operators) {
            this.loadOperators();
        } else if (this.rulesData) {
            this.setRule();
        }
    }

    private parseRuleOperators(rulesArray) {
        rulesArray.forEach((rule) => {
            let ruleOperator = '';
            if (rule.operator) {
                ruleOperator = Utils.getOperatorText(rule.operator);
                if (ruleOperator) {
                    rule.operator = ruleOperator;
                }
            } else if (rule.rules) {
                this.parseRuleOperators(rule.rules);
            }
        });
    }

    showDialog() {
        this.displayDialog = true;
        if (this.rulesData && !Utils.isArrayEmpty(this.rulesData.rules)) {
            this.parseRuleOperators(this.rulesData.rules);
        }
        this.qryBldrObj.setRules(this.rulesData);
        this.setRule();
    }

    onCancel(rulesData) {
        if (rulesData && !Utils.isArrayEmpty(rulesData.rules)) {
            rulesData.rules.forEach((rule) => {
                if (rule.rules) {
                    this.onCancel(rule);
                } else {
                    if (rule.field && this.dynamicFields[rule['custom']?.ruleId]?.options) {
                        const fieldData = Utils.parseOptions(
                            this.dynamicFields[rule['custom']?.ruleId].options,
                            rule.value,
                            null
                        );
                        this.dynamicFields[rule['custom']?.ruleId].CodeValue = fieldData.value;
                    } else {
                        this.dynamicFields[rule['custom']?.ruleId].CodeValue = rule?.value;
                    }
                }
            });
            this.field.CodeValue = Utils.getCopy(this.rulesData);
            this.replaceRuleValue(this.field.CodeValue);
            this.sqlRule = this.qryBldrObj.getSqlFromRules(this.field.CodeValue);
        } else {
            this.sqlRule = '';
        }
    }

    /**
     * <p> to clear rule on click of clear button. </p>.
     *
     */
    onRemove() {
        this.sqlRule = '';
        this.rulesData = null;
        this.contextService.saveDataChangeState();
        this.field.isDirty = true;
        this.field.CodeValue = null;
    }

    ngOnDestroy() {
        if (this.valueChangeEvent) {
            this.valueChangeEvent.unsubscribe();
        }
    }
}
