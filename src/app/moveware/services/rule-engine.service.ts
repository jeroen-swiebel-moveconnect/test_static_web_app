import { Injectable } from '@angular/core';
import { Engine } from 'json-rules-engine';
import Utils from './utils';
import { QuickTextHandlerService } from './quick-text-handler.service';

@Injectable({
    providedIn: 'root'
})
export class RuleEngineService {
    constructor(private quickTextHandler: QuickTextHandlerService) {}

    public runRule(rules, facts) {
        if (rules) {
            let engine = new Engine();
            engine.addRule({
                conditions: rules,
                event: {
                    type: 'scuccess',
                    params: {
                        message: 'Rule Executed successifully'
                    }
                }
            });
            return engine.run(facts);
        }
    }
    async processSettings(record: string, views, settingType, currentView?: any) {
        try {
            let processedObjects = Utils.getCopy(views);
            await this.processRules(processedObjects, record, settingType, currentView);
            return processedObjects;
        } catch {
            console.error('Error while processing rules');
        }
    }
    async processRules(processedObjects, record, settingType, currentView?: any) {
        await Promise.all(
            Object.keys(processedObjects).map(async (viewId) => {
                //await views.forEach((view, index) => {
                let settings = processedObjects[viewId].CodeSettings;
                if (settings && settings.length) {
                    await Promise.all(
                        settings.map(async (setting) => {
                            let targetField = setting.SettingField;
                            let targetValue = setting.SettingValue;
                            if (setting.SettingRule) {
                                let ruleConditions = Utils.getRuleFactKeys(setting.SettingRule);
                                if (ruleConditions) {
                                    let facts = this.getFactsObject(
                                        ruleConditions,
                                        record,
                                        settingType,
                                        currentView
                                    );
                                    setting.SettingRule = this.processRuleValues(
                                        setting.SettingRule
                                    );
                                    let factCheckCount = 0;
                                    Object.keys(facts).forEach((factKey) => {
                                        if (!facts[factKey]) {
                                            factCheckCount++;
                                        }
                                    });
                                    if (factCheckCount === Object.keys(facts).length) {
                                        return;
                                    }
                                    let rule = this.runRule(setting.SettingRule, facts);
                                    await rule.then((results) => {
                                        if (results && results.events.length) {
                                            processedObjects[viewId]['hidden'] = targetValue
                                                ? false
                                                : true;

                                            processedObjects[viewId][
                                                targetField
                                            ] = this.parseTargetValue(targetValue);
                                        }
                                    });
                                }
                            }
                        })
                    );
                }
            })
        );

        // return processedView;
    }

    private parseTargetValue(value) {
        if (typeof value == 'object') {
            return value.CodeCode;
        } else if (typeof value == 'string' && value.startsWith('@@')) {
            return this.quickTextHandler.getComputedValue(value);
        } else {
            return value;
        }
    }
    private processRuleValues(value) {
        if (value) {
            Object.keys(value).forEach((key) => {
                value[key].forEach((condition) => {
                    let ruleValue = condition.value;
                    if (typeof ruleValue === 'string' && ruleValue.startsWith('@@')) {
                        condition.value = this.quickTextHandler.getComputedValue(ruleValue);
                        if (typeof condition.value === 'object' && condition.operator === 'in') {
                            condition.value = [];
                        }
                    }
                });
            });
        }
        return value;
    }

    private getFactsObject(ruleConditions, record, type, currentView) {
        let facts = {};
        ruleConditions.forEach((condition) => {
            if (condition.startsWith('@@')) {
                //   this.quickTextHandler.currentRecord = record;
                facts[condition] = this.quickTextHandler.getComputedValue(condition);
                if (typeof facts[condition] === 'object') {
                    facts[condition] = facts[condition]['CodeCode']
                        ? facts[condition]['CodeCode']
                        : facts[condition];
                }
            } else if (condition === 'Mode') {
                if (record['_id']) {
                    facts[condition] = 'VIEW_UPDATE_MODE';
                } else {
                    facts[condition] = 'CREATE_MODE';
                }
            } else if (type === 'Field') {
                var fieldInParent = Utils.getUIElementByCode(currentView.UIElements, condition);
                let searchStr, parentFieldValue;
                if (fieldInParent) {
                    parentFieldValue = fieldInParent['CodeValue'];
                }
                if (
                    parentFieldValue &&
                    parentFieldValue.CodeCode &&
                    parentFieldValue.CodeCode != null
                ) {
                    searchStr = parentFieldValue ? parentFieldValue['CodeCode'] : null;
                } else {
                    searchStr = parentFieldValue ? parentFieldValue['label'] : null;
                }
                facts[condition] = searchStr;
            } else if (type === 'Button') {
                facts[condition] = condition;
            } else {
                if (record) {
                    let factValue = record[condition] || '';
                    if (typeof factValue === 'object') {
                        factValue = factValue['CodeCode'];
                    }
                    facts[condition] = factValue;
                } else {
                    facts[condition] = '';
                }
            }
        });
        return facts;
    }
}
